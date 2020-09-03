'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');


const PORT = process.env.PORT || 1997;
const app = express();
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);




app.get('/weather', weatherhelder)
app.get('/location', locationhelder)
app.get('/trails', trailhelder)
app.get('/movie', movieshandler)
app.get('/yeld', yeldhandler)







// localhost:3000/weather?city=lynwood
function weatherhelder(req, res) {
    // const weatherALL = requir/e('./data/weather.json');
    // const cityName = req.query.city;
    let latitude = req.query.latitude;
    let longitude = req.query.longitude;
    // const lonName = req.query.city;
    // const lagName = req.query.city;
console.log(req);

    let key2 = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${key2}`

    superagent.get(url)
        .then(data => {

          let  weathersData2=data.body.data

    
            let weathersData1 = weathersData2.map((element, idx) => {

                return new Weather(element);


            })

            res.send(weathersData1);

        })
        


}




function Weather(elementData) {

    this.forecast = elementData.weather.description;
    this.time = elementData.datetime;


}








// localhost:1997/location?city=lynwood
function locationhelder(req, res) {
    const cityName = req.query.city;
    let selectAllSQL = `SELECT * FROM locations`;
     let selectSQL = `SELECT * FROM locations WHERE search_query=$1`;
      let safeValues = [];
    let key = process.env.LOCATION_KEY;

    const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`
    
    client.query(selectAllSQL).then((result) => {
        if (result.rows.length <= 0) {
            superagent.get(url).then((data) => {
            console.log(`from API`);
            let locationes1 = new Location(cityName, data.body);
            insertLocationInDB(locationes1 );
            res.status(200).josn(locationes1 );
          });
        } else {
          safeValues = [cityName];
          client.query(selectSQL, safeValues).then((result) => {
            if (result.rows.length <= 0) {
                superagent.get(url).then((data1) => {
                console.log(`From API Again`);
                let locationes1 = new Location(cityName, data1.body);
                insertLocationInDB(locationes1 );
                res.status(200).json(locationes1 );
              })
            } else {
              console.log('form data base');
              res.status(200).json(result.rows[0]);
            }
          })
        }
      })

}

function Location(cityData, locationData) {
    this.search_query = cityData;
    this.formatted_query = locationData[0].display_name;
    this.latitude = locationData[0].lat;
    this.longitude = locationData[0].lon;

}


function insertLocationInDB(indataBase) {
    let insertSQL = `INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4)`;
    let safeValues = [
      indataBase.search_query,
      indataBase.formatted_query,
      indataBase.latitude,
      indataBase.longitude,
    ];
    client.query(insertSQL, safeValues).then(() => {
      console.log('storing data in database');
    })
  }
  



function trailhelder(req, res) {

    const latitude = req.query.latitude;
    const longitude = req.query.longitude;



    let key3 = process.env.TRAIL_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${key3}`

    superagent.get(url)
        .then(data => {


          
            let trailsData1 = data.body.trails.map((element, idx) => {

                return new Trails(element);


            })

            res.send(trailsData1);

        })
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




let movies_URL = `https://api.themoviedb.org/3/configuration/countries?api_key=${movieKEY}`
var codesArray = [];

async function getCodes() {
    superagent.get(movies_URL)
        .then(
            data => {
                codesArray = data.body;

            })
        .catch(error => errorHandler(error, req, res))

}

getCodes()
function  movieshandler(req, res) {
  let arrayObjects = [];
  let queryArray = req.query.formatted_query.split(',');
  let countryName = queryArray[queryArray.length - 1].trim();
 
  let countryCode = codesArray.filter(element => {
      return element.english_name === countryName
  }).map(item => {
      return item.iso_3166_1;
  });
  let movieKEY = process.env.MOVIE_API_KEY;
  const movieURLEnd = `https://api.themoviedb.org/3/discover/movie?api_key=${movieKEY}&region=${countryCode}&sort_by=popularity.desc`
  superagent.get(movieURLEnd)
      .then(
          data => {
              data.body.results.map(element => {
                  let movieData = new Movie(element);
                  arrayObjects.push(movieData);
              }
              )
              res.send(arrayObjects)
          })
      .catch(error => errorHandler(error, req, res))

}
function Movie(movieObi) { 
  this.title = movieObi.title;
  this.overview = movieObi.overview;
  this.average_votes = movieObi.vote_average;
  this.total_votes = movieObi.vote_count;
  this.image_url = 'https://image.tmdb.org/t/p/w500/' + movieObi.poster_path;
  this.popularity = movieObi.popularity;
  this.released_on = movieObi.release_date;
};

function yeldhandler(req, res) {
  let city=req.query.search_query
  let key2 = process.env.YELD_API_KEY;
  
  let arrayObjects=[]  
const yeldURLEnd = `https://api.yelp.com/v3/businesses/search?city=${city}`
superagent.get(yeldURLEnd)
.set(`Authorization`,`Bearer ${process.env.YELD_API_KEY}`)
      .then(
          data => {
              data.body.businesses.map(element => {
                  let yeldData = new Yeld(element);
                  arrayObjects.push(yeldData);
              }
              )
              res.send(arrayObjects)
          })
      // .catch(error => errorHandler(error, req, res))

}
function Yeld(yelds) {
  
  this.name=yelds.name
  this.image_url=yelds.image_url
  this.price=yelds.price
  this.rating=yelds.rating
  this.url=yelds.url
  
}

app.use('*', (req, res) => {
    res.status(404).send('NOT FOUND');
})

app.use(function( error,req,res) {
    res.status(500).send( "Sorry, something went wrong");
    
})

function errorHandler(error, request, response) {
  response.status(500).send(error);
}


client.connect()
.then(()=>{
    app.listen(PORT, () =>{
    console.log(`listening on ${PORT}`)
    })
})