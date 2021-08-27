/*
User permissions are:
    0 - Read only
    1 - Read/Update
    2 - Create/Read/Update/Delete
    3 - Organization Admin (Can modify user permissions and edit the organization details)
Organizations always have at least one admin.
*/
const mongoose = require("mongoose");

const OrganizationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: {
            unique: true,
            collation: {
                locale: "en",
                strength: 2,
            }
        }
    },
    _name_lower: {
        type: String,
        required: true,
        index: {
            unique: true,
            collation: {
                locale: "en",
                strength: 2,
            }
        }
    },
    users: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        permissions: {
            type: Number,
            min: 0,
            max: 3,
            required: true
        },
        accepted: {
            type: Boolean,
            required: true
        }
    }],
}, { timestamps: true });

const Organization = mongoose.model("Organization", OrganizationSchema);
module.exports = Organization;
