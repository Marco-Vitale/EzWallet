import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { User } from '../models/User.js';
import { register } from '../controllers/auth';
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
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            data: { message: expect.any(String) }
        }))
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

test('status 400 if there is an already existing email', async () => {
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

test('status 400 if there is an already existing username', async () => {
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
  jest.spyOn(User, "findOne").mockResolvedValueOnce(undefined);
  jest.spyOn(User, "findOne").mockResolvedValueOnce(newUser);
  jest.spyOn(bcrypt, "hash").mockResolvedValue("securePass")
  jest.spyOn(User, "create").mockResolvedValue(true);
  await registerAdmin(mockReq, mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalledWith({ error: "The username is already used!" })
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
