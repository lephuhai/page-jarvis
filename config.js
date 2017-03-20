/**
 * Created by Machine on 20-Mar-17.
 */

'use strict';
const crypto = require('crypto')

const WIT_TOKEN = process.env.WIT_TOKEN || 'NCPO4KTAYQTDZMXQCDX6LUNOHTZK3PBN'
if (!WIT_TOKEN) {
  throw new Error('Missing WIT_TOKEN. Go to https://wit.ai/docs/quickstart to get one.')
}


let FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN || 'EAAGPHOntIL0BALcd8HtHo8TpT0SfCeMZCVatyqrO3d9LyVOkPxwdFE6wVSJe91EMo71ggHXGBz889ZAY000KiP4l2JiboHsZBrHu6MELLgcZAO9myPpcUQggZCEbZAum9ME4ukrYWI9VK8ZBncvaZBddUG6HTGPI8AKiVSTmLRBjmwZDZD';
if (!FB_PAGE_TOKEN) {
  throw new Error('Missing FB_PAGE_TOKEN. Go to https://developers.facebook.com/docs/pages/access-tokens to get one.')
}
let FB_APP_SECRET = process.env.FB_APP_SECRET || '71f6bf2bef94987498be3fca019d9ac2'
if (!FB_APP_SECRET) {
  throw new Error('Missing FB_APP_SECRET')
}

let FB_VERIFY_TOKEN = 'tell_to_you_is_social'
console.log(`/webhooks will accept the Verify Token "${FB_VERIFY_TOKEN}"`)

// crypto.randomBytes(8, function (err, buff) {
//   if (err) throw err
//   FB_VERIFY_TOKEN = buff.toString('hex')
//   console.log(`/webhooks will accept the Verify Token "${FB_VERIFY_TOKEN}"`)
// })

module.exports = {
  WIT_TOKEN: WIT_TOKEN,
  FB_PAGE_TOKEN: FB_PAGE_TOKEN,
  FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
  FB_APP_SECRET: FB_APP_SECRET
}
