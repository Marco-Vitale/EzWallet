import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { User } from '../models/User.js';
import { register } from '../controllers/auth';
import { verifyEmail } from '../controllers/utils';
const bcrypt = require("bcryptjs")

jest.mock("bcryptjs")
jest.mock('../models/User.js');

jest.mock('../controllers/utils.js', () => ({
    verifyEmail: jest.fn()
}))

describe('register', () => { 
    test("Should return status code 200", async() => {
        const mockReq = {
            body: { username: "test1", email: "test1@test.com", password: "secure_password" },
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        }

        verifyEmail.mockImplementation(() => { return true })

        User.findOne.mockResolvedValue(undefined)
        User.create.mockResolvedValue("created")

        await register(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({data: {message: "User added successfully"}});
    });

    test("Should return status code 400: the request body does not contain all the necessary attributes", async() => {
        const mockReq = {
            body: { email: "test1@test.com", password: "secure_password" },
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        }

        verifyEmail.mockImplementation(() => { return true })

        User.findOne.mockResolvedValue(undefined)

        await register(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: at least one of the parameters in the request body is an empty string", async() => {
        const mockReq = {
            body: { username: "test1", email: "", password: "secure_password" },
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        }

        verifyEmail.mockImplementation(() => { return true })

        User.findOne.mockResolvedValue(undefined)

        await register(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: the email in the request body is not in a valid email format", async() => {
        const mockReq = {
            body: { username: "test1", email: "test_email.com", password: "secure_password" },
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        }

        verifyEmail.mockImplementation(() => { return false })

        User.findOne.mockResolvedValue(undefined)

        await register(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: the username in the request body identifies an already existing user", async() => {
        const mockReq = {
            body: { username: "test1", email: "test1@test.com", password: "secure_password" },
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        }

        verifyEmail.mockImplementation(() => { return true })

        User.findOne.mockResolvedValueOnce(undefined)
        User.findOne.mockResolvedValueOnce({ username: "test1", email: "test1@test.com" })

        await register(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: the email in the request body identifies an already existing user", async() => {
        const mockReq = {
            body: { username: "test1", email: "test1@test.com", password: "secure_password" },
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        }

        verifyEmail.mockImplementation(() => { return true })

        User.findOne.mockResolvedValueOnce({ username: "test1", email: "test1@test.com" })
        User.findOne.mockResolvedValueOnce(undefined)

        await register(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
});

describe("registerAdmin", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe('login', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});

describe('logout', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});
