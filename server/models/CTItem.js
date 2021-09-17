const mongoose = require("mongoose");

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
        required: true
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
    inOperation: {
        type: Boolean,
        required: true
    },
    model: {
        type: String,
        default: ""
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
    readPublic: {
        type: Boolean,
        default: false
    },
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref: "CTTask"}]
}, { timestamps: true });

const CTItem = mongoose.model("CTItem", CTItemSchema);
module.exports = CTItem;