//Database CRUD
const e = require("express");
const express = require("express");
const router = express.Router();
import CTItem from "../models/CTItem"

router.get("/items", async (req, res) => {
    const items = await CTItem.find();
    res.send(items);
});

router.get("/items/:serialNumber", (req, res) => {
    const item = CTItem.findOne({serialNumber: req.params.serialNumber}, (err, item) => {
        if(err) { console.log(err); }
        else { res.send(item); }
    });
});

module.exports = router;