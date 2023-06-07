import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import { login, logout } from '../controllers/auth.js'; 




import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")

jest.mock("bcryptjs")
jest.mock('../models/User.js');
jest.mock("jsonwebtoken")

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
  
  test.skip('should return 200 for correct login', async () => {
    const req = {
      body: {
        email: 'test@test.com',
        password: 'password123'
      }
    }
    const res = {
      cookie: jest.fn(),
      locals: {
          refreshedTokenMessage: undefined
      },
      status: jest.fn()
    }

    const user = {username: "test", email: "test@test.com", password: "password", role: "Regular"}

    User.findOne.mockResolvedValueOnce(user)

    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValue("token")
    res.cookie.mockImplementation(() => { return "newAccToken" })
    User.prototype.save.mockResolvedValueOnce(user);

    await login(req, res)
        
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
  const exampleUserRefToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjY0NzhhNTg2MzdlZmM0YWZmMmVlNWVlMyIsInVzZXJuYW1lIjoidGVzdGVyIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU2MjgyOTksImV4cCI6MTY4NjIzMzA5OX0.WVpquYNQ9w1WwzP395o57d8-GNqcNJoU6lVawB4N5m8";
  const exampleUserAccToken= exampleUserRefToken;
  test.skip('200 logout', async () => {
    const req = {
      cookies: {accessToken: exampleUserAccToken, refreshToken: exampleUserRefToken},
    }
    const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
    }
    const resolvedUser = {username: "tester",
    email: "test@test.com",
    password: "tester_pass",
    role: "Regular",
    refreshToken: exampleUserRefToken}

    User.findOne.mockResolvedValueOnce(resolvedUser)
    

    await logout(req, res)
    
    expect(res.status).toHaveBeenCalledWith(200)
    
    
  });

  test('400 logout', async () => {
    const req = {
      cookies: {accessToken: exampleUserAccToken},
    }
    const res = { 
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
    }
    const resolvedUser = {username: "tester",
    email: "test@test.com",
    password: "tester_pass",
    role: "Regular",
    refreshToken: exampleUserRefToken}

    User.findOne.mockResolvedValueOnce(resolvedUser)
    

    await logout(req, res)
    
    expect(res.status).toHaveBeenCalledWith(400)
    
    
  });

});
