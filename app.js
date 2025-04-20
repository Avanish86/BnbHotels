const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapasync.js");
const ExpressError= require("./utils/expressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");




app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', engine);
app.use(express.static(path.join(__dirname,"/public")));
 

main().then(res=>console.log("Database connected")).catch(err=>console.log(err));   

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/bnb");
}


app.get("/",(req,res)=>{
    res.send("Hello World");
});

//server side new listing validation
const validateListing=(req ,res ,next)=>{
    let {error}= listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}

//server side new review validation
const validateReview=(req ,res ,next)=>{
    let {error}= reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}

//This is our index route that shows all the title 
app.get("/listing", wrapAsync (async(req,res)=>{
    const alllisting = await listing.find();

    res.render("listings/index.ejs",{alllisting});
}));


//This route for create new listing
app.get("/listing/new",(req,res)=>{
    res.render("listings/new");
})

app.post("/listing",validateListing, wrapAsync (async(req,res,next)=>{
    let result = listingSchema.validate(req.body);
    console.log(result);
    const newlisting = new listing(req.body);
    await newlisting.save();
    res.redirect("/listing");
    
}))


// This is route for see all details of a specific title

app.get("/listing/:id" ,wrapAsync ( async(req,res)=>{
    const id = req.params.id;
   const show = await listing.findById(id).populate("reviews");
   res.render("listings/show.ejs" , {show});
}))

//This is edit route
app.get("/listing/:id/edit",wrapAsync (async(req,res)=>{
    const id = req.params.id;
    let listings =  await listing.findById(id);
    res.render("listings/edit.ejs",{listings});
}));


//This is update route
app.put("/listing/:id",validateListing,wrapAsync (async(req,res)=>{
    const id = req.params.id;
    await listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listing/${id}`);
}));

//Delete Route

app.delete("/listing/:id",wrapAsync (async(req,res)=>{
    const id = req.params.id;
    await listing.findByIdAndDelete(id);
    res.redirect("/listing");
}));

//review create route
app.post("/listing/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
   let Listing= await listing.findById(req.params.id);
   let newReview = new Review(req.body.review)
   Listing.reviews.push(newReview);

   newReview.save();
   Listing.save();
    res.redirect(`/listing/${req.params.id}`);
}))

//delete review route
app.delete("/listing/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId} = req.params;
    await listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listing/${id}`);

}))


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"))
})

app.use((err,req,res,next)=>{
    let {statusCode =500,message = "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
})

app.listen(3000,()=>{
    console.log("server is running on port 3000");
});