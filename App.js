const express = require('express');
const axios = require('axios');
require('dotenv').config()

const app = express()
const PORT = 8888

const verify_token = '123123123'

const workplaceAPI = axios.create({
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
                message: { text: response }
            }
        }

        workplaceAPI(request)
        .catch((err) => {
            console.error(err.response.data);
        });
    } 


    const handleMessage = (senderId, received_message) => {
        callSendAPI(senderId, response)
    }


    const handlePostback = (senderId) => {
        response = "Eae!"
        callSendAPI(senderId, 'response')
    }

    if (request.body.object === 'page') {

        const senderId = request.body.entry.map((entry) => {

            var webhook_event = entry.messaging[0];
            console.log(webhook_event);
            return webhook_event.sender.id
        
        });
        
        response.status(200).send('EVENT_RECEIVED');
        handlePostback(...senderId)

    } else {
        response.sendStatus(404);
    }


})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});