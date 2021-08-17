const mongoose = require("mongoose");

const schema = {
  properties: {
      serialNumber: {
          type: String,
          required: true
      },
      location: {
          type: String
      },
      manufacturer: {
          type: String
      },
      itemDescription: {
          type: String
      },
      inService: {
          type: Boolean,
          required: true
      },
      model: {
          type: String
      },
      itemGroup: {
      type: String,
      },
      remarks: {
          type: String
      },
      isStandardEquipment: {
          type: Boolean
      },
      certificateNumber: {
          type: String
      },
      timestamp: {
          type: Date
      }
  }
};

module.exports = mongoose.model("CTItem", schema);
