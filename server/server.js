require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const CTItem = require("./models/CTItem");
const passport = require("passport");
const session = require("express-session");
const PORT = process.env.PORT || 3000;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

require("./strategies/JwtStrategy");
require("./strategies/LocalStrategy");
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/caltoolsweb",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ firstName: profile.name.givenName, lastName: profile.name.familyName, email: profile.emails[0].value,googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
require("./authenticate");
const userRouter = require("./routes/userRoutes");

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.resolve(__dirname, "../client/build")));

app.use(cookieParser(process.env.COOKIE_SECRET));
const whitelist = process.env.WHITELISTED_DOMAINS ? process.env.WHITELISTED_DOMAINS.split(",") : [];
const corsOptions = {
    origin: function (origin, callback) {
        if(!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else{
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
};
app.use(cors(corsOptions));

// app.use(session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: false
// }));
app.use(passport.initialize());
//app.use(passport.session());

//Route includes
const dataRoute = require("./routes/data")
app.use("/users", userRouter);
// app.use("/data", dataRoute);


//Debug
// app.post("/dev", async (req, res) => {
//     console.log("Received POST to \"/dev\"");
//     console.log(req.body)
//     var item = new CTItem({
//         serialNumber: req.body.serialNumber,
//         model: req.body.model
//     });
//     await item.save((err) => {
//         if(err){
//             console.log(err);
//             res.sendStatus(500);
//         }
//     });
//     res.sendStatus(200);
// });
//end debug

app.get("/", (req, res) => {
    console.log("Request");
    res.send("ok");
    // if(req.isAuthenticated()){
    //     res.redirect("/data/items");
    // }
    // else{
    //     if(process.env.PORT) { res.sendFile(path.resolve(__dirname, "../client/build", "index.html")); }
    //     else { res.redirect("/login"); }
    // }
});

// app.get("/auth/google",
//     passport.authenticate("google", { scope: ["profile", "email"] }));
    
// app.get("/auth/google/caltoolsweb", 
//     passport.authenticate("google", { failureRedirect: "/" }),
//     function(req, res) {
//       // Successful authentication, redirect.
//       res.redirect("/data/items");
// });

// app.get("/login", function(req, res){
//     res.sendFile(path.resolve(__dirname, "./development", "login.html"));
// });
    
//Keep this at the bottom of the routes
app.get("*", (req, res) => {
    res.sendStatus(400);
});


module.exports = app;