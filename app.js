require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt")


const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://127.0.0.1/UserDB")
  .then("connedted to the server")
  .catch((err) => {
    console.log(err);
  });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  password: String,
});

const user = mongoose.model("users", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register",async (req, res) => {
  const password = await bcrypt.hash(req.body.password, 12)
  const userEmail = req.body.username;
  const userPass = password;

  const newUser = new user({
    email: userEmail,
    password: userPass,
  });

  newUser.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login",async (req, res) => {
  const userEmail = req.body.username;
  
  user.findOne({ email: userEmail }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        const checkFuntion = async()=>{
          const match = await bcrypt.compare(req.body.password, foundUser.password)
          if (match) {
            res.render("secrets");
          } else {
            res.send("Password is incorrect");
          }
        }
        checkFuntion()
      } else{ res.send("User is not Registered")};
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
