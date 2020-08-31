'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 1997;
const app = express();
app.use(cors());


app.get('/weather', weatherhelder)
app.get('/location', locationhelder)
app.get('/trails', trailhelder)





// localhost:3000/weather?city=lynwood
function weatherhelder(req, res) {
    // const weatherALL = require('./data/weather.json');
    const cityName = req.query.city;
    const latitude = req.query.lat;
    const longitude = req.query.lon;
    // const lonName = req.query.city;
    // const lagName = req.query.city;


    let key2 = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${key2}&format=json`

    superagent.get(url)
        .then(data => {

          let  weathersData2=data.body.data

            console.log(data.body.data);
            let weathersData1 = weathersData2.map((element, idx) => {

                return new Weather(element);


            })

            res.send(weathersData1);

        });
    // .catch(()=>{
    //     errorHandler('something went wrong in etting the data from locationiq web',req,res)
    // })   

}




function Weather(elementData) {

    this.forecast = elementData.weather.description;
    this.time = elementData.datetime;


}




// localhost:1997/location?city=lynwood
function locationhelder(req, res) {
    const cityName = req.query.city;
    let key = process.env.LOCATION_KEY;
    const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`

    superagent.get(url)
        .then(data => {
            let locationes1 = new Location(cityName, data.body);
            res.send(locationes1);

        })
    // .catch(()=>{
    //     errorHandler('something went wrong in etting the data from locationiq web',req,res)
    // })


}

function Location(cityData, locationData) {
    this.search_query = cityData;
    this.formatted_query = locationData[0].display_name;
    this.latitude = locationData[0].lat;
    this.longitude = locationData[0].lon;

}






function trailhelder(req, res) {

    const latitude = req.query.lat;
    const longitude = req.query.lon;



    let key3 = process.env.TRAIL_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${key3}`

    superagent.get(url)
        .then(data => {


          
            let trailsData1 = data.body.trails.map((element, idx) => {

                return new Trails(element);


            })

            res.send(trailsData1);

        });
    // .catch(()=>{
    //     errorHandler('something went wrong in etting the data from locationiq web',req,res)
    // })   

}


function Trails(trailsData) {
    this.name = trailsData.name
    this.location = trailsData.location
    this.length = trailsData.length
    this.stars = trailsData.stars
    this.starVotes = trailsData.starVotes
    this.summary = trailsData.summary
    this.trail_ur = trailsData.url
    this.conditions = trailsData.conditionDetails
    let a =trailsData.conditionDate.split(' ');
    this.condition_date =a[0]
    this.condition_time = a[1]

}


app.use('*', (req, res) => {
    res.status(404).send('NOT FOUND');
})

app.use(function (req, res, next) {
    res.status(500).send("Sorry, something went wrong");

})



app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
})