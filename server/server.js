const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const serverless = require('serverless-http');

require('dotenv').config({ path: __dirname + '/./../.env' });

const app = express();

app.use(express.static(path.join(__dirname, '/../')));
app.get('/*', (req, res) =>
  res.sendFile(path.join(__dirname, '/../', 'index.html'))
);

app.post('/weather/:zip', async (req, res) => {
  const { zip } = req.params;
  try {
    // Get location data from zip code
    const location = await fetch(
      `${process.env.MAPS_API}?address=${zip}&key=${process.env.MAPS_API_KEY}`
    );
    const locationJson = await location.json();
    const { formatted_address } = locationJson.results[0];
    // Get latitude & longitude by zip code
    const coords = await fetch(
      `${process.env.ZIP_API}?zip=${zip}&appid=${process.env.API_KEY}`
    );
    const coordsJson = await coords.json();
    const { lat, lon } = coordsJson;
    // Get weather using lat & lon coordinates
    const weather = await fetch(
      `${process.env.WEATHER_API}?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}`
    );
    const weatherJson = await weather.json();
    res.json({ weather: weatherJson, location: formatted_address });
  } catch (err) {
    console.log(err);
    res.status(500).send('There was an error with your request');
  }
});

// Find location data from IP address
app.post('/location', async (req, res) => {
  try {
    const apiResponse = await fetch('http://ip-api.com/json');
    const json = await apiResponse.json();
    const { city, countryCode, region, zip } = json;
    res.json({ city, countryCode, region, zip });
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
});

app.listen(3000, () => {
  console.log(`Server started listening on 3000`);
});

module.exports.handler = serverless(app);
