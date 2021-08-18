/*
User permissions are:
    0 - Read only
    1 - Read/Update
    2 - Create/Read/Update/Delete
    3 - Organization Admin (Can modify user permissions and edit the organization details)
Organizations always have at least one admin.
*/
const mongoose = require("mongoose");

export const OrganizationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    users: [{
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User"
        },
        permissions: {
            type: Number,
            min: 0,
            max: 2,
            required: true
        }
    }],
    items: [{type: mongoose.SchemaTypes.ObjectId, ref: "CTItem"}],
    tasks: [{type: mongoose.SchemaTypes.ObjectId, ref: "CTTask"}],
    taskData: [{type: mongoose.SchemaTypes.ObjectId, ref: "TaskData"}],
    standardEquipment: [{type: mongoose.SchemaTypes.ObjectId, ref: "StandardEquipment"}]
}, { timestamps: true });

const Organization = mongoose.model("Organization", OrganizationSchema);
export default Organization;
