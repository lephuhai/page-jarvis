/**
 * Created by Machine on 20-Mar-17.
 */

'use strict'

let express= require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  Config  = require('./config'),
  FB = require('./connectors/facebook'),
  crypto = require('crypto'),
  Bot = require('./bot')

const verifyRequestSignature = function (req, res, buf) {
  let signature = req.headers['x-hub-signature']
  if (!signature) {
    // For testing, let's log an error. In production, you should thrown an error
    console.error("Couldn't validate the signature.")
  } else {
    let elements = signature.split('=')
    let method = elements[0]
    let signatureHash = elements[1]

    let expectedHash = crypto.createHmac('sha1', Config.FB_APP_SECRET)
      .update(buf)
      .digest('hex')

    if (signatureHash !== expectedHash) {
      throw new Error("Couldn't validate the request signature.")
    }
  }
}

// Let's make a server!
const app = express()
app.set('port', (process.env.PORT) || 1337)

app.use(bodyParser.json({verify: verifyRequestSignature}))

app.listen(app.get('port'), function () {
  console.log('Running on port', app.get('port'))
})

app.get('/', function(req, res) {
  res.send('hello world! I"m Jarvis,')
})

// for facebook to verify
app.get('/webhooks', function (req, res) {
  console.log(`* Hub mode: ${req.query['hub.mode']}
  * Hub verify token: ${req.query['hub.verify_token']}
  * Server verify token: ${Config.FB_VERIFY_TOKEN}`)
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
    console.log(`Hub Challenge: ${req.query['hub.challenge']}`)
    res.status(200).send(req.query['hub.challenge'])
  } else {
    res.status(400).send('Error, wrong token')
  }
})

// to send message to facebook
app.post('/webhooks', function (req, res) {
  let entry = FB.getMessageEntry(req.body)
  // IS THE ENTRY A VALID MESSAGE?
  if (entry && entry.message) {
    if (entry.message.attachments) {
      // not smart enough for attachments yet
      FB.newMessage(entry.sender.id, "That's interesting!")
    } else {
      // send to bot for processing
      Bot.read(entry.sender.id, entry.message.text, function (sender, reply) {
        FB.newMessage(sender, reply)
      })
    }
  }
  res.sendStatus(200)
})
