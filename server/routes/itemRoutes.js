const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organization = require("../models/Organization");
const OrgFunctions = require("../common/OrganizationFunctions");
const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser } = require("../authenticate");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const CTItem = require("../models/CTItem");

router.get("/:organization", verifyUser, async(req, res) => {
    OrgFunctions.OrganizationUserHasPermissionAsync(req.params.organization, req.user._id, 0)
        .then(r => {
            if(r){
                Organization.findOne({_nameLower: req.params.organization.toLowerCase()})
                    .then(org => {
                        res.send({items: []});
                    })
            }
            else{
                res.sendStatus(401);
            }
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(404);
        })
});

router.post("/save", verifyUser, async(req, res) => {
    let reqPermission = 2
    //Check if item exists in org. If it exists, permission of at least 1 is required. If not, permission of at least 2
    OrgFunctions.OrgHasItem(req.body.organization, req.body.item.serialNumber)
        .then(exists => {
            if(exists){reqPermission = 1;}
        })
        .then(() => {
            OrgFunctions.OrganizationUserHasPermissionAsync(req.body.organization, req.user._id, reqPermission)
            .then(r => {
                if(r.isValid){
                    if(!req.body.item.serialNumber) {res.sendStatus(401)}
                    let item = {
                        organizationId: r.orgId,
                        itemCategory: req.body.item.itemCategory || "General Items",
                        serialNumber: req.body.item.serialNumber,
                        location: req.body.item.location || "",
                        manufacturer: req.body.item.manufacturer || "",
                        itemDescription: req.body.item.itemDescription || "",
                        inOperation: req.body.item.inOperation,
                        model: req.body.item.model || "",
                        itemGroup: req.body.item.itemGroup || "",
                        remarks: req.body.item.remarks || "",
                        isStandardEquipment: req.body.item.isStandardEquipment || false,
                        certificateNumber: req.body.item.certificateNumber || ""
                    }
                    if(reqPermission == 2){
                        //create
                        console.log(item);
                    }
                    else if(reqPermission == 1){
                        //update
                    }
                    //CTItem.create();
                    
                    res.sendStatus(200);
                }
                else{
                    res.sendStatus(401);
                }
            })
        })
});

  module.exports = router;