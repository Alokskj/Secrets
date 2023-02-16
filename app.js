require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  session({
    secret: "thisisoursecret",
    resave: true,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://127.0.0.1/UserDB")
  .then("connedted to the server")
  .catch((err) => {
    console.log(err);
  });

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
userSchema.plugin(passportLocalMongoose);

const user = mongoose.model("users", userSchema);

passport.use(user.createStrategy());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});
app.get("/logout", function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });

});

app.post("/register", async (req, res) => {
  user.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    }
  );
});

app.post("/login", async (req, res) => {
  const User = new user({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(User, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
