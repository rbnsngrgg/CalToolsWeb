const mongoose = require("mongoose");

export const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true
    },
    organizations: [{type: mongoose.SchemaTypes.ObjectId, ref: "Organization"}],
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
export default User;
