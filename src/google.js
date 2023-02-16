const Imports = require("./modules.js");
require("dotenv").config();

// mongoDB connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_DB)
  .then("connedted to the server")
  .catch((err) => {
    console.log(err);
  });

// mongoose Schema

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
});

// plugins for Schema

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// model for Schema

const user = mongoose.model("users", userSchema);

// New Strategy

passport.use(user.createStrategy());

// serialize and deserialize

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

// export google auth
module.exports = passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
    },
    function (accessToken, refreshToken, profile, cb) {
      user.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);




module.exports = { user, userSchema };
