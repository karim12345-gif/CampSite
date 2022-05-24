const express = require('express')
// to have access to id's 
const router = express.Router({mergeParams: true})
// schema
const {reviewSchema} = require('../middleware/schemas.js')
// handling errors
const catchAsync = require('../utils/catchAsync')

// models
const Campground = require('../model/campground')
const Review = require('../model/review')


// validating our schema to avoid errors
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

// posting reviews
// this should be redirect to the same show page after submiting the post
router.post('/', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    // pushing reviews to campgrounds schema in the  database
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))


// deleting comments 
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // pulls the id of review and delete it 
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))
 


// exporting routes
module.exports = router