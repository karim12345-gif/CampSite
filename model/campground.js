const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;



// properties of the database model 
const CampgroundSchema = new Schema({
    title: String,
    image:String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})


// middleware to do delete the whole post  
CampgroundSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})


module.exports =  mongoose.model('Campground', CampgroundSchema)