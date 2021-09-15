const app = require("../server");
import Organization from "../models/Organization";
import CTItem from "../models/CTItem";
import CTTask from "../models/CTTask";
import { expect } from "@jest/globals";
//const CTItem = require("../models/CTItem");
const mongoose = require("mongoose");
const supertest = require("supertest");

async function insertTestOrg(){
    await Organization.create({
        name: "TestOrg",
        _name_lower: "testorg"
    });
}

beforeEach((done) => {
    mongoose.connect("mongodb://127.0.0.1:27017/TestDb",
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
      async () => {await insertTestOrg(); done();})
});
afterEach((done) => {
mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done())
    });
});
  

test("Test CTItem schema validation", async () => {
    const org = await Organization.findOne({name: "TestOrg"});
    // Blank item
    await expect(async () => {await CTItem.create({})}).rejects.toThrow("CTItem validation failed");
    // Missing organizationId
    await expect(async () => {await CTItem.create({
        serialNumber: "TestItem1",
        location: "TestArea",
        manufacturer: "GHR",
        itemDescription: "Test CTItem",
        inOperation: false,
        model: "111223",
        itemGroup: "Test Items",
        remarks: "If this is still in the database, tests are not running properly",
        isStandardEquipment: true,
        certificateNumber: "TestCert1"
    })}).rejects.toThrow("CTItem validation failed");
    // Missing serial number
    await expect(async () => {await CTItem.create({
        organizationId: org._id,
        location: "TestArea",
        manufacturer: "GHR",
        itemDescription: "Test CTItem",
        inOperation: false,
        model: "111223",
        itemGroup: "Test Items",
        remarks: "If this is still in the database, tests are not running properly",
        isStandardEquipment: true,
        certificateNumber: "TestCert1"
    })}).rejects.toThrow("CTItem validation failed");
    // Missing inOperation
    await expect(async () => {await CTItem.create({
        organizationId: org._id,
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