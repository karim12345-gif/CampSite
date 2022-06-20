const mongoose = require('mongoose')
const Schema = mongoose.Schema;


// properties of the database model 
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    // reference to our User database schema 
    author: {
        type: Schema.Types.ObjectId,
        ref:'User'
    }
})



module.exports =  mongoose.model('Review', reviewSchema)