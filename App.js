const express = require('express');
const app = express()
const axios = require('axios');

const PORT = 3333

const verify_token = '123123123'

const workplaceAPI = axios.create({
  baseURL: 'https://graph.facebook.com/me/messages',
  headers: {
      Authorization: 'Bearer <Your Integration Token>'
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
  const senderId = request.body.entry[0].messaging[0].sender.id
  const message = request.body.entry[0].messaging[0].message.text

  if (request.body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    request.body.entry.forEach(function(entry) {

      // Get the webhook event. entry.messaging is an array, but 
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

  console.log(message)

  const payload = {
    recipient: { id: senderId }, 
    message: { text: 'Hello World' }
  }



})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})