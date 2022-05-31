const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../model/user')
const catchAsync = require('../utils/catchAsync')




router.get('/register', (req, res) => {
    res.render('authentication/register')
})


// register user
router.post('/register', catchAsync (async(req, res, next) => {
   try{
    const {email, username , password} = req.body
    const user = new User({email,username})
    // this will store the user and hash the password 
    const registerUser = await User.register(user, password)
   // we have to loge the user in after registering 
    req.login(registerUser, err => {
        if(err) return next(err)
    req.flash('success', 'Welcome to Camp Sites')
    res.redirect('/campgrounds')
    })
   
   } catch(e){
       req.flash('error', e.message)
       res.redirect('register')
   }
  
   
}))


router.get('/login', (req,res) => {
    res.render('authentication/login')
})


router.post('/login', passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}) , (req, res) => {
    try{
        req.flash('success', `Welcome back!`)
        const redirectUrl = req.session.returnTo || '/campgrounds';
        // deleting the the returnTo url location 
        delete req.session.returnTo
        res.redirect(redirectUrl);

    } catch(error){
        req.flash('error', error.message)
        res.redirect('login')
    }

})


router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
})

// version passport 0.6.0 needs a function call back 

// router.get('/logout', function(req, res, next) {
//    try {
//     req.logout(function(err) {
//         if (err) { return next(err); }
//         req.flash('success', "Goodbye!")
//         res.redirect('/campgrounds');
//       });
       
//    } catch (error) {
//        console.log(error.message)
       
//    }
//   })


module.exports = router 