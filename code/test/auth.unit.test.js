import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { registerAdmin } from '../controllers/auth';
import { verifyEmail } from '../controllers/utils';
const bcrypt = require("bcryptjs")

jest.mock("bcryptjs")
jest.mock('../models/User.js');
jest.mock("../controllers/utils.js");

beforeEach(() => {
    jest.clearAllMocks();
    //additional `mockClear()` must be placed here
  });
  
  jest.mock('../controllers/utils.js', () => ({
    verifyAuth: jest.fn(),
    verifyEmail: jest.fn(),
  }))


describe('register', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});

describe("registerAdmin", () => { 
    test('status 200 when successful creates an admin', async () => {
    const mockReq = {
        body: {username: "admin", email: "admin@email.com", password: "securePass"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }

    verifyEmail.mockImplementation((email) => {
        return true;
      });

    const newUser = {
        
            username: "admin",
            email: "admin@email.com",
            password: "securePass",
            role: "Admin"
    }
    jest.spyOn(User, "findOne").mockResolvedValue(0);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("securePass")
    jest.spyOn(User, "create").mockResolvedValue(true);
    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({data: {message: "User added succesfully"}})
    });


    test('status 400 req does not contain all inputs', async () => {
        const mockReq = {
            body: {username: "admin", password: "securePass"}
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: "expired token"
          }
        }
    
        verifyEmail.mockImplementation((email) => {
            return true;
          });
    
        const newUser = {
            
                username: "admin",
                email: "admin@email.com",
                password: "securePass",
                role: "Admin"
        }
        jest.spyOn(User, "findOne").mockResolvedValue(0);
        jest.spyOn(bcrypt, "hash").mockResolvedValue("securePass")
        jest.spyOn(User, "create").mockResolvedValue(true);
        await registerAdmin(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Missing parameters"})
    });
    
    test('status 400 if req contains an empty param', async () => {
            const mockReq = {
                body: {username: "admin", email: "  ", password: "securePass"}
            }
            const mockRes = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
              locals: {
                refreshedTokenMessage: "expired token"
              }
            }
        
            verifyEmail.mockImplementation((email) => {
                return true;
              });
        
            const newUser = {
                
                    username: "admin",
                    email: "admin@email.com",
                    password: "securePass",
                    role: "Admin"
            }
            jest.spyOn(User, "findOne").mockResolvedValue(0);
            jest.spyOn(bcrypt, "hash").mockResolvedValue("securePass")
            jest.spyOn(User, "create").mockResolvedValue(true);
            await registerAdmin(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({error: "Missing parameters"})
    });
    

    test('status 400 if email is not valid', async () => {
        const mockReq = {
            body: {username: "admin", email: "prova.it", password: "securePass"}
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: "expired token"
          }
        }
    
        verifyEmail.mockImplementation((email) => {
            return false;
          });
    
        const newUser = {
            
                username: "admin",
                email: "admin@email.com",
                password: "securePass",
                role: "Admin"
        }
        jest.spyOn(User, "findOne").mockResolvedValue(0);
        jest.spyOn(bcrypt, "hash").mockResolvedValue("securePass")
        jest.spyOn(User, "create").mockResolvedValue(true);
        await registerAdmin(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: "The email format is not valid!" })
});

test('status 400 if there is an already existing user', async () => {
    const mockReq = {
        body: {username: "admin", email: "prova@gmail.it", password: "securePass"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }

    verifyEmail.mockImplementation((email) => {
        return true;
      });

    const newUser = {
        
            username: "admin",
            email: "admin@email.com",
            password: "securePass",
            role: "Admin"
    }
    jest.spyOn(User, "findOne").mockResolvedValue(newUser);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("securePass")
    jest.spyOn(User, "create").mockResolvedValue(true);
    await registerAdmin(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "The mail is already used!" })
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
