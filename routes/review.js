const express = require('express')
// to have access to id's 
const router = express.Router({mergeParams: true})
// handling errors
const catchAsync = require('../utils/catchAsync')

// controller
const reviewController = require('../controllers/reviewController')

// importing the middleware 
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware/campgroundMiddleware')


// review routes with middle wares

// posting reviews
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview))


// deleting comments 
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview))
 

// exporting routes
module.exports = router