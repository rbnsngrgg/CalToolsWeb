const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User = require("../models/User")

// passport.use(User.createStrategy());
// passport.serializeUser(function(user, done) {
//     done(null, user.id);
//   });
  
// passport.deserializeUser(function(id, done) {
//     User.findById(id, function(err, user) {
//       done(err, user);
//     });
//   });

//Called during login/sign up.
passport.use(new LocalStrategy(User.authenticate()))
//called while after logging in / signing up to set user details in req.user
passport.serializeUser(User.serializeUser())