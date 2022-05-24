const mongoose = require('mongoose')
const Schema = mongoose.Schema;


// properties of the database model 
const reviewSchema = new Schema({
    body: String,
    rating: Number,
})



module.exports =  mongoose.model('Review', reviewSchema)