const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");



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


//This is our index route that shows all the title 
app.get("/listing", async(req,res)=>{
    const alllisting = await listing.find();

    res.render("listings/index.ejs",{alllisting});
});


//This route for create new listing
app.get("/listing/new",(req,res)=>{
    res.render("listings/new");
})

app.post("/listing",async(req,res)=>{
    const newlisting = new listing(req.body);
    await newlisting.save();

    res.redirect("/listing");
})


// This is route for see all details of a specific title

app.get("/listing/:id" , async(req,res)=>{
    const id = req.params.id;
   const show = await listing.findById(id);
   res.render("listings/show.ejs" , {show});
})

//This is edit route
app.get("/listing/:id/edit",async(req,res)=>{
    const id = req.params.id;
    let listings =  await listing.findById(id);
    res.render("listings/edit.ejs",{listings});
});


//This is update route
app.put("/listing/:id",async(req,res)=>{
    const id = req.params.id;
    await listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listing/${id}`);
});

//Delete Route

app.delete("/listing/:id",async(req,res)=>{
    const id = req.params.id;
    await listing.findByIdAndDelete(id);
    res.redirect("/listing");
});



app.listen(3000,()=>{
    console.log("server is running on port 3000");
});