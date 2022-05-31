// Node.js essentials to work with 
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
// packages
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
// Handling Errors
const AppError = require('./utils/AppError')
// session
const session = require('express-session')
// routes
const campgroundRoutes = require('./routes/campground')
const reviewsRoutes = require('./routes/review')
const authenticationRoutes = require('./routes/auth')
// flash
const flash = require('connect-flash')
// passport 
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./model/user')


// connecting to database with name yel-camp
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology:true,
    
})
// check of there are errors in the mongo database 
const db = mongoose.connection
db.on("error", console.error.bind(console, 'connection error'))
db.once("open", () => {
    console.log('Database connected')
})

const app = express();

// our view engine is ejs 
app.engine('ejs',ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


// to parse the body we use extend 
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))


// sessions
// expire date so the user doesn't stay authenticated
// this is good for the user to signin again after one week of the cookie expiring 
const sessionConfig = {
    secret: 'thisshouldbetter',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
    
}
app.use(session(sessionConfig))
app.use(flash())


// passport 
app.use(passport.initialize())
app.use(passport.session())
// use local strategy to authenticate 
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())




// flash
app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
//    to move to our route handlers and the rest
   next()
})


// register 
app.get('/fakeUser', async(req, res)=> {
    const user = new User({email:'karim@gmail.com', username: 'karim'})
    const newUser = await User.register(user, '12345')
    res.send(newUser)

}) 

app.use('/', authenticationRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewsRoutes)


app.get('/',(req,res)=> {
    res.render('home')
})




app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404))
})
// default status code 
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


app.listen(3000, () => {
    console.log('Running on port 3000')
})


