const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.info('database connected successfully');
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = new mongoose.model('user', userSchema);

app.get("/", (request   , response) => {
  response.render("home");
});

app.get("/login", (request, response) => {
  response.render("login");
});

app.get("/register", (request, response) => {
  response.render("register");
});

app.post('/register', (request, response) => {
    const email = request.body.username;
    const password = request.body.password;

    new User({
        email: email,
        password: password
    })
    .save((err) => {
        if(!err) response.render('secrets');
        else response.send('Registration failed');
    });

});

app.post('/login', (request, response) => {
    const email = request.body.username;
    const password = request.body.password;

    User.findOne({email: email}, (err, user) => {
        if(user){
                if(user.password === password){
                    response.render('secrets');
                }
                else response.send("password doesn't matches");             
        }
        else response.send("login failed");
    });
});

app.listen(3000, () => {
  console.info("server started at port:3000");
});
