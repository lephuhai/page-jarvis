/**
 * Created by Machine on 20-Mar-17.
 */

'use strict'

const Config = require('./config')
const wit = require('./services/wit').getWit()

// LETS SAVE USER SESSIONS
let sessions = {}

const findOrCreateSession = function (fbid) {
  let sessionId

  // DOES USER SESSION ALREADY EXIST?
  Object.keys(sessions).forEach(function (k) {
    if (sessions[k].fbid === fbid) {
      // Yep, got it
      sessionId = k
    }
  })

  // No session so we will create one
  if (!sessionId) {
    sessionId = new Date().toISOString()
    sessions[sessionId] = {
      fbid: fbid,
      context: {
        _fbid_: fbid
      }
    }
  }
  return sessionId
}

let read = function (sender, message, reply) {
  if (message === 'hello') {
    // Let's reply back hello
    message = 'Hello yourself! I"m Jarvis"'
    reply(sender, message)
  } else {
    // Let's find the user
    let sessionId = findOrCreateSession(sender)
    // Let's forward the message to the Wit.ai bot engine
    // This all run all actions until there are no more actions left to do
    wit.runActions(
      sessionId, // the user's current session by id
      message, // the user's message
      sessions[sessionId].context, // the user's session state
      function (error, context) {
        if (error) {
          console.log('oops!', error)
        } else {
          // Wit.ai run all the actions
          // Now it needs more messages
          console.log('Waiting for further messages')
          // Based on the session state, you might want to reset the session
          // Example:
          // if (context['done']) {
          // 	delete sessions[sessionId]
          // }

          // Updating the user's current session state
          sessions[sessionId].context = context
        }
      }
    )
  }
}

module.exports = {
  findOrCreateSession: findOrCreateSession,
  read: read
}
