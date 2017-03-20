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
const fbMessage = function(id, text) {
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

const firstEntityValue = function (entities, entity) {
  let val = entities && entities[entity] &&
      Array.isArray(entities[entity]) &&
      entities[entity].length > 0 &&
      entities[entity][0].value
  if (!val) {
    return null
  }
  return typeof val === 'object' ? val.value : val
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
        }).catch(function(err) {
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
  },
  say (sessionId, context, message, cb) {
    // Bot testing mode, run cb() and return
    if (require.main === module) {
      cb()
      return
    }
    console.log('WIT WANTS TO TALK TO:', context._fbid_)
    console.log('WIT HAS SOMETHING TO SAY:', message)
    console.log('WIT HAS A CONTEXT:', context)

    if (checkURL(message)) {
      FB.newMessage(context._fbid_, message, true)
    } else {
      FB.newMessage(context._fbid_, message)
    }
    cb()
  },
  merge(sessionId, context, entities, message, cb) {
    // Reset the weather story
    delete context.forecast

    // Retrive the location entity and store it in the context field
    let loc = firstEntityValue(entities, 'location')
    if (loc) {
      context.loc = loc
    }

    // Reset the cutepics story
    delete context.pics

    // Retrieve the category
    let category = firstEntityValue(entities, 'category')
    if (category) {
      context.cat = category
    }

    // Retrieve the sentiment
    let sentiment = firstEntityValue(entities, 'sentiment')
    if (sentiment) {
      context.ack = sentiment === 'positive' ? 'Glad your liked it!' : 'Aww, that sucks.'
    } else {
      delete context.ack
    }

    cb(context)
  },

  error(sessionId, context, error) {
    console.log(error.message)
  },

  // list of functions Wit.ai can execute
  ['fetch-weather'](sessionId, context, cb) {
    // Here we can place an API call to a weather service
    // if (context.loc) {
    // 	getWeather(context.loc)
    // 		.then(function (forecast) {
    // 			context.forecast = forecast || 'sunny'
    // 		})
    // 		.catch(function (err) {
    // 			console.log(err)
    // 		})
    // }

    context.forecast = 'Sunny'

    cb(context)
  },

  ['fetch-pics'](sessionId, context, cb) {
    let wantedPics = allPics[context.cat || 'default']
    context.pics = wantedPics[Math.floor(Math.random() * wantedPics.length)]

    cb(context)
  },
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

// GET WEATHER FROM API
let getWeather = function (location) {
  return new Promise(function (resolve, reject) {
    let url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22'+ location +'%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let jsonData = JSON.parse(body)
        let forecast = jsonData.query.results.channel.item.forecast[0].text
        console.log('WEATHER API SAYS....', jsonData.query.results.channel.item.forecast[0].text)
        return forecast
      }
    })
  })
}

// CHECK IF URL IS AN IMAGE FILE
let checkURL = function (url) {
  return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

// LIST OF ALL PICS
let allPics = {
  corgis: [
    'http://i.imgur.com/uYyICl0.jpeg',
    'http://i.imgur.com/useIJl6.jpeg',
    'http://i.imgur.com/LD242xr.jpeg',
    'http://i.imgur.com/Q7vn2vS.jpeg',
    'http://i.imgur.com/ZTmF9jm.jpeg',
    'http://i.imgur.com/jJlWH6x.jpeg',
    'http://i.imgur.com/ZYUakqg.jpeg',
    'http://i.imgur.com/RxoU9o9.jpeg',
  ],
  racoons: [
    'http://i.imgur.com/zCC3npm.jpeg',
    'http://i.imgur.com/OvxavBY.jpeg',
    'http://i.imgur.com/Z6oAGRu.jpeg',
    'http://i.imgur.com/uAlg8Hl.jpeg',
    'http://i.imgur.com/q0O0xYm.jpeg',
    'http://i.imgur.com/BrhxR5a.jpeg',
    'http://i.imgur.com/05hlAWU.jpeg',
    'http://i.imgur.com/HAeMnSq.jpeg',
  ],
  default: [
    'http://blog.uprinting.com/wp-content/uploads/2011/09/Cute-Baby-Pictures-29.jpg',
  ],
};
