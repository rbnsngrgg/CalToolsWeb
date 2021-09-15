const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organization = require("../models/Organization");
const OrgFunctions = require("../common/OrganizationFunctions");
const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser } = require("../authenticate");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const CTItem = require("../models/CTItem");
const CTTask = require("../models/CTTask");
const TaskData = require("../models/TaskData");

//Get a lits of an organization's items
router.get("/:organization", verifyUser, async(req, res) => {
    OrgFunctions.OrganizationUserHasPermissionAsync(req.params.organization, req.user._id, 0)
        .then(r => {
            if(r.isValid){
                CTItem.find({organizationId: r.orgId})
                    .then(orgItems => {
                        let list = orgItems.map(i => {return {itemCategory: i.itemCategory, serialNumber: i.serialNumber}})
                        res.send({items: list});
                    });
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

//Get one item's details
router.get("/:organization/:serialNumber", verifyUser, async(req,res) => {
    OrgFunctions.OrganizationUserHasPermissionAsync(req.params.organization, req.user._id, 0)
        .then(r => {
            if(r.isValid){
                CTItem.findOne({organizationId: r.orgId, serialNumber: req.params.serialNumber})
                    .then(item => {
                        res.send({item:item});
                    })
            }
        });
});

//Get specific item's tasks
router.get("/:organization/:serialNumber/tasks", verifyUser, async(req,res) => {
    OrgFunctions.OrganizationUserHasPermissionAsync(req.params.organization, req.user._id, 0)
        .then(r => {
            if(r.isValid){
                CTItem.findOne({organizationId: r.orgId, serialNumber: req.params.serialNumber})
                    .populate({path: 'tasks', populate: {path: 'taskData'}})
                    .then(item => {
                        res.send({tasks:item.tasks});
                    })
            }
        })
});

//Save an item (create or update)
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
                        CTItem.create(item);
                        res.sendStatus(200);
                    }
                    else if(reqPermission == 1){
                        CTItem.findOneAndUpdate({organizationId: r.orgId, serialNumber: req.body.item.serialNumber}, item, {useFindAndModify:false})
                        .then(item => {
                            res.sendStatus(200);
                        })
                    }
                }
                else{
                    res.sendStatus(401);
                }
            })
        })
});

//Delete an item
router.post("/delete", verifyUser, async(req, res) => {
    OrgFunctions.OrganizationUserHasPermissionAsync(req.body.organization, req.user._id, 2)
    .then(r => {
        if(r.isValid){
            CTItem.deleteOne({organizationId: r.orgId, serialNumber: req.body.serialNumber})
            .then(result => {
                if(result.ok){res.sendStatus(200);}
                else{res.sendStatus(500);}
            });
        }
        else{
            res.statusMessage = "Not authorized to delete items within the current organization."
            res.sendStatus(403);
        }
    })
    .catch(() => res.sendStatus(500));
});

module.exports = router;