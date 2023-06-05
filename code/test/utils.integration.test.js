import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';

dotenv.config();

const adminAccessTokenValid = jwt.sign({
    email: "admin@email.com",
    username: "admin",
    role: "Admin"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })


const adminAccessTokenExpired = jwt.sign({
    email: "admin@email.com",
    username: "admin",
    role: "Admin"
}, process.env.ACCESS_KEY, { expiresIn: '0s' })

const testerAccessTokenValid = jwt.sign({
    email: "tester@test.com",
    username: "tester",
    role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

const testerAccessTokenMissingInfo = jwt.sign({
    email: "tester@test.com",
    role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

const testerAccessTokenExpired = jwt.sign({
    email: "tester@test.com",
    username: "tester",
    role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '0s' })

const testerAccessTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, { expiresIn: "1y" })

describe("handleDateFilterParams", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("verifyAuth", () => { 
    test("Simple auth: Should return a flag/label setted to true", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Simple" })
        expect(Object.values(response).includes(true)).toBe(true)
    });

    test("Simple auth: Should return a flag/label setted to false (missing informations)", () => {
        const req = { cookies: { accessToken: testerAccessTokenMissingInfo, refreshToken: testerAccessTokenMissingInfo } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Simple" })
        expect(Object.values(response).includes(false)).toBe(true)
    });

    test("User auth: Should return a flag/label setted to true", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)
    });

    test("User auth: Should return a flag/label setted to false (mismatched informations)", () => {
        const req = { cookies: { accessToken: testerAccessTokenMissingInfo, refreshToken: testerAccessTokenMissingInfo } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(false)).toBe(true)
    });

    test("User auth: Should return a flag/label setted to false (request for a different user)", () => {
        const req = { cookies: { accessToken: testerAccessTokenMissingInfo, refreshToken: testerAccessTokenMissingInfo } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "User", username: "otherTester" })
        expect(Object.values(response).includes(false)).toBe(true)
    });

    test("Admin auth: Should return a flag/label setted to true", () => {
        const req = { cookies: { accessToken: adminAccessTokenValid, refreshToken: adminAccessTokenValid } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Admin" })
        expect(Object.values(response).includes(true)).toBe(true)
    });

    test("Admin auth: Should return a flag/label setted to false (requested auth for a different role)", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Admin" })
        expect(Object.values(response).includes(false)).toBe(true)
    });
    
    test("Group auth: Should return a flag/label setted to true", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Group", emails: ["tester@test.com", "other_tester@test.com", "another_tester@test.com"] })
        expect(Object.values(response).includes(true)).toBe(true)
    });

    test("Group auth: Should return a flag/label setted to false (mail of the token not present in the group)", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        const response = verifyAuth(req, res, { authType: "Group", emails: ["other_tester@test.com", "another_tester@test.com"] })
        expect(Object.values(response).includes(false)).toBe(true)
    });

    test("Simple auth: Should return a flag/label setted to true and set the new accessToken", () => {
        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenValid } }

        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        
        const response = verifyAuth(req, res, { authType: "Simple" })
        expect(Object.values(response).includes(true)).toBe(true)
        expect(res.locals.refreshedTokenMessage).toEqual(expect.any(String))
    });

    test("User auth: Should return a flag/label setted to true and set the new accessToken", () => {
        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenValid } }
        
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        
        const response = verifyAuth(req, res, { authType: "User", username: "tester" })
        expect(Object.values(response).includes(true)).toBe(true)
        expect(res.locals.refreshedTokenMessage).toEqual(expect.any(String))
    });

    test("Admin auth: Should return a flag/label setted to true and set the new accessToken", () => {
        const req = { cookies: { accessToken: adminAccessTokenExpired, refreshToken: adminAccessTokenValid } }
        
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        
        const response = verifyAuth(req, res, { authType: "Admin" })
        expect(Object.values(response).includes(true)).toBe(true)
        expect(res.locals.refreshedTokenMessage).toEqual(expect.any(String))
    });

    test("Group auth: Should return a flag/label setted to true and set the new accessToken", () => {
        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenValid } }
        
        const cookieMock = (name, value, options) => {
            res.cookieArgs = { name, value, options };
        }
        const res = {
            cookie: cookieMock,
            locals: {},
        }
        
        const response = verifyAuth(req, res, { authType: "Group", emails: ["tester@test.com", "other_tester@test.com", "another_tester@test.com"] })
        expect(Object.values(response).includes(true)).toBe(true)
        expect(res.locals.refreshedTokenMessage).toEqual(expect.any(String))
    });

    test("Error auth: Should return a flag/label setted to false (undefined auth)", () => {
        const req = { cookies: { accessToken: testerAccessTokenValid, refreshToken: testerAccessTokenValid } }
        const res = {}
        
        const response = verifyAuth(req, res, { authType: "ErrAuthType" })
        expect(Object.values(response).includes(false)).toBe(true)
    });

    test("Error auth: Should return a flag/label setted to false (perform login again)", () => {
        const req = { cookies: { accessToken: testerAccessTokenExpired, refreshToken: testerAccessTokenExpired } }
        const res = {}
        
        const response = verifyAuth(req, res, { authType: "Simple" })
        expect(Object.values(response).includes(false)).toBe(true)
        expect(response.cause).toEqual("Perform login again")
    });
})

describe("handleAmountFilterParams", () => { 
    test('Dummy test, change it', () => {  
        expect(true).toBe(true);  
    });
})
