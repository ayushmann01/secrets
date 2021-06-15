const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true); 

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.info("database connected successfully");
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("user", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (request, response) => {
  response.render("home");
});

app.get("/login", (request, response) => {
  response.render("login");
});

app.get("/register", (request, response) => {
  response.render("register");
});

app.get('/secrets', (request, response) => {
  if(request.isAuthenticated()) response.render('secrets');
  else response.redirect('/login');
});

app.post("/register", (request, response) => {
  const username = request.body.username;
  const password = request.body.password;

  // console.log(email, passport);
  User.register({username: username}, password, (err, user) => {
    if(err){
      console.log(err);
      response.redirect('/register');
    }
    else{
      passport.authenticate("local")(request, response, () => {
        response.redirect('/secrets');
      });
    }
  });
});

app.post("/login", (request, response) => {
  const username = request.body.username;
  const password = request.body.password;

  const user = new User({
    username: username,
    password: password
  });

  request.login(user, (err) => {
    if(err) console.error(err);
    else{
      passport.authenticate("local")(request, response, () => {
        response.redirect('/secrets');
      });
    }
  });

});

app.listen(3000 || process.env.PORT, () => {
  console.info("server started at port:3000");
});
