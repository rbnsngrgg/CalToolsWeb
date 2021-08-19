// Historical records of equipment used in calibration/verification.
// Users do not have write permissions for these records.
const mongoose = require("mongoose");

export const SESchema = mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },
    serialNumber: {
        type: String,
        required: true,
    },
    manufacturer: {
        type: String,
        default: ""
    },
    itemDescription: {
        type: String,
        default: ""
    },
    model: {
        type: String,
        default: ""
    },
    remarks: {
        type: String,
        default: ""
    },
    certificateNumber: {
        type: String,
        default: "",
        required: true
    },
}, { timestamps: true });

const StandardEquipment = mongoose.model("StandardEquipment", SESchema);
export default StandardEquipment;