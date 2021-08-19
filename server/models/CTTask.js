//This document is to be embedded in the CTItem, and thus has no model to generate a collection
const mongoose = require("mongoose");

const CTTaskSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    serviceVendor: {
        type: String,
        default: ""
    },
    isMandatory: {
        type: Boolean,
        default: true
    },
    interval: {
        type: Number,
        default: 12
    },
    completeDate: {
        type: Date
    },
    actionType: {
        type: String,
        required: true
    },
    remarks: {
        type: String,
        default: ""
    },
    dateOverride: {
        type: Date
    },
    taskData: [{type: mongoose.Schema.Types.ObjectId, ref: "TaskData"}]
}, { timestamps: true });

module.exports = CTTaskSchema;
