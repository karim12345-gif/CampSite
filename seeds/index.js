//this file doesnt run everytime we run the project only when we want to seed our database
const mongoose = require('mongoose');
const cities = require('./cities')
const Campground = require('../model/campground');
const {places, descriptors} = require('./seedHelpers')



mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology:true
})


// check of there are errors in the mongo database 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected")
});

const randomPlaces = (array) => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randomCities = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            location: `${cities[randomCities].city}, ${cities[randomCities].state}`,
            title: `${randomPlaces(descriptors)} ${randomPlaces(places)}`,
            image:'https://source.unsplash.com/collection/483251',
            description: 'Watching the stars while preparing my tent',
            price: price
        
        })
        await camp.save();
    }
}

// closing the database connection 
seedDB().then(() => {
    mongoose.connection.close();
})