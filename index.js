// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

import {
  WebhookClient,
  Card,
  Suggestion
} from 'dialogflow-fulfillment';
import functions from 'firebase-functions';
import express from 'express';
import bodyParser from 'body-parser';

import weather from './intents/weather';

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const port = process.env.PORT || 8080;
const server = express();
server.use(bodyParser.urlencoded({
  extended: true
}));
server.use(bodyParser.json());

server.post('/getWeather', function (request, response) {
  const agent = new WebhookClient({
    request,
    response
  });

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Weather', weather);
  agent.handleRequest(intentMap);

});

server.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});