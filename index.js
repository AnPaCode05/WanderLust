if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 8080;
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');



const reviewsRouter = require('./routes/review.js');
const listingsRouter = require('./routes/listing.js');
const userRouter = require('./routes/user.js');
const searchRouter = require('./routes/search.js');

app.use(methodOverride('_method'));




// const MONGO_URI = 'mongodb://localhost:27017/wanderlust';

const DB_URL = process.env.ATLASDB_URL;

main().then(() => {
  console.log('Connected to MongoDB')

})
  .catch((err) => {
    console.log(err)
  })

async function main() {
  await mongoose.connect(DB_URL)
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
  mongoUrl: DB_URL,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter: 24 * 3600
});

store.on("error", (err) => {
  console.log("Session Store Error", err);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true

  }
};





// app.get('/', (req, res) => {
//   res.send('Hello World');
// })


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get('/demouser',async (req,res)=>{
//   let fakeUser = new User({
//     email:"demo1@demo.com",
//     username:"demo1"});


//    let registerUser = await User.register(fakeUser,"demo");
//    res.send(registerUser);
// })

app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews', reviewsRouter);
app.use('/search', searchRouter);
app.use('/', userRouter);


// app.get('/testListing',async (req,res)=>{
//   let sampleListing = new Listing({
//     title:"My Home",
//     description:"A beautiful home",
//     price:1200,
//     location:"Kolkata",
//     country:"India"
//   });

//   await sampleListing.save();
//   console.log("Listing saved");
//   res.send("Success");
// })

app.all('*', (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));

})


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render('error.ejs', { err });
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})