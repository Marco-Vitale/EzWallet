import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { getUsers, getUser } from '../controllers/users';
import { verifyAuth, verifyEmail } from '../controllers/utils';
import { getGroup, addToGroup, removeFromGroup } from '../controllers/users';
import { verify } from 'jsonwebtoken';
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
  Group.findOne.mockClear()
  Group.find.mockClear()


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
    expect(mockRes.json).toHaveBeenCalledWith({ data: {group: resolvedValue}, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
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

describe("addToGroup", () => {
  const exampleUserRefToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjY0NzhhNTg2MzdlZmM0YWZmMmVlNWVlMyIsInVzZXJuYW1lIjoidGVzdGVyIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU2MzExMjIsImV4cCI6MTY4NjIzNTkyMn0.XhUwuKINOEQHtYE1hOCPv-a5TR_NIB4l-R9AdRnL024";
  const exampleUserAccToken= exampleUserRefToken;

  test("(status 200)[REGULAR] should return all added user", async () => {
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["luigi.red@email.com", "pietro.blue@email.com"]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}

    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}, {email: "luigi.red@email.com"}, {email: "pietro.blue@email.com"}]}, membersNotFound: [], alreadyInGroup: []} 

    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
    verifyEmail.mockReturnValue({ verified: true, cause: "Verified" })
    User.findOne.mockResolvedValueOnce({email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"}) //OK
    
   
    Group.findOne.mockResolvedValueOnce(undefined) //OK
    User.findOne.mockResolvedValueOnce({email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}) //OK
    Group.findOne.mockResolvedValueOnce(undefined) //OK
    Group.findOne.mockResolvedValueOnce(resolvedValue) 

    Group.findOne.mockResolvedValue(true)
    
   

    const response = await addToGroup(mockReq, mockRes)
    console.log(response)
    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: resolvedValue, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })

  test("(400) request body does not contain all the necessary attributes", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(400) group name passed as a route parameter does not represent a group in the database", async () => {
    
    const mockReq = {
      params: { 
        name: "GroupNotInDB"},
      body: {},
      url:"api/groups/GroupNotInDB/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(400) if all the provided emails represent users that are already in a group", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com"]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(400) if all the provided emails represent users that do not exist in the database", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["notExisting@test.com"]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(400) if all the provided emails represent users that do not exist in the database", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["emailIncorrectFormat"]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(400) at least one of the member emails is an empty string", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com", " "]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(401) if called by an authenticated user who is not part of the group (authType = Group)", async () => {
    const exampleNewUserRefToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9uZVRlc3RAdGVzdC5jb20iLCJpZCI6IjY0N2Q4NDc1NjJlMmVmODk1MzdlY2MzOCIsInVzZXJuYW1lIjoib25lVGVzdCIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1OTQ3NTIyLCJleHAiOjE2ODY1NTIzMjJ9.0dD5GNJNUjAQn9oidvLs1DWOmiGZQ-r5eMy5NoWHoqY"
    const exampleNewUserAccToken = exampleNewUserRefToken
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com", " "]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleNewUserAccToken, refreshToken:exampleNewUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(401) if called by an authenticated user who is not an admin (authType = Admin)", async () => {
    const exampleNewUserRefToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9uZVRlc3RAdGVzdC5jb20iLCJpZCI6IjY0N2Q4NDc1NjJlMmVmODk1MzdlY2MzOCIsInVzZXJuYW1lIjoib25lVGVzdCIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1OTQ3NTIyLCJleHAiOjE2ODY1NTIzMjJ9.0dD5GNJNUjAQn9oidvLs1DWOmiGZQ-r5eMy5NoWHoqY"
    const exampleNewUserAccToken = exampleNewUserRefToken
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com", " "]},
      url:"api/groups/Family/insert",
      cookies: { accessToken:exampleNewUserAccToken, refreshToken:exampleNewUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })


 })

describe("removeFromGroup", () => { 

  const exampleUserRefToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjY0NzhhNTg2MzdlZmM0YWZmMmVlNWVlMyIsInVzZXJuYW1lIjoidGVzdGVyIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU2MzExMjIsImV4cCI6MTY4NjIzNTkyMn0.XhUwuKINOEQHtYE1hOCPv-a5TR_NIB4l-R9AdRnL024";
  const exampleUserAccToken= exampleUserRefToken;

  test("(status 200)[REGULAR] should return all added user", async () => {
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["luigi.red@email.com", "pietro.blue@email.com"]},
      url:"api/groups/Family/remove",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"},{email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"},{email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}]}
    const actualGroup_1 = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"},{email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}]}
    const actualGroup_2 = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}]}, membersNotFound: [], alreadyInGroup: []} 

    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
    verifyEmail.mockReturnValue({ verified: true, cause: "Verified" })
    User.findOne.mockResolvedValueOnce({email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"}) //OK   
    Group.findOne.mockResolvedValueOnce(actualGroup_1)
    User.findOne.mockResolvedValueOnce({email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}) 
    Group.findOne.mockResolvedValueOnce(actualGroup_2) 
    Group.findOne.mockResolvedValueOnce(resolvedValue) 

    Group.findOne.mockResolvedValue(true)
    
   

    const response = await removeFromGroup(mockReq, mockRes)
    console.log(response)
    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: resolvedValue, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })

  test.skip("(400) request body does not contain all the necessary attributes", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test.skip("(400) group name passed as a route parameter does not represent a group in the database", async () => {
    
    const mockReq = {
      params: { 
        name: "GroupNotInDB"},
      body: {},
      url:"api/groups/GroupNotInDB/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test.skip("(400) if all the provided emails represent users that are already in a group", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com"]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test.skip("(400) if all the provided emails represent users that do not exist in the database", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["notExisting@test.com"]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test.skip("(400) if all the provided emails represent users that do not exist in the database", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["emailIncorrectFormat"]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test.skip("(400) at least one of the member emails is an empty string", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com", " "]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test.skip("(401) at least one of the member emails is an empty string", async () => {
    const exampleNewUserRefToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9uZVRlc3RAdGVzdC5jb20iLCJpZCI6IjY0N2Q4NDc1NjJlMmVmODk1MzdlY2MzOCIsInVzZXJuYW1lIjoib25lVGVzdCIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1OTQ3NTIyLCJleHAiOjE2ODY1NTIzMjJ9.0dD5GNJNUjAQn9oidvLs1DWOmiGZQ-r5eMy5NoWHoqY"
    const exampleNewUserAccToken = exampleNewUserRefToken
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com", " "]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleNewUserAccToken, refreshToken:exampleNewUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

 

})

describe("deleteUser", () => { })

describe("deleteGroup", () => { })