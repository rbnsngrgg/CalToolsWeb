const mongoose = require("mongoose");

export const CTItemSchema = mongoose.Schema({
    organizationId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Organization",
        required: true,
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
    tasks: [{type: mongoose.SchemaTypes.ObjectId, ref: "CTTask"}]
}, { timestamps: true });

const CTItem = mongoose.model("CTItem", CTItemSchema);
export default CTItem;