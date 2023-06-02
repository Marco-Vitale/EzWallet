import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { User } from '../models/User';
import { verifyAuth } from '../controllers/utils';
import { createCategory, createTransaction } from '../controllers/controller';

jest.mock('../models/model');
jest.mock("../models/User.js");
jest.mock("../controllers/utils.js");


beforeEach(() => {
  categories.find.mockClear();
  categories.prototype.save.mockClear();
  transactions.find.mockClear();
  transactions.deleteOne.mockClear();
  transactions.aggregate.mockClear();
  transactions.prototype.save.mockClear();
  jest.clearAllMocks();
});

const exampleAdminAccToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV6d2FsbGV0QHRlc3QuY29tIiwiaWQiOiI2NDc2ZTAwMTNlZGQxZTQ4MzEwOGVhOGEiLCJ1c2VybmFtZSI6ImV6d2FsbGV0XzMxXzA1XzIwMjQiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU1MTIyMTIsImV4cCI6MTcxNzA0ODIxMn0.WjFDAfn9X9hkLFt-6sx8T6cGMsRnSYIdw27mERvRelQ";
const exampleAdminRefToken=exampleAdminAccToken;

const exampleUserAccToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QzNjVAdGVzdC5jb20iLCJpZCI6IjY0NzZlMDhkM2VkZDFlNDgzMTA4ZWE5MCIsInVzZXJuYW1lIjoidGVzdF8zMV8wNV8yMDI0Iiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU1MTIzNDUsImV4cCI6MTcxNzA0ODM0NX0._1pvR1CW1qSuIj_XnM2aKZWD7dC7ToACiXkvxsahRkk";
const exampleUserRefToken=exampleUserAccToken;

describe("createCategory", () => { 
    test("Should return status code 200", async () => {

        const mockReq = {
            body: { type: "food", color: "red"},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        //This call simulate the case in which there are no categories with this type and color
        categories.findOne.mockResolvedValueOnce(null)

        const newCat = { type: "food", color: "red"}

        categories.prototype.save.mockResolvedValue(newCat)

        await createCategory(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            data: newCat
        }))
    });


    test("Should return status code 400, missing parameters", async () => {

        const mockReq = {
            body: { type: "food"},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        await createCategory(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))

    });

    test("Should return status code 400, a parameter has an empty string", async () => {

        const mockReq = {
            body: { type: "food", color: ""},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        await createCategory(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))

    });

    test("Should return status code 400, already existing category", async () => {

        const mockReq = {
            body: { type: "food", color: "red"},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        const existCat = { type: "food", color: "red"};

        categories.findOne.mockResolvedValueOnce(existCat)

        await createCategory(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 401, the user is not an admin", async () => {

        const mockReq = {
            body: { type: "food", color: "red"},
            cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" })

        await createCategory(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))

    });

})

describe("updateCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getCategories", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("createTransaction", () => { 
    test("Should return status code 200", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {username: "Mario", amount: 100, type: "food"},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        const mockCategory = {
            type: "food",
            color: "red"
        }
        categories.findOne.mockResolvedValueOnce(mockCategory)

        const mockUser = {
            username: "Mario",
            email: "xxx@yyyy.it",
            password: "xxxxxxx",
            refreshToken: "xxxx",
            role:"Regular"
        }

        User.findOne.mockResolvedValueOnce(mockUser)

        const newTrans = { username: "Mario", type: "food", amount: 100, date: Date.now}

        transactions.prototype.save.mockResolvedValue(newTrans)

        await createTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            data: newTrans
        }))
    });

    test("Should return status code 400, missing parameters", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {username: "Mario", type: "food"},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        await createTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, empty string", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {username: "Mario", amount: 100, type: ""},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        await createTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, category not present", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {username: "Mario", amount: 100, type: "food"},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        categories.findOne.mockResolvedValueOnce(null)

        await createTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, user in body mismatch user in params", async () => {

        const mockReq = {
            params: {username: "Mirco"},
            body: {username: "Mario", amount: 100, type: "food"},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        const mockCategory = {
            type: "food",
            color: "red"
        }
        categories.findOne.mockResolvedValueOnce(mockCategory)

        await createTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    //!Since body username and param username are checked one against each other this test is valid for both cases.

    test("Should return status code 400, user not in the db", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {username: "Mario", amount: 100, type: "food"},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        const mockCategory = {
            type: "food",
            color: "red"
        }
        categories.findOne.mockResolvedValueOnce(mockCategory)
        User.findOne.mockResolvedValueOnce(null)

        await createTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, amount cannot be parsed", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {username: "Mario", amount: "ciao", type: "food"},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        await createTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 401, called by different user then route param", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {username: "Mario", amount: "ciao", type: "food"},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
              refreshedTokenMessage: ""
            }
        }

        verifyAuth.mockReturnValue({ authorized: false, cause: "Requested auth for a different user" })

        await createTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });
})

describe("getAllTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByUser", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

//TODO
describe("getTransactionsByUserByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

//TODO
describe("getTransactionsByGroup", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

//TODO
describe("getTransactionsByGroupByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

//TODO
describe("deleteTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

//TODO
describe("deleteTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
