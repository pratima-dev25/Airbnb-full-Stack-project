
const Listing = require("../models/listing.js");

module.exports.index = async(req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", {allListings});
}

module.exports.renderNewForm =  (req,res) => {
   res.render("listings/new.ejs");
}

module.exports.filterIndex = async (req,res) => {
    console.log(req.query.category);
  
    const allListings = await Listing.find({category: req.query.category});
    res.render("listings/filter.ejs", {allListings});

}

module.exports.postfilter = async (req,res) => {
    console.log(req.body.category);
    
    const allListings = await Listing.find({category: req.body.category});
    res.render("listings/filter.ejs", {allListings});

}

module.exports.showListing =  async(req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
        path: "author",
        },
    })
    .populate("owner");
        
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }else{
        console.log(listing);
        res.render("listings/show.ejs", {listing});
    }

        
        
}

module.exports.createListing =  async(req, res, next) => {

    let url = req.file.path;
    let filename = req.file.filename;
   // let listing = req.body.listing;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {filename, url};
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}


module.exports.renderEditForm =  async(req,res) => {
        const {id} = req.params;
        const listing = await Listing.findById(id);
        if(!listing){
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }else{
            const url = listing.image.url
            console.log("listing url is", url);
            let originalImageUrl = listing.image.url;
            originalImageUrl =  originalImageUrl.replace("/upload", "/upload/w_250");
            res.render("listings/edit.ejs", {listing, url,  originalImageUrl});
        }
}

module.exports.updateListing =  async(req, res) => {
       
        console.log(req.body.listing);
        if(!req.body.listing){
            throw new ExpressError(400, "Send valid data for listing");
        }
        const {id} = req.params;
        let listing = await  Listing.findByIdAndUpdate(id, {...req.body.listing});

        if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {filename, url};
        await listing.save();
        }

        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req, res) => {
        const {id} = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
}
