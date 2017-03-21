/**
 * Created by Machine on 20-Mar-17.
 */

'use strict'

const Config = require('../config')
const FB = require('../connectors/facebook')
const Wit = require('node-wit').Wit
const log = require('node-wit').log
const request = require('request')
const fetch = require('node-fetch')

let sessions = {}

// ----------------------------------------------------------------------------
// Messenger API specific code

// See the Send API reference
// https://developers.facebook.com/docs/messenger-platform/send-api-reference
const fbMessage = function (id, text) {
  const body = JSON.stringify({
    recipient: {id},
    message: {text}
  })
  const qs = 'access_token' + encodeURIComponent(Config.FB_PAGE_TOKEN)
  return fetch('https://graph.facebook.com/me/messages?' + qs, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  }).then(function (rsp) {
    return rsp.json()
  }).then(function (json) {
    if (json.error && json.error.message) {
      throw new Error(json.error.message)
    }
    return json
  })
}

const actions = {
  send(sessionId, text) {
    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belogs to
    const recipientId = sessions[sessionId].fbid
    if (recipientId) {
      // We found our recipient!
      // Let's forward our bot response to her.
      // We return a promise to left our bot know when we're done sending
      return fbMessage(recipientId, text)
        .then(function () {
          return null
        }).catch(function (err) {
          console.error(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err.stack || err
          );
        })
    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      return Promise.resolve()
    }
  }
}

// SETUP THE WIT.AI SERVICE
let getWit = function () {
  console.log('GRABBING WIT')
  return new Wit({
    accessToken: Config.WIT_TOKEN,
    actions,
    logger: new log.Logger(log.INFO)
  })
}

module.exports = {
  getWit: getWit
}

// BOT TESTING MODE
if (require.main === module) {
  console.log('Bot testing mode!')
  let client = getWit()
  client.interactive()
}
