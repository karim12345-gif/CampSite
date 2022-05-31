const express = require('express')
const router = express.Router()
// Handling Errors
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
// models
const Campground = require('../model/campground')

// Schema
const {campgroundSchema} = require('../middleware/schemas.js')

// logged in middleware 
const {isLoggedIn} = require('../middleware/loggedIn')


// validating our schema to avoid errors
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        // if everything is correct we call next and go to the other requests 
        next();
    }
}


router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}));

// order matter, adding new camp sites
router.get('/new', isLoggedIn,(req,res)=> {
    res.render('campgrounds/new')
})

// adding new post to the campground model schema 
// validation server side to make sure that the user enters all the requirements
router.post('/', isLoggedIn, validateCampground, catchAsync(async(req,res, next) => {
    // if(!req.body.campground) throw new routerError('Invalid Data', 400)
    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash('success', 'Successfully made a new campground')
    req.flash('error', 'Error found while making a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

//render is to direct you to a template framework like react or ejs pages 
// showing campsites
router.get('/:id',  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    // if the user searches for a non existing campsite
    // this will redirect him/her to the home page and show and alert message 
    // stating campsite was not found
    if(!campground){
        req.flash('error','cant find that campsite')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{campground} )
}));

// update
router.get('/:id/edit', isLoggedIn, catchAsync( async(req,res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error','cant find that campsite to edit it!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
}))

// redirect is if i want to return a status code error in the browser and tell the browser 
// to go to a new URL
// getting the updated result and posting it 
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async(req,res) => {
    const {id} = req.params;
    const newCampSite = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'Successfully updated the campsite')
    res.redirect(`/campgrounds/${newCampSite._id}`)
}))

// delete 
router.delete('/:id', isLoggedIn, catchAsync(async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted the campsite')
    res.redirect(`/campgrounds`)
}))


// exporting the routes 
module.exports = router;