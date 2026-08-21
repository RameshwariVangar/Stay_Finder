if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}

const express =  require("express");
const app = express();
const mongoose = require("mongoose");
//const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//const wrapasync = require("./utils/wrapasync.js");
//const ExpressError = require("./utils/ExpressError.js");
//const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
//const review = require("./models/review.js");
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash =  require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter =  require("./routers/listing.js");
const reviewRouter = require("./routers/reviews.js");
const userRouter = require("./routers/user.js");

const dbUrl = process.env.ATLASDB_URL;
main()
     .then(()=>{
        console.log("connected mongoose");
     })
     .catch((err)=>{
        console.log(err);
     });
async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//default session expire i n 14 days
const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto:{
            secret :process.env.SECRET,
     },
     touchAfter: 24*3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true ,
    cookie:{ 
        expries : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge :  7 * 24 * 60 * 60 * 1000 ,
        httpOnly : true ,
    }, 
};

// app.get("/",(req,res)=>{
//     res.send("hi i am root");
//});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async(req,res)=>{
//     let fakeuser = new User({
//      email : "student@gmail.com",
//      username : "delta-student"
//     }); 
//hashing algo use by passport is pdkdf2 

    //method use to register user with password
    //automatic check is username is already available or not
//     let registerUser = await User.register(fakeuser,"hello");
//     res.send(registerUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/review",reviewRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
// app.use("/")
// app.get("/testlisting", async(req,res)=>{
//  let samplelisting = new Listing({
//     title : "My Home",
//     description : "By the beach",
//     price : 1200,
//     location: "Calangue,Goa",
//     country: 'India',
//  });
//    await samplelisting.save();
//    console.log("sample saved"),
//    res.send("successful testing");
// });
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// app.use((req,res,next)=>{
//     // res.status(404).send("Page Not Found  !");
//     next(new ExpressError(404 , "Page not found!"));
// });
app.use((err,req,res,next)=>{
    let{statusCode = 500 ,message = "Page not found"} = err ;
    res.status(statusCode).render("listings/error.ejs",{err});
    console.log(message);
    // res.send("something went wrong");
});

const port = process.env.PORT || 4000;
app.listen(port ,()=>{
    console.log("server is start");
});