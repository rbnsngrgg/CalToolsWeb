const app = require("../server");
import { expect } from "@jest/globals";
import { response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import User from "../models/User";
const mongoose = require("mongoose");
const supertest = require("supertest");

const testUser = {
    firstName: "Test",
    lastName: "User",
    email: "user1@testusers.com",
    password: "test1234"
}
let cookie;
let token;

beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/localAuthTestDb",
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
});

beforeEach(async () => {
    cookie = null;
    token = null;
});
afterEach(async () => {
    await User.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
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

test("Test refresh token", async () => {
    let agent = supertest.agent(app);
    await agent.post("/api/users/signup").send(testUser);
    //Initial login cookie
    const res = await agent.post("/api/users/login")
        .send({email: testUser.email, password: testUser.password});
    cookie = res.headers['set-cookie'];
    //Get new token
    const refreshRes = await agent.post("/api/users/refreshToken")
    .set('Cookie', cookie)
    .send();
    expect(refreshRes.body.token).toBeTruthy();
    expect(refreshRes.body.token !== res.body.token);
});