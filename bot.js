/**
 * Created by Machine on 20-Mar-17.
 */

'use strict'

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
  // Let's find the user
  let sessionId = findOrCreateSession(sender)
  // Let's forward the message to the Wit.ai bot engine
  // This all run all actions until there are no more actions left to do
  wit.runActions(
    sessionId, // the user's current session by id
    message, // the user's message
    sessions[sessionId].context // the user's session state
  ).then(function (context) {
    console.log('Waiting for next user message\n');
    if (context['done']) {
      delete sessions[sessionId];
    }
  }).catch(function (err) {
    console.error('Oops! Got an error from Wit:', err.stack || err)
  })
}

module.exports = {
  findOrCreateSession: findOrCreateSession,
  read: read
}
