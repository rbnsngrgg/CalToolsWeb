const passport = require("passport")
const User = require("../models/User")
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://caltools.herokuapp.com/users/auth/google/caltoolsweb",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ firstName: profile.name.givenName, lastName: profile.name.familyName, email: profile.emails[0].value,googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

//called while after logging in / signing up to set user details in req.user
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });