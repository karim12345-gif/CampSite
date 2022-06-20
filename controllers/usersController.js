const User = require('../model/user')


// register form 
module.exports.renderRegister = (req, res) => {
    res.render('authentication/register')
}


// register logic 
module.exports.userRegister = async(req, res, next) => {
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

 }



// logging in the user 
 module.exports.renderLogin =  (req,res) => {
    res.render('authentication/login')
}


// flashing if the users has logged in correctly 
module.exports.login = (req, res) => {
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

}


// logout 
module.exports.userLogout = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}