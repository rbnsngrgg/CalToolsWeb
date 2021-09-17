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

let user2Cookie;
let user2Token;

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

async function createUser2() {
    const res = await supertest(app).post("/api/users/signup").send(testUser2);
    user2Cookie = res.headers['set-cookie'];
    user2Token = res.body.token;
}

beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/userRoutesTestdb",
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
});
beforeEach(async () => {
    await createAndLoginUser();
    await createUser2();
});
afterEach(async () => {
    await User.deleteMany();
    await Organization.deleteMany();
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
    await supertest(app).post("/api/organizations/create")
    .set('Authorization', `Bearer ${token}`)
    .send({name: "TestOrg", users: [{email:"user2@testusers.com", permission: 2}]});

    const invitationRes = await supertest(app).get("/api/users/me/invitations")
    .set('Authorization', `Bearer ${user2Token}`)
    .send();
    expect(invitationRes.body.length).toEqual(1);
    expect(invitationRes.body[0].name).toEqual("TestOrg");
    expect(invitationRes.body[0].permissions).toEqual(2);
    expect(invitationRes.body[0].id).toBeTruthy();
});

test("User accepts invitation", async () => {
    await supertest(app).post("/api/organizations/create")
    .set('Authorization', `Bearer ${token}`)
    .send({name: "TestOrg", users: [{email:"user2@testusers.com", permission: 2}]});
    //User has invitation
    let iRes = await supertest(app).get("/api/users/me/invitations")
    .set('Authorization', `Bearer ${user2Token}`)
    .send();
    //User accepts
    await supertest(app).post("/api/users/me/invitations")
    .set('Authorization', `Bearer ${user2Token}`)
    .send({selection:"accept", id: iRes.body[0].id})
    .expect(200);
    //Invitation removed
    let iRes2 = await supertest(app).get("/api/users/me/invitations")
    .set('Authorization', `Bearer ${user2Token}`)
    .send();
    expect(iRes2.body.length).toEqual(0);
    //Organization ID added to user's list of orgs
    let userRes = await supertest(app).get("/api/users/me")
    .set('Authorization', `Bearer ${user2Token}`)
    .send();
    expect(userRes.body.organizations.length).toEqual(1);
    expect(userRes.body.organizations[0]).toEqual(iRes.body[0].id);
});

test("User rejects invitation", async () => {
    await supertest(app).post("/api/organizations/create")
    .set('Authorization', `Bearer ${token}`)
    .send({name: "TestOrg", users: [{email:"user2@testusers.com", permission: 2}]});
    //User has invitation
    let iRes = await supertest(app).get("/api/users/me/invitations")
    .set('Authorization', `Bearer ${user2Token}`)
    .send();
    //User rejects
    await supertest(app).post("/api/users/me/invitations")
    .set('Authorization', `Bearer ${user2Token}`)
    .send({selection:"reject", id: iRes.body[0].id})
    .expect(200);
    //Invitation removed
    let iRes2 = await supertest(app).get("/api/users/me/invitations")
    .set('Authorization', `Bearer ${user2Token}`)
    .send();
    expect(iRes2.body.length).toEqual(0);
    //Organization ID NOT added to user's list of orgs
    let userRes = await supertest(app).get("/api/users/me")
    .set('Authorization', `Bearer ${user2Token}`)
    .send();
    expect(userRes.body.organizations.length).toEqual(0);
});

test("User exists route", async () => {
    //User exists
    let existRes = await supertest(app).post("/api/users/exists")
    .set('Authorization', `Bearer ${token}`)
    .send({user: "user2@testusers.com"});
    expect(existRes.body.validUser).toBe(true);
    //User does not exist
    let existRes2 = await supertest(app).post("/api/users/exists")
    .set('Authorization', `Bearer ${token}`)
    .send({user: "fakeUser@testusers.com"});
    expect(existRes2.body.validUser).toBe(false);
});

test("User log out", async () => {
    //valid
    let logoutRes = await supertest(app).get("/api/users/logout")
    .set('Authorization', `Bearer ${token}`)
    .send()
    .expect(200);
    expect(logoutRes.body.success).toBe(true);
    //invalid
    let logoutRes2 = await supertest(app).get("/api/users/logout")
    .set('Authorization', `Bearer ${token}1`)
    .send()
    .expect(401);

});