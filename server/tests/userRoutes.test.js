const app = require("../server");
import Organization from "../models/Organization";
import CTItem from "../models/CTItem";
import CTTask from "../models/CTTask";
import { expect } from "@jest/globals";
import { response } from "express";
import User from "../models/User";
//const CTItem = require("../models/CTItem");
const mongoose = require("mongoose");
const supertest = require("supertest");

let cookie;
let token;

const testUser = {
    firstName: "Test",
    lastName: "User",
    email: "user1@testusers.com",
    password: "test1234"
}

const testUser2 = {
    firstName: "Test2",
    lastName: "User2",
    email: "user2@testusers.com",
    password: "test4321"
}

async function createAndLoginUser(){
    const res = await supertest(app).post("/api/users/signup").send(testUser);
    cookie = res.headers['set-cookie'];
    token = res.body.token;
}

beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/userRoutesTestdb",
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
});
beforeEach(async () => {
    await createAndLoginUser();
});
afterEach(async () => {
    await User.deleteMany();
    // mongoose.connection.db.dropDatabase(() => {
    // mongoose.connection.close(() => done())
    // });
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

test("GetUserProfile", async () => {
    const userRes = await supertest(app).get("/api/users/me")
    .set('Authorization', `Bearer ${token}`)
    .send();
    let userDetails = userRes.body;
    expect(userDetails._id).toBeTruthy();
    expect(userDetails.email).toEqual(testUser.email);
    expect(userDetails.firstName).toEqual(testUser.firstName);
    expect(userDetails.lastName).toEqual(testUser.lastName);
});

test("Retrieve user org names", async () => {
    const createOrg = await supertest(app).post("/api/organizations/create")
    .set('Authorization', `Bearer ${token}`)
    .send({name: "TestOrg", users: []});
    const orgRes = await supertest(app).get("/api/users/me/organizations")
    .set('Authorization', `Bearer ${token}`)
    .send();
    expect(orgRes.body[0]).toEqual("TestOrg");
});

test("Retrieve user invitations", async () => {

});