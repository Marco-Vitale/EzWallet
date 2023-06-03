import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
import { handleDateFilterParams, verifyAuth, verifyEmail, handleAmountFilterParams } from '../controllers/utils';

jest.mock("bcryptjs")
jest.mock("jsonwebtoken")
jest.mock("../models/User.js")
jest.mock("../models/model.js")

beforeEach(() => {
    jest.clearAllMocks()
})

describe("handleDateFilterParams", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("verifyAuth", () => {
    test("Simple auth: Should return a flag/label setted to true", () => {
        const req = { cookies: { accessToken: "exampleUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {}

        const decodedToken = {
            email: "tester@test.com",
            username: "tester",
            role: "User"
        }

        jwt.verify.mockReturnValue(decodedToken)

        const response = verifyAuth(req, res, { authType: "Simple" })

        expect(Object.values(response).includes(true)).toBe(true)
    });

    test("User auth: Should return a flag/label setted to true", () => {
        const req = { cookies: { accessToken: "exampleUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {}

        const decodedToken = {
            email: "tester@test.com",
            username: "tester",
            role: "User"
        }

        jwt.verify.mockReturnValue(decodedToken)

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })

        expect(Object.values(response).includes(true)).toBe(true)
    });

    test("Admin auth: Should return a flag/label setted to true", () => {
        const req = { cookies: { accessToken: "exampleAdminAccToken", refreshToken: "exampleAdminRefToken" } }
        const res = {}

        const decodedToken = {
            email: "tester@test.com",
            username: "tester",
            role: "Admin"
        }

        jwt.verify.mockReturnValue(decodedToken)

        const response = verifyAuth(req, res, { authType: "Admin" })

        expect(Object.values(response).includes(true)).toBe(true)
    });

    test("Group auth: Should return a flag/label setted to true", () => {
        const req = { cookies: { accessToken: "exampleUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {}

        const decodedToken = {
            email: "tester@test.com",
            username: "tester",
            role: "User"
        }

        jwt.verify.mockReturnValue(decodedToken)

        const response = verifyAuth(req, res, { authType: "Group", emails: ["tester@test.com", "other_tester@test.com", "another_tester@test.com"] })

        expect(Object.values(response).includes(true)).toBe(true)
    });
})

describe("verifyEmail", () => {
    test("Correct email format: Should return true", () => {
        const email = "test1@test.com"

        const result = verifyEmail(email)

        expect(result).toBe(true)
    });

    test("Incorrect email format: Should return false", () => {
        const email = "test1test.com"

        const result = verifyEmail(email)

        expect(result).toBe(false)
    });
})

describe("handleAmountFilterParams", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
