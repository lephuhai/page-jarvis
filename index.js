/**
 * Created by Machine on 20-Mar-17.
 */

'use strict'

let express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  Config = require('./config'),
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

const app = express()
app.set('port', (process.env.PORT) || 1337)

app.use(bodyParser.json({verify: verifyRequestSignature}))

app.listen(app.get('port'), function () {
  console.log('Running on port', app.get('port'))
})

app.get('/', function (req, res) {
  res.send('I"m Jarvis owned by Machine,')
})

// for facebook to verify
app.get('/webhooks', function (req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge'])
  } else {
    res.status(400).send('Error, wrong token')
  }
})

app.post('/webhooks', function (req, res) {
  let data = req.body
  // Make sure this is a page subscription
  if (data.object === 'page') {
    data.entry.forEach(function (pageEntry) {
      pageEntry.messaging.forEach(function (messagingEvent) {
        if (messagingEvent.message) {
          if (messagingEvent.message.attachments) {
            FB.sendTextMessage(messagingEvent.sender.id, "That's interesting! I can only process text message for now.")
          } else {
            Bot.read(messagingEvent.sender.id, messagingEvent.message.text)
          }
        }
      })
    })
    res.sendStatus(200)
  }
})
