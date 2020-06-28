const express = require('express');
const axios = require('axios');
require('dotenv').config()

const app = express()
const PORT = 8888

const verify_token = process.env.VERIFY_TOKEN

const api = axios.create({
    method: 'POST',
    baseURL: 'https://graph.facebook.com/v2.6/me/messages',
    headers: {
        Authorization: process.env.ACCESS_TOKEN
  }
});


app.use(express.json())

app.get('/',(request, response) =>{
  const challenge = request.query['hub.challenge']
  const fb_token = request.query['hub.verify_token']

  if (verify_token !== request.query['hub.verify_token']) {
    response.status(403).json({message: "Unauthorized"})
  }
  response.send(request.query['hub.challenge'])

})

app.post('/',(request, response) => {

    function callSendAPI(senderId, response) {
        const request = {
            data: {
                recipient: { id: senderId },
                message: response 
            }
        }

        api(request)
        .catch((err) => {
            console.error(err.response.data);
        });
    } 


    function handleMessage(senderId, received_message) {

        let response

        if (received_message.text) {    
            response = {
                text: `You sent the message: "${received_message.text}". Now send me an image!`
            }
        } else if (received_message.attachments) {
            const attachment_url = received_message.attachments[0].payload.url;
            response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Is this the right picture?",
                            "subtitle": "Tap a button to answer.",
                            "image_url": attachment_url,
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Yes!",
                                    "payload": "yes",
                                },
                                {
                                    "type": "postback",
                                    "title": "No!",
                                    "payload": "no",
                                }
                            ],
                        }]
                    }
                }
            }
        }

        callSendAPI(senderId, response);
    }


    function handlePostback(senderId, received_postback) {
        let response;
        
        const payload = received_postback.payload;
      
        if (payload === 'yes') {
            response = { "text": "Thanks!" }
        } else if (payload === 'no') {
            response = { "text": "Oops, try sending another image." }
        }
        callSendAPI(senderId, response);
      }



    if (request.body.object === 'page') {

        request.body.entry.map((entry) => {

            const webhook_event = entry.messaging[0];
            const senderId = webhook_event.sender.id

            if (webhook_event.message) {
                handleMessage(senderId, webhook_event.message);        
            } else if (webhook_event.postback) {
                handlePostback(senderId, webhook_event.postback);
            }
        
        });
        
        response.status(200).send('EVENT_RECEIVED');

    } else {
        response.sendStatus(404);
    }


})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});