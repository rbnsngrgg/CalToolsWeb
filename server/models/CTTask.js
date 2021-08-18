const mongoose = require("mongoose");

export const CTTaskSchema = mongoose.Schema({
    organizationId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Organization",
        required: true,
    },
    parentItemId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "CTItem",
        required: true,
    },
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
    taskData: [{type: mongoose.SchemaTypes.ObjectId, ref: "TaskData"}]
}, { timestamps: true });

const CTTask = mongoose.model("CTTask", TaskSchema);
export default CTTask;
