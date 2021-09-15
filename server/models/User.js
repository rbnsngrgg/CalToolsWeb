const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const Session = new mongoose.Schema({
    refreshToken: {
        type: String,
        default: ""
    }
});

const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    firstName: {
        type: String,
        //required: true,
    },
    lastName: {
        type: String,
        //required: true
    },
    googleId: String,
    authStrategy: {
        type: String,
        default: "local"
    },
    refreshToken: {
        type: [Session],
    },
    organizations: [{type: mongoose.Schema.Types.ObjectId, ref: "Organization"}],
    invitations: [{
        organization: {type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true},
        permissions: {type: Number, required: true}
    }]
}, { timestamps: true });

userSchema.set("toJSON", {
    transform: function( doc, ret, options) {
        delete ret.refreshToken;
        return ret;
    }
});

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
userSchema.plugin(findOrCreate);


const User = mongoose.model("User", userSchema);
module.exports = User;
