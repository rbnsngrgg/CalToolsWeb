const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organization = require("../models/Organization");
const OrgUserFunctions = require("../common/OrganizationUsers");
const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser } = require("../authenticate");
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get("/:organization", verifyUser, async(req, res) => {
    OrgUserFunctions.OrganizationUserHasPermissionAsync(req.params.organization, req.user._id, 0)
        .then(r => {
            if(r){
                console.log("Valid");
                Organization.findOne({_nameLower: req.params.organization.toLowerCase()})
                    .then(org => {
                        res.send([]);
                    })
                res.sendStatus(200);
            }
            else{
                console.log("Not valid");
                res.sendStatus(401);
            }
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(404);
        })
});

  module.exports = router;