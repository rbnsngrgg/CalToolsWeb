const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organization = require("../models/Organization");
const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser } = require("../authenticate");
const passport = require("passport");
const jwt = require("jsonwebtoken");

//Users should match the schema specified in Organization
function sendInvitations(users, orgId) {
    for(let i = 0; i < users.length; i++){
        let update = {$push: {invitations: {organization: orgId, permissions: users[i].permission}}};
        console.log(users[i]);
        User.findOneAndUpdate({email: users[i].email}, update, {new: true}, (err, user) => {
            if(err){ console.log(err); }
            if(user){ console.log(user); }
        });
    }
}

router.post("/exists", verifyUser, async (req, res) => {
    if(req.body.organization){
        Organization.findOne({name: req.body.organization}, (err, org) => {
            let isAvailable = true;
            if(err){
            console.log(err)
            }
            if(org){
                isAvailable = false;
            }
            res.send({available: isAvailable});
        })
        }
        else{
        res.sendStatus(400);
        }
  });
  
router.post("/create", verifyUser, (req, res) => {
    if(req.body.name){
        Organization.findOne({name: req.body.name}, (err, org) => {
            if(err){
                console.log(err);
            }
            if(org){
                res.sendStatus(400);
            }
            else{
                let org = Organization.create({
                    name: req.body.name,
                    users: [{userId: req.user._id, permissions:3}]
                }).then( org =>
                    User.findById(req.user._id, (err, u) => {
                        if(err){
                            console.log(err);
                        }
                        if(u){
                            u.organizations = [...u.organizations, org._id];
                            u.save().then(() =>{
                                sendInvitations(req.body.users, org._id);
                                res.sendStatus(200);
                            });
                        }
                    })
                );
            }
        })
    }
});

  module.exports = router;