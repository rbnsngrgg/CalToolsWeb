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
    OrgFunctions.OrganizationUserHasPermissionAsync(req.body.organization, req.user._id, 2)
    .then( r => {
        if(r.isValid){
            let task = {
                ...req.body.taskData,
                organizationId: r.orgId,
                technician: req.user._id
            }
            TaskData.create(task)
            .then((t) => {
                CTTask.findByIdAndUpdate(t.parentTaskId, {completeDate: t.completeDate,$push:{taskData: t._id}}, {useFindAndModify: false})
                .then(() => res.sendStatus(200));
            });
        }
        else{
            res.sendStatus(403);
        }
    })
    .catch((e) => {console.log(e);res.sendStatus(500);})
});

module.exports = router;