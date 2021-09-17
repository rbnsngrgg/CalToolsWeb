import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from "../components/navbar";
import { expect } from "@jest/globals";
const supertest = require("supertest");
// const server = require("../../../server/server");

test("True", () => {
    expect(true).toBe(true);
    render(<Navbar/>);
})