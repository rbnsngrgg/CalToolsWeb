const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organization = require("../models/Organization");
const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser } = require("../authenticate");
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.post("/signup", (req, res, next) => {
  // Verify that first name is not empty
  if (!req.body.firstName || !req.body.lastName) {
    res.statusCode = 400;
    res.send({
      success: false,
      name: "NameError",
      message: "Both first and last name are required.",
    });
  }
  else if(!req.body.email){
    res.statusCode = 400;
    res.send({
      success: false,
      name: "EmailError",
      message: "An email address is required"
    })
  }
  else {
    User.register(
      new User({ email: req.body.email }),
      req.body.password,
      (err, user) => {
        if (err) {
          console.log("Error registering user");
          console.log(err);
          res.statusCode = 500
          res.send({success: false, error:err})
        } else {
          user.firstName = req.body.firstName
          user.lastName = req.body.lastName || ""
          const token = getToken({ _id: user._id })
          const refreshToken = getRefreshToken({ _id: user._id })
          user.refreshToken.push({ refreshToken })
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500
              res.send(err)
            } else {
              res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
              res.send({ success: true, token })
            }
          })
        }
      }
    )
  }
});

router.post("/login", passport.authenticate("local"), (req, res, next) => {
    const token = getToken({ _id: req.user._id })
    const refreshToken = getRefreshToken({ _id: req.user._id })
    User.findById(req.user._id).then(
      user => {
        user.refreshToken.push({ refreshToken })
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500
            res.send(err)
          } else {
            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
            res.send({ success: true, token })
          }
        })
      },
      err => next(err)
    )
  });

router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/caltoolsweb", 
    passport.authenticate("google", { failureRedirect: "/" }),
    function(req, res) {
      // Successful authentication, redirect.
      const token = getToken({ _id: req.user._id })
      const refreshToken = getRefreshToken({ _id: req.user._id })
      User.findById(req.user._id).then(
        user => {
          user.refreshToken.push({ refreshToken })
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500
              res.send(err)
            } else {
              res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
              res.set("aToken", token);
              res.redirect("/");
            }
          })
        },
        err => next(err)
      )
});


router.post("/refreshToken", (req, res, next) => {
  const { signedCookies = {} } = req
  const { refreshToken } = signedCookies

  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
      const userId = payload._id
      User.findOne({ _id: userId }).then(
        user => {
          if (user) {
            // Find the refresh token against the user record in database
            const tokenIndex = user.refreshToken.findIndex(
              item => item.refreshToken === refreshToken
            )
            if (tokenIndex === -1) {
              res.statusCode = 401
              res.send("Unauthorized")
            } else {
              const token = getToken({ _id: userId })
              // If the refresh token exists, then create new one and replace it.
              const newRefreshToken = getRefreshToken({ _id: userId })
              user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken }
              user.save((err, user) => {
                if (err) {
                  res.statusCode = 500
                  res.send(err)
                } else {
                  res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
                  res.send({ success: true, token })
                }
              })
            }
          } else {
            res.statusCode = 401
            res.send("Unauthorized")
          }
        },
        err => next(err)
      )
    } catch (err) {
      res.statusCode = 401
      res.send("Unauthorized")
    }
  } else {
    res.statusCode = 401
    res.send("Unauthorized")
  }
});

async function getOrgNames(orgIds){
  let orgNames = [];
  for(let i = 0; i < orgIds.length; i++){
    await Organization.findById(orgIds[i], (err, org) => {
      if(err){
        console.log(err);
      }
      if(org){orgNames.push(org.name);}
    })
  }
  return orgNames;
}

router.get("/me", verifyUser, async (req, res, next) => {
    res.send(req.user);
});

router.get("/me/organizations", verifyUser, async (req, res) => {
  getOrgNames(req.user.organizations).then((names) => {res.send(JSON.stringify(names));});
});

router.get("/me/invitations", verifyUser, async (req, res) => {
  User.findById(req.user._id, async (err, user) => {
    if(err){
      console.log(err);
    }
    if(user){
      let orgIds = user.invitations.map(i => { return i.organization; });
      getOrgNames(orgIds).then(names => {
        res.send(JSON.stringify(names.map((n,i) => {return {name: n, permissions: user.invitations[i].permissions, id: user.invitations[i].organization}})));
      })
    }
  });
});

router.post("/me/invitations", verifyUser, async (req, res) => {
  if(req.body.selection === "reject"){
    let orgUpdate = {$pull: {users:{userId: req.user._id}}}
    Organization.findByIdAndUpdate(req.body.id, orgUpdate, {new:true, useFindAndModify: false}, (err, org)=>{
      if(err){
        res.sendStatus(500);
      }
      else if(org){
        let userUpdate = {$pull: {invitations: {organization: org._id}}}
        User.findByIdAndUpdate(req.user._id, userUpdate, {new: true, useFindAndModify: false}, (err, user)=> {
          if(err){res.sendStatus(500);}
          else if(user){res.sendStatus(200);}
        });
      }
    })
  }
  else if(req.body.selection === "accept"){
    Organization.findById(req.body.id, (err, org) => {
      if (err){console.log(err); res.sendStatus(500);}
      else if(org){
        org.users.forEach(user => {
          if(String(user.userId) === String(req.user._id)){
            user.accepted = true;
            org.save().then(() =>{
              let userUpdate = {$pull: {invitations: {organization: org._id}}, $push: {organizations: org._id}}
              User.findByIdAndUpdate(req.user._id, userUpdate, {new: true, useFindAndModify: false}, (err, user)=> {
                if(err){res.sendStatus(500);}
                else if(user){ res.sendStatus(200); }
                });
            });
          }
        });
      }
    })
  }
  else{
    res.sendStatus(400);
  }
});

//Receive an email address, return whether it is associated with a user.
router.post("/exists", verifyUser, async (req, res) => {
  if(req.body.user){
    User.findOne({email: req.body.user}, (err, user) => {
      let valid = false;
      if(err){
        console.log(err)
      }
      if(user){
        valid = true;
      }
      res.send({validUser: valid});
    })
  }
  else{
    res.sendStatus(400);
  }
});

router.get("/logout", verifyUser, (req, res, next) => {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies
    User.findById(req.user._id).then(
      user => {
        const tokenIndex = user.refreshToken.findIndex(
          item => item.refreshToken === refreshToken
        )
        if (tokenIndex !== -1) {
          user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove()
        }
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500
            res.send(err)
          } else {
            res.clearCookie("refreshToken", COOKIE_OPTIONS)
            res.send({ success: true })
          }
        })
      },
      err => next(err)
    )
  })

module.exports = router