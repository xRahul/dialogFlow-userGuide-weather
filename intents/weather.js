import http from 'http';

const host = 'api.worldweatheronline.com';
const wwoApiKey = 'xxx';

function weather(agent) {
  // Get parameters from Dialogflow
  const {
    city,
    date
  } = getWeatherParameters(agent.parameters);

  // Call the weather API
  return callWeatherApi(city, date).then((output) => {
    console.log(`Success output: ${output}`);
    agent.add(output);
  }).catch(() => {
    agent.add(`I don't know the weather but I hope it's good!`);
  });
}

function getWeatherParameters(parameters) {
  // Get the city and date from the request
  let city = parameters['geo-city']; // city is a required param

  // Get the date for the weather forecast (if present)
  let date = '';
  if (parameters['date']) {
    date = parameters['date'];
    console.log('Date: ' + date);
  }

  console.log(`User requested info for ${city}, ${date}`);
  return {
    city,
    date
  };
}

function callWeatherApi(city, date) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
      '&q=' + encodeURIComponent(city) + '&key=' + wwoApiKey + '&date=' + date;
    console.log('API Request: ' + host + path);

    // Make the HTTP request to get the weather
    http.get({
      host: host,
      path: path
    }, (res) => {
      console.log(`Res: ` + res);
      let body = ''; // var to store the response chunks
      res.on('data', (d) => {
        body += d;
      }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let response = JSON.parse(body);
        console.log("JSON Response: ${response} ");
        let forecast = response['data']['weather'][0];
        let location = response['data']['request'][0];
        let conditions = response['data']['current_condition'][0];
        let currentConditions = conditions['weatherDesc'][0]['value'];

        // Create response
        let output = `Current conditions in the ${location['type']}
          ${location['query']} are ${currentConditions} with a projected high of
          ${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of
          ${forecast['mintempC']}°C or ${forecast['mintempF']}°F on
          ${forecast['date']}.`;

        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        console.err(`Error calling the weather API: ${error}`);
        reject();
      });
    });
  });
}

export default weather;
