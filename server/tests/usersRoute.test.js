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

const testUser = {
    firstName: "Test",
    lastName: "User",
    email: "user1@testusers.com",
    password: "test1234"
}

beforeEach((done) => {
    mongoose.connect("mongodb://127.0.0.1:27017/TestDb",
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
      async () => {done();})
});
afterEach((done) => {
mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done())
    });
});

test("Create Valid User", async () => {
    const res = await supertest(app).post("/api/users/signup").send(testUser);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    const user = await User.findOne({email: testUser.email});
    expect(user).toBeTruthy();
});

test("Reject falsy fields", async () => {
    //First name
    let invalidUser = {...testUser}
    invalidUser.firstName = "";
    let res = await supertest(app).post("/api/users/signup")
        .send(invalidUser)
    expect(res.body.success).toBe(false);
    //Last name
    invalidUser = {...testUser}
    invalidUser.lastName = "";
    res = await supertest(app).post("/api/users/signup")
        .send(invalidUser)
    expect(res.body.success).toBe(false);
    expect(res.body.name).toEqual("NameError");
    //Email
    invalidUser = {...testUser}
    invalidUser.email = "";
    res = await supertest(app).post("/api/users/signup")
        .send(invalidUser)
    expect(res.body.success).toBe(false);
    expect(res.body.name).toEqual("EmailError");
});

test("Log in valid user", async () => {
    await supertest(app).post("/api/users/signup").send(testUser);
    const res = await supertest(app).post("/api/users/login")
        .send({email: testUser.email, password: testUser.password});
    expect(res.body.success).toBe(true);
});