import jwt, { TokenExpiredError } from 'jsonwebtoken';
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

    test("Simple auth: Should return a flag/label setted to false (missing informations)", () => {
        const req = { cookies: { accessToken: "exampleUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {}

        const decodedToken = {
            email: "tester@test.com",
            role: "User"
        }

        jwt.verify.mockReturnValue(decodedToken)

        const response = verifyAuth(req, res, { authType: "Simple" })

        expect(Object.values(response).includes(false)).toBe(true)
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

    test("User auth: Should return a flag/label setted to false (mismatched informations)", () => {
        const req = { cookies: { accessToken: "exampleUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {}

        const decodedAccToken = {
            email: "tester1@test.com",
            username: "tester1",
            role: "User"
        }

        const decodedRefToken = {
            email: "tester2@test.com",
            username: "tester2",
            role: "User"
        }

        jwt.verify.mockReturnValueOnce(decodedAccToken)
        jwt.verify.mockReturnValueOnce(decodedRefToken)

        const response = verifyAuth(req, res, { authType: "User", username: "tester1" })

        expect(Object.values(response).includes(false)).toBe(true)
    });

    test("User auth: Should return a flag/label setted to false (request for a different user)", () => {
        const req = { cookies: { accessToken: "exampleUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {}

        const decodedToken = {
            email: "tester@test.com",
            username: "tester",
            role: "User"
        }

        jwt.verify.mockReturnValue(decodedToken)

        const response = verifyAuth(req, res, { authType: "User", username: "otherUser" })

        expect(Object.values(response).includes(false)).toBe(true)
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

    test("Admin auth: Should return a flag/label setted to false (requested auth for a different role)", () => {
        const req = { cookies: { accessToken: "exampleAdminAccToken", refreshToken: "exampleAdminRefToken" } }
        const res = {}

        const decodedToken = {
            email: "tester@test.com",
            username: "tester",
            role: "User"
        }

        jwt.verify.mockReturnValue(decodedToken)

        const response = verifyAuth(req, res, { authType: "Admin" })

        expect(Object.values(response).includes(false)).toBe(true)
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

    test("Group auth: Should return a flag/label setted to false (mail of the token not present in the group)", () => {
        const req = { cookies: { accessToken: "exampleUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {}

        const decodedToken = {
            email: "tester@test.com",
            username: "tester",
            role: "User"
        }

        jwt.verify.mockReturnValue(decodedToken)

        const response = verifyAuth(req, res, { authType: "Group", emails: ["err_tester@test.com", "other_tester@test.com", "another_tester@test.com"] })

        expect(Object.values(response).includes(false)).toBe(true)
    });

    test("Simple auth: Should return a flag/label setted to true and set the new accessToken", () => {
        const req = { cookies: { accessToken: "experiedUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {
            cookie: jest.fn(),
            locals: {
                refreshedTokenMessage: undefined
            }
        }

        const decodedToken = {
            id: "aaa",
            email: "tester@test.com",
            username: "tester",
            role: "User"
        }

        const err = {
            "name": "TokenExpiredError",
            "message": "jwt expired",
            "expiredAt": "2017-07-19T17:08:44.000Z"
        }

        const error = () => {
            throw err;
          };
        

        jwt.verify.mockImplementationOnce(error)
        jwt.verify.mockReturnValue(decodedToken)

        jwt.sign.mockReturnValue("newAccToken")

        res.cookie.mockImplementation(() => { return "newAccToken" })

        const response = verifyAuth(req, res, { authType: "Simple" })

        expect(Object.values(response).includes(true)).toBe(true)
        expect(res.locals.refreshedTokenMessage).toEqual(expect.any(String))
    });

    test("User auth: Should return a flag/label setted to true and set the new accessToken", () => {
        const req = { cookies: { accessToken: "experiedUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {
            cookie: jest.fn(),
            locals: {
                refreshedTokenMessage: undefined
            }
        }

        const decodedToken = {
            id: "aaa",
            email: "tester@test.com",
            username: "tester",
            role: "User"
        }

        const err = {
            "name": "TokenExpiredError",
            "message": "jwt expired",
            "expiredAt": "2017-07-19T17:08:44.000Z"
        }

        const error = () => {
            throw err;
          };
        

        jwt.verify.mockImplementationOnce(error)
        jwt.verify.mockReturnValue(decodedToken)

        jwt.sign.mockReturnValue("newAccToken")

        res.cookie.mockImplementation(() => { return "newAccToken" })

        const response = verifyAuth(req, res, { authType: "User", username: "tester" })

        expect(Object.values(response).includes(true)).toBe(true)
        expect(res.locals.refreshedTokenMessage).toEqual(expect.any(String))
    });

    test("Admin auth: Should return a flag/label setted to true and set the new accessToken", () => {
        const req = { cookies: { accessToken: "experiedUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {
            cookie: jest.fn(),
            locals: {
                refreshedTokenMessage: undefined
            }
        }

        const decodedToken = {
            id: "aaa",
            email: "tester@test.com",
            username: "tester",
            role: "Admin"
        }

        const err = {
            "name": "TokenExpiredError",
            "message": "jwt expired",
            "expiredAt": "2017-07-19T17:08:44.000Z"
        }

        const error = () => {
            throw err;
          };
        

        jwt.verify.mockImplementationOnce(error)
        jwt.verify.mockReturnValue(decodedToken)

        jwt.sign.mockReturnValue("newAccToken")

        res.cookie.mockImplementation(() => { return "newAccToken" })

        const response = verifyAuth(req, res, { authType: "Admin" })

        expect(Object.values(response).includes(true)).toBe(true)
        expect(res.locals.refreshedTokenMessage).toEqual(expect.any(String))
    });

    test("Group auth: Should return a flag/label setted to true and set the new accessToken", () => {
        const req = { cookies: { accessToken: "experiedUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {
            cookie: jest.fn(),
            locals: {
                refreshedTokenMessage: undefined
            }
        }

        const decodedToken = {
            id: "aaa",
            email: "tester@test.com",
            username: "tester",
            role: "User"
        }

        const err = {
            "name": "TokenExpiredError",
            "message": "jwt expired",
            "expiredAt": "2017-07-19T17:08:44.000Z"
        }

        const error = () => {
            throw err;
          };
        

        jwt.verify.mockImplementationOnce(error)
        jwt.verify.mockReturnValue(decodedToken)

        jwt.sign.mockReturnValue("newAccToken")

        res.cookie.mockImplementation(() => { return "newAccToken" })

        const response = verifyAuth(req, res, { authType: "Group", emails: ["tester@test.com", "other_tester@test.com", "another_tester@test.com"] })

        expect(Object.values(response).includes(true)).toBe(true)
        expect(res.locals.refreshedTokenMessage).toEqual(expect.any(String))
    });
    
    test("Error auth: Should return a flag/label setted to false (undefined auth)", () => {
        const req = { cookies: { accessToken: "exampleUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {}

        const decodedToken = {
            email: "tester@test.com",
            username: "tester",
            role: "User"
        }

        jwt.verify.mockReturnValue(decodedToken)

        const response = verifyAuth(req, res, { authType: "ErrAuthType" })

        expect(Object.values(response).includes(false)).toBe(true)
    });

    test("Simple auth: Should return a flag/label setted to false (perform login again)", () => {
        const req = { cookies: { accessToken: "experiedUserAccToken", refreshToken: "exampleUserRefToken" } }
        const res = {
            cookie: jest.fn(),
            locals: {
                refreshedTokenMessage: undefined
            }
        }

        const decodedToken = {
            id: "aaa",
            email: "tester@test.com",
            username: "tester",
            role: "User"
        }

        const err = {
            "name": "TokenExpiredError",
            "message": "jwt expired",
            "expiredAt": "2017-07-19T17:08:44.000Z"
        }

        const error = () => {
            throw err;
          };
        

        jwt.verify.mockImplementation(error)

        const response = verifyAuth(req, res, { authType: "Simple" })

        expect(Object.values(response).includes(false)).toBe(true)
        expect(response.cause).toEqual("Perform login again")
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
