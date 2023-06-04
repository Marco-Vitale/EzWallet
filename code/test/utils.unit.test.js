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
    test("Should return the condition just for the min", () => {
        const req = {
            query: {
                min: 50
            }
        }

        const result = handleAmountFilterParams(req)

        expect(result).toHaveProperty("amount")
        expect(result.amount).toHaveProperty("$gte")
        expect(result.amount.$gte).toBe(50)
    });

    test("Should return the condition for the min and max", () => {
        const req = {
            query: {
                min: 50,
                max: 100
            }
        }

        const result = handleAmountFilterParams(req)

        expect(result).toHaveProperty("$and")
        expect(result.$and.length).toBe(2)
        expect(result.$and[0]).toHaveProperty("amount") //check that the max amount is defined
        expect(result.$and[1]).toHaveProperty("amount") //check that the min amount is defined
        expect(result.$and.find(element => element.amount.$lte).amount.$lte).toBe(100)
        expect(result.$and.find(element => element.amount.$gte).amount.$gte).toBe(50)
    });

    test("Should return error (min is not a number), max is a number", () => {
        const req = {
            query: {
                min: "NaN",
                max: 100
            }
        }

        expect(() => handleAmountFilterParams(req)).toThrow()
    });

    test("Should return error (max is not a number), min is a number", () => {
        const req = {
            query: {
                min: 50,
                max: "NaN"
            }
        }

        expect(() => handleAmountFilterParams(req)).toThrow()
    });

    test("Should return error (min is not a number)", () => {
        const req = {
            query: {
                min: "NaN"
            }
        }

        expect(() => handleAmountFilterParams(req)).toThrow()
    });

    test("Should return error (max is not a number)", () => {
        const req = {
            query: {
                max: "NaN"
            }
        }

        expect(() => handleAmountFilterParams(req)).toThrow()
    });

    test("Should return an ampty result", () => {
        const req = {
            query: {}
        }

        const result = handleAmountFilterParams(req)

        expect(result).toEqual({})
    });
})
