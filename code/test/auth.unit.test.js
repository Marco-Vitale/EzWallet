import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { User } from '../models/User.js';
import { register, registerAdmin, login, logout } from '../controllers/auth';
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
