require("dotenv").config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1/UserDB")
.then("connedted to the server")
.catch((err)=>{console.log(err)})

const userSchema = new mongoose.Schema({
    email : {
        type: String,
        unique : true
    },
    password : String,
})


userSchema.plugin(encrypt, {secret : process.env.SECRET_KEY, encryptedFeild : ["password"]})

const user = mongoose.model('users', userSchema,)


app.get("/", (req, res)=>{
    res.render("home");
})
app.get("/login", (req, res)=>{
    res.render("login");
})
app.get("/register", (req, res)=>{
    res.render("register");
})

app.post("/register", (req, res)=>{
    const userEmail = req.body.username;
    const userPass = req.body.password;

    const newUser = new user({
        email : userEmail,
        password : userPass,
    })

    newUser.save((err)=>{
        if(err){
            console.log(err)
        }
        else{
            res.render("secrets")
        }
    })
})

app.post("/login", (req, res)=>{
    const userEmail = req.body.username;
    const userPass = req.body.password;
    user.findOne({email : userEmail}, (err, foundUser)=>{
        if(err){
            console.log(err)
        }
        else{
            if(foundUser.password === userPass){
                res.render("secrets")
            }
            else{
                res.send("User not found")
            }
        }
    })
})



app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
