/**
 * Created by Machine on 20-Mar-17.
 */

'use strict'

const Config = require('../config')
const FB = require('../connectors/facebook')
const Wit = require('node-wit').Wit
const log = require('node-wit').log

const actions = {
  /**
   * Send takes 2 parameters: request and response
   * request: sessionId, context, text, entities
   * response: text, quickreplies
   *
   * Send is special action
   */
  send(request, response) {
    return new Promise(function(resolve, reject) {
      let recipientId = request.context._fbid_
      if (recipientId) {
        FB.sendTypingOn(recipientId)
        FB.sendTextMessage(recipientId, response.text)
        FB.sendTypingOff(recipientId)
        // FB.sendQuickReply(recipientId)
      } else {
        console.error("Oops! Couldn't find user for session:", request.sessionId)
      }
      return resolve()
    })
  },
  firstGreeting(ctx) {
    return Promise.resolve(ctx.context)
  },
  emOk(ctx) {
    return Promise.resolve(ctx.context)
  },
  getForecast (ctx) {
    let context = ctx.context,
      entities = ctx.entities
    return new Promise(function(resolve, reject) {
      context.forecast = 'nắng lắm'
      return resolve(context)
    })
  }
}

// SETUP THE WIT.AI SERVICE
let getWit = function () {
  console.log('WIT hugs me now!!')
  return new Wit({
    accessToken: Config.WIT_TOKEN,
    actions,
    logger: new log.Logger(log.DEBUG)
  })
}

module.exports = {
  getWit: getWit
}
