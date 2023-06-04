import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { getUsers, getUser } from '../controllers/users';
import { verifyAuth } from '../controllers/utils';
import { getGroup } from '../controllers/users';
/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js")
jest.mock("../controllers/utils.js");
/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  User.find.mockClear()
  User.findOne.mockClear()
  //additional `mockClear()` must be placed here
});

/* OLD (INCORRECT) VERSION
describe("getUsers", () => {
  test("should return empty list if there are no users", async () => {
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(User, "find").mockImplementation(() => [])
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  test("should retrieve list of all users", async () => {
    const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }, { username: 'test2', email: 'test2@example.com', password: 'hashedPassword2' }]
    jest.spyOn(User, "find").mockImplementation(() => retrievedUsers)
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toEqual(retrievedUsers)
  })
})*/

describe("getUsers", () => {
  test("(status 200) should return empty list if there are no users", async () => {
    const mockReq = {
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    jest.spyOn(User, "find").mockResolvedValue([])
    await getUsers(mockReq, mockRes)
    expect(User.find).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: [], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })

  test("(status 200) should retrieve list of all users", async () => {
    const mockReq = {}
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }

    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
  
    const retrievedUsers = [{username: "Mario", email: "mario.red@email.com", role: "Regular"}, {username: "Luigi", email: "luigi.red@email.com", role: "Regular"}, {username: "admin", email: "admin@email.com", role: "Regular"} ]
    
    jest.spyOn(User, "find").mockResolvedValue(retrievedUsers) //Quando viene chiamato find su User viene simulata la risposta di un valore dato ovvero il retrievedUsers
    await getUsers(mockReq, mockRes)
    
    expect(User.find).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: retrievedUsers, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })
})

describe("getUser", () => { 
  test("(status 200) should retrieve another user if i have auth", async () => {
    const mockReq = {
      params: {
        username: "Mario"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }

    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
  
    const retrievedUsers = {username: mockReq.params.username, email: "mario.red@email.com", role: "Regular"}
    
    jest.spyOn(User, "findOne").mockResolvedValue(retrievedUsers) //Quando viene chiamato find su User viene simulata la risposta di un valore dato ovvero il retrievedUsers
    
    await getUser(mockReq, mockRes)
    
    expect(User.findOne).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: retrievedUsers, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })

  test("(status 400) user not found, should retreive an error", async () => {
    const mockReq = {
      params: {
        username: "Mario"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }

    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
  
    
    jest.spyOn(User, "findOne").mockResolvedValue(undefined) //Quando viene chiamato find su User viene simulata la risposta di un valore dato ovvero il retrievedUsers
    
    await getUser(mockReq, mockRes)
    
    expect(User.findOne).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error:"User not found"})
  })

  test("(status 401) no auth", async () => {
    const mockReq = {
      params: {
        username: "Mario"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }

    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" })
    const retrievedUsers = {username: mockReq.params.username, email: "mario.red@email.com", role: "Regular"}
    
    jest.spyOn(User, "findOne").mockResolvedValue(retrievedUsers) //Quando viene chiamato find su User viene simulata la risposta di un valore dato ovvero il retrievedUsers
    
    await getUser(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error:"Unauthorized"})
  })
  


})

describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { 

  test("(status 200) should return all the group information", async () => {
    const mockReq = {
      params: { 
        name: "Family"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
    const resolvedValue = {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}

    jest.spyOn(Group, "findOne").mockResolvedValue(resolvedValue)
    await getGroup(mockReq, mockRes)
    expect(Group.findOne).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: resolvedValue, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })

  test("(400) group not in the database", async () => {
    const mockReq = {
      params: { 
        name: "Family"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
    const resolvedValue = undefined; 

    jest.spyOn(Group, "findOne").mockResolvedValue(resolvedValue)
    await getGroup(mockReq, mockRes)
    expect(Group.findOne).toHaveBeenCalled(resolvedValue)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Group not found"})
  })

  test("(401) group doesn't have auth ", async () => {
    const mockReq = {
      params: { 
        name: "Family"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" })
    const resolvedValue = {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}

    jest.spyOn(Group, "findOne").mockResolvedValue(resolvedValue)
    await getGroup(mockReq, mockRes)
    expect(Group.findOne).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(401)
    
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized"})
  })

})

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })