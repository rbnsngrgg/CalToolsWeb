//CTItem schema
//Needs to be converted to Mongoose-friendly format
const schema = {
    required: ["serialNumber", "inService"],
    properties: {
        serialNumber: {
            bsonType: "string",
            description: "Serial number of the item. Must be a string and is required."
        },
        location: {
            bsonType: "string",
            description: "String. Physical location of the item."
        },
        manufacturer: {
            bsonType: "string"
        },
        itemDescription: {
            bsonType: "string"
        },
        inService: {
            bsonType: "bool",
            description: "Boolean. Whether or not the item is in use."
        },
        model: {
            bsonType: "string"
        },
        itemGroup: {
        bsonType: "string",
            description: "String. An arbitrary label for grouping similar items."
        },
        remarks: {
            bsonType: "string"
        },
        isStandardEquipment: {
            bsonType: "bool",
            description: "Boolean. Indicates if the item is used for calibration, verification, or maintenance of other items."
        },
        certificateNumber: {
            bsonType: "string",
            description: "An identifier for records indicating the compliance of items that have \"isStandardEquipment\" == true"
        },
        timestamp: {
            bsonType: "timestamp",
            description: "Server-generated timestamp indicating the last write time for the document."
        }
    }
}
  
module.exports = schema;
