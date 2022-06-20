const Campground = require('../model/campground')
const { cloudinary } = require("../cloudinary");
const mapBoxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')


// getting the api 
const mapBoxToken = process.env.MAP_BOX_TOKEN
const geoCoder = mapBoxGeocoding({accessToken: mapBoxToken })

// controller that contains the CRUD logic for the website 


// our index page with campsites 
module.exports.index = (async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
})

//  order matter, adding new camp sites
module.exports.renderNewForm = (req,res)=> {
    res.render('campgrounds/new')
}


// adding new post to the campground model schema 
// validation server side to make sure that the user enters all the requirements
module.exports.createCampground = async(req,res, next) => {
   const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 2
    }).send()
    // if(!req.body.campground) throw new routerError('Invalid Data', 400)
    const campground = new Campground(req.body.campground)
    // making sure that it does not display anything 
    if(!geoData){
        req.flash('error','cant find that campsite location')
        return res.redirect('/campgrounds/show')
    }
    // sending the result to the model 
    campground.geometry = geoData.body.features[0].geometry;
    // map through the array and only get teh path and filename and we save in the  model 
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // getting the author or user id 
    campground.author = req.user._id;
    await campground.save()
    console.log(campground)
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
} 


//render is to direct you to a template framework like react or ejs pages 
// showing campsites
// populate the reviews, and then populate these authors 
module.exports.showCampgroundSites = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path:'author'
        }
        // but separately populate the author of the campsite it self, the one who posted it
    }).populate('author')
    // if the user searches for a non existing campsite
    // this will redirect him/her to the home page and show and alert message 
    // stating campsite was not found
    if(!campground){
        req.flash('error','cant find that campsite')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{campground} )
}


// Edit the form page 
module.exports.renderEditCampSiteFrom = async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

// redirect is if i want to return a status code error in the browser and tell the browser 
// to go to a new URL
// getting the updated result and posting it 
module.exports.renderUpdateCampSiteForm = async(req,res) => {
    const {id} = req.params;
    console.log(req.body)
    const newCampSite = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    // creating an array 
    const imgArray = req.files.map(f => ({ url: f.path, filename: f.filename }))
     // map through the array and only get teh path and filename and we save in the  model 
    //  pushing into existing images 
    newCampSite.images.push(...imgArray);
    await newCampSite.save()
    // we only want to do this if there are any images to delete 
    // pull from images array and get filename and delete that image
    if (req.body.deleteImages) {
        // going through each filename
        for (let filename of req.body.deleteImages) {
            // deletes the image in the cloudinary 
            await cloudinary.uploader.destroy(filename);
        }
        // await it because we are also deleting from the database 
        await newCampSite.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated the campsite')
    res.redirect(`/campgrounds/${newCampSite._id}`)
}


// delete 
module.exports.deleteCampSite = async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted the campsite')
    res.redirect(`/campgrounds`)
}

// pagination 
module.exports.index = async (req, res, next) => {
    let currentPage = Number(req.query.page);
    console.log({
        currentPage
    });

    if (!currentPage || currentPage < 1)
    // if client req /index w/o ?page 
    {
        currentPage = 1;
        // get campgrounds from the database
        req.session.campgrounds = await Campground.find({}).limit(1000);

        // Initialize Pagination
        let len = (req.session.campgrounds).length;
        req.session.pagination = {
            totalItems: len, // total # of campgrounds
            itemsPerPage: 20,
            totalPages: Math.ceil(len / 20) // total # of pages
        }
    }

    if (!req.session.pagination || !req.session.campgrounds) res.redirect('campgrounds/');

    const {
        itemsPerPage,
        totalItems,
        totalPages
    } = req.session.pagination;
    let start = (currentPage - 1) * itemsPerPage;
    let end = currentPage * itemsPerPage;
    if (end > totalItems) end = totalItems;

    const campgrounds = (req.session.campgrounds);
    res.render('campgrounds/', {
        campgrounds,
        totalPages,
        currentPage,
        start,
        end
    });
};
