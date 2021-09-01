const mongoose = require("mongoose");
const CTTaskSchema = require("./CTTask");

const CTItemSchema = mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },
    itemCategory: {
        type: String,
        default: "General Items"
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        default: ""
    },
    manufacturer: {
        type: String,
        default: ""
    },
    itemDescription: {
        type: String,
        default: ""
    },
    inService: {
        type: Boolean,
        required: true
    },
    model: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        default: "Default Category"
    },
    itemGroup: {
        type: String,
        default: ""
    },
    remarks: {
        type: String,
        default: ""
    },
    isStandardEquipment: {
        type: Boolean,
        default: false
    },
    certificateNumber: {
        type: String,
        default: ""
    },
    tasks: [CTTaskSchema]
}, { timestamps: true });

const CTItem = mongoose.model("CTItem", CTItemSchema);
module.exports = CTItem;