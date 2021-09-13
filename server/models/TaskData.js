const mongoose = require("mongoose");

const TaskDataSchema = mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },
    parentTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CTTask",
        required: true,
    },
    standardEquipment: [{type: mongoose.Schema.Types.ObjectId, ref: "StandardEquipment"}],
    serialNumber: {
        type: String,
        required: true
    },
    inToleranceBefore: {
        type: Boolean,
        required: true
    },
    operationalBefore: {
        type: Boolean,
        required: true
    },
    inToleranceAfter: {
        type: Boolean,
        required: true
    },
    operationalAfter: {
        type: Boolean,
        required: true
    },
    calibrated: {
        type: Boolean,
        required: true
    },
    verified: {
        type: Boolean,
        required: true
    },
    adjusted: {
        type: Boolean,
        required: true
    },
    repaired: {
        type: Boolean,
        required: true
    },
    maintenance: {
        type: Boolean,
        required: true
    },
    completeDate: {
        type: Date,
        required: true
    },
    procedure: {
        type: String,
    },
    remarks: {
        type: String,
    },
    technician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    findings: [{
        name: {
            type: String,
            required: true
        },
        tolerance: {
            type: Number
        },
        toleranceIsPercent: {
            type: Boolean
        },
        unitOfMeasure: {
            type: String,
            required: true
        },
        measurementBefore: {
            type: Number
        },
        measurementAfter: {
            type: Number,
            required: true
        },
        setting: {
            type: Number
        }
    }]
}, { timestamps: true });

const TaskData = mongoose.model("TaskData", TaskDataSchema);
module.exports = TaskData;
