const mongoose = require("mongoose");

const schema = require("./schemas/CTItemSchema");

module.exports = mongoose.model("CTItem", schema);
