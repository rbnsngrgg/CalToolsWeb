const app = require("../server");
import Organization from "../models/Organization";
import CTItem from "../models/CTItem";
//const CTItem = require("../models/CTItem");
const mongoose = require("mongoose");
const supertest = require("supertest");

async function insertTestOrg(){
    await Organization.create({
        name: "TestOrg",
    });
}

beforeEach((done) => {
    mongoose.connect("mongodb://localhost:27017/TestDb",
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
      () => {insertTestOrg(); done();})
});
afterEach((done) => {
mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done())
    });
});
  

test("Test CTITem schema validation", async () => {
    // Blank item
    await expect(async () => {await CTItem.create({})}).rejects.toThrow("CTItem validation failed");
    // Missing organizationId
    await expect(async () => {await CTItem.create({
        serialNumber: "TestItem1",
        location: "TestArea",
        manufacturer: "GHR",
        itemDescription: "Test CTItem",
        inService: false,
        model: "111223",
        itemGroup: "Test Items",
        remarks: "If this is still in the database, tests are not running properly",
        isStandardEquipment: true,
        certificateNumber: "TestCert1"
    })}).rejects.toThrow("CTItem validation failed");
    // Missing serial number
    await expect(async () => {await CTItem.create({
        location: "TestArea",
        manufacturer: "GHR",
        itemDescription: "Test CTItem",
        inService: false,
        model: "111223",
        itemGroup: "Test Items",
        remarks: "If this is still in the database, tests are not running properly",
        isStandardEquipment: true,
        certificateNumber: "TestCert1"
    })}).rejects.toThrow("CTItem validation failed");
    // Missing inService
    await expect(async () => {await CTItem.create({
        serialNumber: "TestItem1",
        location: "TestArea",
        manufacturer: "GHR",
        itemDescription: "Test CTItem",
        model: "111223",
        itemGroup: "Test Items",
        remarks: "If this is still in the database, tests are not running properly",
        isStandardEquipment: true,
        certificateNumber: "TestCert1"
    })}).rejects.toThrow("CTItem validation failed");
});

test("GET /data/items", async () => {
    const org = await Organization.findOne({name: "TestOrg"});
    const item = await CTItem.create({
        organizationId: org._id,
        serialNumber: "TestItem1",
        location: "TestArea",
        manufacturer: "GHR",
        itemDescription: "Test CTItem",
        inService: false,
        model: "111223",
        itemGroup: "Test Items",
        remarks: "If this is still in the database, tests are not running properly",
        isStandardEquipment: true,
        certificateNumber: "TestCert1"
    });
    await supertest(app).get("/data/items")
      .expect(200)
      .then((response) => {
        // Check type and length
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toEqual(1);
  
        // Check data
        expect(response.body[0]._id).toBe(item.id);
        expect(response.body[0].serialNumber).toBe(item.serialNumber);
        expect(response.body[0].location).toBe(item.location);
        expect(response.body[0].manufacturer).toBe(item.manufacturer);
        expect(response.body[0].itemDescription).toBe(item.itemDescription);
        expect(response.body[0].inService).toBe(item.inService); 
        expect(response.body[0].model).toBe(item.model);
        expect(response.body[0].itemGroup).toBe(item.itemGroup);
        expect(response.body[0].remarks).toBe(item.remarks);
        expect(response.body[0].isStandardEquipment).toBe(item.isStandardEquipment);
        expect(response.body[0].certificateNumber).toBe(item.certificateNumber);
        // Check automatic timestamps
        expect(response.body[0].createdAt).toBeDefined()
        expect(response.body[0].createdAt.length).toBeGreaterThan(0)
        expect(response.body[0].updatedAt).toBeDefined()
        expect(response.body[0].updatedAt.length).toBeGreaterThan(0)
      });
  });