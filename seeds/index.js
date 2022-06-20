//this file doesnt run everytime we run the project only when we want to seed our database
const mongoose = require('mongoose');
const cities = require('./cities')
const Campground = require('../model/campground');
const {places, descriptors, imageUrls} = require('./seedHelpers')
const {
  v4: uuidv4
} = require('uuid');



mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology:true
})


// check of there are errors in the mongo database 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected")
})
    
const randomPlaces = (array) => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {
    await Campground.deleteMany({});
    // increasing the count number of campsites 
    for (let i = 0; i < 400; i++) {
        const randomCities = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
            // random images
            const randomImages = [];
            for (let j = 0; j < 4; j++) {
                randomImages.push({
                    url:randomPlaces(imageUrls),
                    filename: 'Unsplash-' + uuidv4()
                });
            }
            console.log(randomImages);
        const camp = new Campground({
            // your user id
            author: '62950d872a11b13c1272d28a',
            location: `${cities[randomCities].city}, ${cities[randomCities].state}`,
            title: `${randomPlaces(descriptors)} ${randomPlaces(places)}`,
            description: 'Watching the stars while preparing my tent',
            price: price,
            // from the mangodb that saves the url in cloudinary url 
            geometry: {
                type: 'Point',
                coordinates: [ cities[randomCities].longitude, cities[randomCities].latitude ]
              },
            images : [...randomImages]
                // {
                //   url: imageUrls[randomPlaces],
                //   filename: 'YelpCamp/pk1ertopvy1pyaiyiu99',
                
                // },
                // {
                //   url: imageUrls[randomPlaces],
                //   filename: 'YelpCamp/pk1ertopvy1pyaiyiu99',
                // }
                // {
                //   url: 'https://images.unsplash.com/photo-1518602164578-cd0074062767?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                //   filename: 'YelpCamp/mkccbfgaijqhigqq4tnr',
                 
                // }
              
        
        })
        await camp.save();
    }
}

// closing the database connection 
seedDB().then(() => {
    mongoose.connection.close();
})