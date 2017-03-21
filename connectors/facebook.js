/**
 * Created by Machine on 20-Mar-17.
 */

'use strict'

const request = require('request')
const fetch = require('node-fetch')
const Config = require('../config')

// Or using it, return a promise
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

// SETUP A REQUEST TO FACEBOOK SERVER
const newRequest = request.defaults({
  uri: 'https://graph.facebook.com/me/messages',
  method: 'POST',
  json: true,
  qs: {
    access_token: Config.FB_PAGE_TOKEN
  },
  headers: {
    'Content-Type': 'application/json'
  }
})

const newMessage = function (recipientId, msg, atts, cb) {
  let message = {}
  let opts = {
    form: {
      recipient: {
        id: recipientId
      }
    }
  }
  if (atts) {
    message.attachment = {
      'type': 'image',
      'payload': {
        'url': msg
      }
    }
  } else {
    message.text = msg
  }
  opts.form.message = message

  newRequest(opts, function (err, resp, data) {
    if (cb) {
      cb(err || data.error && data.error.message, data)
    }
  })
}

// PARSE A FACEBOOK MESSAGE to get user, message body, or attachment
// https://developers.facebook.com/docs/messenger-platform/webhook-reference
let getMessageEntry = function (body) {
  let val = body.object === 'page' && body.entry &&
    Array.isArray(body.entry) &&
    body.entry.length > 0 &&
    body.entry[0] &&
    body.entry[0].messaging &&
    Array.isArray(body.entry[0].messaging) &&
    body.entry[0].messaging.length > 0 &&
    body.entry[0].messaging[0]

  return val || null
}

module.exports = {
  newRequest: newRequest,
  newMessage: newMessage,
  getMessageEntry: getMessageEntry
}
