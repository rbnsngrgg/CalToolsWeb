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
        let userUpdate = {$push: {invitations: {organization: orgId, permissions: users[i].permission}}};
        User.findOneAndUpdate({email: users[i].email}, userUpdate, {new: true, useFindAndModify: false}, (err, user) => {
            if(err){ console.log(err); }
            if(user){
                let orgUpdate = {$push: {users: {userId: user._id, permissions: users[i].permission, accepted: false}}};
                Organization.findByIdAndUpdate(orgId, orgUpdate, {new: true, useFindAndModify: false}, (err, org) => {
                    if(err){
                        console.log(err);
                    }
                });
            }
        });
    }
}

router.post("/exists", verifyUser, async (req, res) => {
    if(req.body.organization){
        Organization.findOne({_name_lower: req.body.organization.toLowerCase().trim()}, (err, org) => {
            let exists = false;
            if(err){
            console.log(err)
            res.sendStatus(500);
            }
            if(org){
                exists = true;
            }
            res.send({exists: exists});
        })
        }
        else{
        res.sendStatus(400);
        }
  });
  
router.post("/create", verifyUser, (req, res) => {
    if(req.body.name){
        Organization.findOne({_name_lower: req.body.name.toLowerCase().trim()}, (err, org) => {
            if(err){
                console.log(err);
            }
            if(org){
                res.sendStatus(400);
            }
            else{
                Organization.create({
                    name: req.body.name,
                    _name_lower:req.body.name.toLowerCase(),
                    users: [{userId: req.user._id, permissions:3, accepted: true}]
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