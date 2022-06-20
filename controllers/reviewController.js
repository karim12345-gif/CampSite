// models
const Campground = require('../model/campground')
const Review = require('../model/review')


// posting reviews
// this should be redirect to the same show page after submitting the post
module.exports.createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    // reference in the review schema model
    const review = new Review(req.body.review)
    // getting the user id from our reference in the review schema model
    review.author = req.user._id
    // pushing reviews to campgrounds schema in the  database
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    req.flash('success', 'Successfully created a comment review')
    res.redirect(`/campgrounds/${campground._id}`)
}


// deleting comments 
// adding middle wares to give authorization to specific users only
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    // pulls the id of review and delete it 
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the comment')
    res.redirect(`/campgrounds/${id}`);
}