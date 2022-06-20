
// basically when we are in development mode  
//we need to require the dotenv folder with the cardinalities 
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}


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
const authenticationRoutes = require('./routes/authenticateUsers')
// flash
const flash = require('connect-flash')
// passport 
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./model/user')
// helps secure the express app setting various HTTP headers
const helmet = require("helmet");


// The sanitize function will strip out any keys that start with '$' in the input,
// so you can pass it to MongoDB without worrying about malicious users overwriting
// query selectors.
const mongoSanitize = require('express-mongo-sanitize')


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
app.use(mongoSanitize())


// sessions
// expire date so the user doesn't stay authenticated
// this is good for the user to signin again after one week of the cookie expiring 
const sessionConfig = {
    name:'session',
    secret: 'thisshouldbetter',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
    
}
app.use(session(sessionConfig))
app.use(flash())
// Helmet helps secure the Express apps by setting various HTTP headers. 
app.use(helmet({ contentSecurityPolicy: false }));

// only adding what is needed 
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2" 
];

const styleSrcUrls = [
    "https://cdn.jsdelivr.net/",
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://cdn.jsdelivr.net/",
    "https://use.fontawesome.com/",
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/kalsoft/", //SHOULD MATCH THE CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// passport 
app.use(passport.initialize())
app.use(passport.session())
// use local strategy to authenticate 
passport.use(new LocalStrategy(User.authenticate()))

// serializing the password and then we deserialize it back 
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


// flash
app.use((req,res,next) => {
    console.log(req.query)
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

// app routes 
app.use('/', authenticationRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewsRoutes)


// rendering to home page
app.get('/',(req,res)=> {
    res.render('home')
})


// page not found error 
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


