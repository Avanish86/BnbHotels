const mongoose = require("mongoose");
const Schema  = mongoose.Schema;
const Review = require("./review.js")


let listingSchima = new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    image:{
        type:String,
        default:"https://images.unsplash.com/photo-1512941158376-70562fd07922?q=80&w=1546&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v)=> v==="" ? v ="https://images.unsplash.com/photo-1512941158376-70562fd07922?q=80&w=1546&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D": v 
    },
    price:Number,
    location:String,
    country:String,
    reviews:[{
        type: Schema.Types.ObjectId,
        ref:"Review",
    },
     ]
})

listingSchima.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}})
    }
    
})

let listing = mongoose.model("listing",listingSchima); 

module.exports = listing;