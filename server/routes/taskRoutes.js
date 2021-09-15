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

router.post("/save", verifyUser, async(req, res) => {
    let reqPermission = String(req.body.task._id) === "0" ? 2 : 1;
    OrgFunctions.OrganizationUserHasPermissionAsync(req.body.organization, req.user._id, reqPermission)
    .then(r => {
        if(r.isValid){
            let newTask = {
                itemId: req.body.task.itemId,
                organizationId: r.orgId,
                title: req.body.task.title,
                serviceVendor: req.body.task.serviceVendor,
                isMandatory: req.body.task.isMandatory,
                interval: req.body.task.interval,
                completeDate: req.body.task.completeDate,
                actionType: req.body.task.actionType,
                remarks: req.body.task.remarks
            }
            if(reqPermission === 2){
                CTTask.create(newTask)
                .then((t) => {
                    CTItem.findByIdAndUpdate(req.body.task.itemId, {$push:{tasks: t._id}}, {useFindAndModify: false})
                    .then(() => res.sendStatus(200));
                })
            }
            else{
                CTTask.findByIdAndUpdate(req.body.task._id, newTask, {useFindAndModify:false})
                .then(() => {res.sendStatus(200)});
            }
        }
        else{
            res.sendStatus(403);
        }
    })
    .catch(() => res.sendStatus(500));
})

router.post("/delete", verifyUser, async(req, res) => {
    CTTask.findById(req.body.taskId)
    .then(task => {
        OrgFunctions.OrganizationUserHasPermissionAsync("",req.user._id,2,task.organizationId)
        .then(r => {
            if(r.isValid){
                CTTask.findByIdAndDelete(task._id, {useFindAndModify: false})
                .then(res.sendStatus(200));
            }
            else{
                res.sendStatus(403);
            }
        })
    })
    .catch(() => res.sendStatus(500))
})

module.exports = router;