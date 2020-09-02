'use strict';

require('dotenv').config();
const express = require('express');

const PORT = process.env.PORT || 1997;
const app = express();

// localhost:3000/weather?city=lynwood
app.get('/weather',(req,res)=>{
    const weatherALL = require('./data/weather.json');
let weatherData= weatherALL.data;
let weathersData1=[]



    // [
    //     {
    //       "forecast": "Partly cloudy until afternoon.",
    //       "time": "Mon Jan 01 2001"
    //     },
    //     {
    //       "forecast": "Mostly cloudy in the morning.",
    //       "time": "Tue Jan 02 2001"
    //     },
    //     ...
    //   ]
    // let weathers1 = new Weather(c);
    // res.send(locationes1);

    weatherData.forEach(element => {
        
     let  weathersDataInformation= new Weather(element);
     weathersData1.push( weathersDataInformation)
    });

    res.send( weathersData1);
    
    
})

function  Weather (elementData) {
   
    this.forecast= elementData.weather.description;
    this.time= elementData.datetime;
    
    
}




// localhost:1997/location?city=lynwood
app.get('/location',(req,res)=>{
    const locationData = require('./data/location.json');

    console.log(locationData);
    const cityName = req.query.city;
    console.log(cityName);
    // {
    //     "search_query": "seattle",
    //     "formatted_query": "Seattle, WA, USA",
    //     "latitude": "47.606210",
    //     "longitude": "-122.332071"
    //   }
    let locationes1 = new Location(cityName,locationData);
    res.send(locationes1);

})

function Location (cityData,locationData) {
    this.search_query=cityData;
    this.formatted_query=locationData[0].display_name;
    this.latitude = locationData[0].lat;
    this.longitude = locationData[0].lon;

}
app.use('*',(req,res)=>{
    res.status(404).send('NOT FOUND');
})

app.use(function( error,req,res) {
    res.status(500).send( "Sorry, something went wrong");
    
})



app.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`);
})