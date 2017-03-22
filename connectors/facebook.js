/**
 * Created by Machine on 20-Mar-17.
 */

'use strict'

const request = require('request')
const fetch = require('node-fetch')
const Config = require('../config')
const slug = require('slug')

const callSendAPI = function (messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: Config.FB_PAGE_TOKEN},
    method: 'POST',
    json: messageData
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let recipientId = body.recipient_id
      let messageId = body.message_id
      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId)
      } else {
        console.log("Successfully called Send API for recipient %s", recipientId)
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error)
    }
  })
}

const sendTextMessage = function (recipientId, messageText) {
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: 'DEV_HACKING'
    }
  }
  callSendAPI(messageData)
}

const sendMessageType = function (recipientId, type, payload) {
  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: type,
        payload: payload
      }
    }
  }

  callSendAPI(messageData)
}

const sendQuickReply = function (recipientId, payload) {
  let message = {
    text: payload.text,
    quick_replies: payload.quick_replies.map(function (item) {
      return {
        "content_type": "text",
        "title": item,
        "payload": slug(item, '_')
      }
    })
  }

  let messageData = {
    recipient: {
      id: recipientId
    },
    message: message
  }
  callSendAPI(messageData)
}

const sendReadReceipt = function (recipientId) {
  let messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'mark_seen'
  }
  callSendAPI(messageData)
}

const sendTypingOn = function (recipientId) {
  let messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'typing_on'
  };

  callSendAPI(messageData);
}

const sendTypingOff = function (recipientId) {
  let messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: 'typing_off'
  };

  callSendAPI(messageData);
}

const sendMessageTemplate = function (event) {
  let senderID = event.sender.id;
  let recipientID = event.recipient.id;
  let timeOfMessage = event.timestamp;
  let message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  let isEcho = message.is_echo;
  let messageId = message.mid;
  let appId = message.app_id;
  let metadata = message.metadata;

  // You may get a text or attachment but not both
  let messageText = message.text;
  let messageAttachments = message.attachments;
  let quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s",
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    let quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);

    sendTextMessage(senderID, "Quick reply tapped");
    return;
  }

  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {
      case 'image':
        sendMessageType(senderID, 'image', {
          url: Config.SERVER_URL + '/assets/image.png'
        })
        break;

      case 'gif':
        sendMessageType(senderID, 'image', {
          url: Config.SERVER_URL + '/assets/image.gif'
        });
        break;

      case 'audio':
        sendMessageType(senderID, 'audio', {
          url: Config.SERVER_URL + '/assets/music.mp3'
        });
        break;

      case 'video':
        sendMessageType(senderID, 'video', {
          url: Config.SERVER_URL + '/assets/bigbuck.mp4'
        });
        break;

      case 'file':
        sendMessageType(senderID, 'file', {
          url: Config.SERVER_URL + '/assets/prototype.pdf'
        });
        break;

      case 'button':
        sendMessageType(senderID, 'template', {
          template_type: 'button',
          text: 'The 100dayproject',
          buttons: [{
            type: 'web_url',
            url: 'http://100dayproject.org',
            title: 'Open Web Url'
          }, {
            type: 'postback',
            title: 'Trigger Postback',
            payload: 'DEV_DEFINED_PAYLOAD'
          }, {
            type: 'phone_number',
            title: 'Call Phone Number',
            payload: "0963296583"
          }]
        })
        break;

      case 'generic':
        sendMessageType(senderID, 'template', {
          template_type: 'generic',
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: Config.SERVER_URL + "/assets/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: Config.SERVER_URL + "/assets/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        })
        break;

      case 'receipt':
        sendMessageType(senderID, 'template', {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: senderID,
          currency: "USD",
          payment_method: "Visa 1234",
          timestamp: "1428444852",
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: Config.SERVER_URL + "/assets/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: Config.SERVER_URL + "/assets/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        })
        break;

      case 'quick reply':
        sendQuickReply(senderID, {
          text: "What's your favorite movie genre?",
          quick_replies: [
            {
              "content_type": "text",
              "title": "Action",
              "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
            },
            {
              "content_type": "text",
              "title": "Comedy",
              "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
            },
            {
              "content_type": "text",
              "title": "Drama",
              "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
            }
          ]
        })
        break;

      case 'read receipt':
        sendReadReceipt(senderID);
        break;

      case 'typing on':
        sendTypingOn(senderID);
        break;

      case 'typing off':
        sendTypingOff(senderID);
        break;

      case 'account linking':
        sendMessageType(senderID, 'template', {
          template_type: 'button',
          text: 'Welcome. Link your account',
          buttons: [{
            type: 'account_link',
            url: Config.SERVER_URL + '/authorize'
          }]
        })
        break;

      default:
        sendTextMessage(senderID, messageText)
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, 'Message with attachment received')
  }
}

module.exports = {
  sendMessageTemplate: sendMessageTemplate,
  sendMessageType: sendMessageType,
  sendTextMessage: sendTextMessage,
  sendQuickReply: sendQuickReply,
  sendTypingOn: sendTypingOn,
  sendTypingOff: sendTypingOff
}
