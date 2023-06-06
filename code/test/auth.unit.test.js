import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import { login } from '../controllers/auth.js'; 
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")

jest.mock("bcryptjs")
jest.mock('../models/User.js');

describe('register', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});

describe("registerAdmin", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})


    

describe('login', () => {
  
  test('should return 200 for correct login', async () => {
    const req = {
      body: {
        email: 'test@test.com',
        password: 'password123'
      }
    }
    const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }

    User.findOne.mockResolvedValueOnce(undefined)

    resp = await login(req, res)
        
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      data: {
        accessToken: expect.any(String),
        refreshToken: expect.any(String)
      }
    })
  });

  test('should return 400 if the request body does not contain all the necessary attributes', async () => {
    const req = { body: {} }
    const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing parameters' });
  });

  test('should return 400 if at least one of the parameters in the request body is an empty string', async () => {
    const req = { body: { email: '', password: '' } }
    const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn()}
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing parameters' });
  });

  test('should return 400 if the email in the request body is not in a valid email format', async () => {
    const req = { body: { email: 'invalidEmail', password: 'password123' } }
    const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn()}
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'The email format is not valid!' });
});
});
   


describe('logout', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});
