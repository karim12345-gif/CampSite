const express = require('express')
const passport = require('passport')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const usersController = require('../controllers/usersController')

// register route combined 
router.route('/register')
     // register form
    .get( usersController.renderRegister )
    // register user
    .post( catchAsync(usersController.userRegister))



// login route combined 
router.route('/login')
    // login 
    .get( usersController.renderLogin)
    // flashing if user loges in correctly 
    .post(passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'})
    ,usersController.login)


// logout 
router.get('/logout', usersController.userLogout)




module.exports = router 