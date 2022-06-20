const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')

// importing multer 
const multer  = require('multer')
const {storage} = require('../cloudinary/index')
// we are saving the images in the storage that we have 
const upload = multer({ storage})

//  middleware  middle 
const {isAuthorValidated, isLoggedIn, validateCampground} = require('../middleware/campgroundMiddleware')

// controllers
const campgroundController = require('../controllers/campgroundsController')




// passing in middle wares and controllers to routes 
router.route('/')
    //index page
   .get( catchAsync(campgroundController.index))
   //post campsites
   .post( isLoggedIn, upload.array('image'), validateCampground,
   catchAsync(campgroundController.createCampground))


// order matter, adding new camp sites, send user to page to add new camp sites
router.get('/new', isLoggedIn, campgroundController.renderNewForm)



router.route('/:id')
    //showing campsites
   .get( catchAsync(campgroundController.showCampgroundSites))
    // redirect is if i want to return a status code error in the browser and tell the browser 
    // to go to a new URL
    // getting the updated result and posting it 
   .put( isLoggedIn, isAuthorValidated, upload.array('image'),validateCampground, 
   catchAsync(campgroundController.renderUpdateCampSiteForm))
   .delete( isLoggedIn, isAuthorValidated, 
   catchAsync(campgroundController.deleteCampSite))


// edit from page
router.get('/:id/edit', isLoggedIn, isAuthorValidated, catchAsync(campgroundController.renderEditCampSiteFrom))






// exporting the routes 
module.exports = router;