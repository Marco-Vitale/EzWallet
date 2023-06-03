import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from "../models/model";
import { Group, User, UserSchema } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "../controllers/utils.js";
import { updateCategory, deleteCategory } from '../controllers/controller.js';

jest.mock("../models/model");
jest.mock("../models/User.js");
jest.mock("../controllers/utils.js");

jest.mock('../controllers/utils.js', () => ({
    verifyAuth: jest.fn(),
}))

beforeEach(() => {
    jest.clearAllMocks()
});

const exampleAdminAccToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV6d2FsbGV0QHRlc3QuY29tIiwiaWQiOiI2NDc2ZTAwMTNlZGQxZTQ4MzEwOGVhOGEiLCJ1c2VybmFtZSI6ImV6d2FsbGV0XzMxXzA1XzIwMjQiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU1MTIyMTIsImV4cCI6MTcxNzA0ODIxMn0.WjFDAfn9X9hkLFt-6sx8T6cGMsRnSYIdw27mERvRelQ";
const exampleAdminRefToken=exampleAdminAccToken;

const exampleUserAccToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QzNjVAdGVzdC5jb20iLCJpZCI6IjY0NzZlMDhkM2VkZDFlNDgzMTA4ZWE5MCIsInVzZXJuYW1lIjoidGVzdF8zMV8wNV8yMDI0Iiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU1MTIzNDUsImV4cCI6MTcxNzA0ODM0NX0._1pvR1CW1qSuIj_XnM2aKZWD7dC7ToACiXkvxsahRkk";
const exampleUserRefToken=exampleUserAccToken;

describe("createCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("updateCategory", () => {
    test("Should return status code 200", async() => {
        const mockReq = {
            params: { type: "oldCategory" },
            body: { type: "newCategory", color: "yellow" },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/categories/oldCategory"
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        const alreadyExists = undefined;
        jest.spyOn(categories, "findOne").mockResolvedValue(alreadyExists)

        const oldCategory = {type: "oldCategory", color: "red"}
        jest.spyOn(categories, "find").mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        jest.spyOn(categories, "updateOne").mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)
        expect(verifyAuth).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(categories.find).toHaveBeenCalled()
        expect(categories.updateOne).toHaveBeenCalled()
        expect(categories.updateMany).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({data: {message: "Category edited successfully", count: updateManyResult.modifiedCount}, 
                                                                            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage});
    });

    test("Should return status code 400: request body does not contain all the necessary attributes", async() => {
        const mockReq = {
            params: { type: "oldCategory" },
            body: { color: "yellow" },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/categories/oldCategory"
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        const alreadyExists = undefined;
        jest.spyOn(categories, "findOne").mockResolvedValue(alreadyExists)

        const oldCategory = {type: "oldCategory", color: "red"}
        jest.spyOn(categories, "find").mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        jest.spyOn(categories, "updateOne").mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: at least one of the parameters in the request body is an empty string", async() => {
        const mockReq = {
            params: { type: "oldCategory" },
            body: { type: "", color: "yellow" },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/categories/oldCategory"
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        const alreadyExists = undefined;
        jest.spyOn(categories, "findOne").mockResolvedValue(alreadyExists)

        const oldCategory = {type: "oldCategory", color: "red"}
        jest.spyOn(categories, "find").mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        jest.spyOn(categories, "updateOne").mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: the type of category passed as a route parameter does not represent a category in the database", async() => {
        const mockReq = {
            params: { type: "oldCategory" },
            body: { type: "nonPresentCategory", color: "yellow" },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/categories/oldCategory"
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        const alreadyExists = undefined;
        jest.spyOn(categories, "findOne").mockResolvedValue(alreadyExists)

        const oldCategory = undefined;
        jest.spyOn(categories, "find").mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        jest.spyOn(categories, "updateOne").mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(categories.find).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one", async() => {
        const mockReq = {
            params: { type: "oldCategory" },
            body: { type: "nonPresentCategory", color: "yellow" },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/categories/oldCategory"
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        const alreadyExists = {type: "oldCategory", color: "red"};
        jest.spyOn(categories, "findOne").mockResolvedValue(alreadyExists)

        const oldCategory = undefined;
        jest.spyOn(categories, "find").mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        jest.spyOn(categories, "updateOne").mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 401: called by an authenticated user who is not an admin (authType = Admin)", async() => {
        const mockReq = {
            params: { type: "oldCategory" },
            body: { type: "nonPresentCategory", color: "yellow" },
            cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken },
            url: "/api/categories/oldCategory"
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockReturnValue({ authorized: false, cause: "Requested auth for a different role" })

        const alreadyExists = {type: "oldCategory", color: "red"};
        jest.spyOn(categories, "findOne").mockResolvedValue(alreadyExists)

        const oldCategory = undefined;
        jest.spyOn(categories, "find").mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        jest.spyOn(categories, "updateOne").mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("deleteCategory", () => { 
    const listOfCategories = [{type: "category1", color: "red"}, 
                              {type: "category2", color: "blue"}, 
                              {type: "category3", color: "green"},
                              {type: "category4", color: "purple"},
                              {type: "category5", color: "yellow"}];

    test("Should return status code 200", async() => {
        const foundCategories = [{type: "category1", color: "red"}, {type: "category2", color: "blue"}];

        const mockReq = {
            body: { types: ["category1", "category2"] },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "Authorized" }
        })

        jest.spyOn(categories, "find").mockResolvedValueOnce(listOfCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                                      })
                                      .mockResolvedValueOnce(foundCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                                      })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        jest.spyOn(categories, "deleteMany").mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(categories.find).toHaveBeenCalled()
        expect(categories.deleteMany).toHaveBeenCalled()
        expect(categories.updateMany).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({data: {message: "Categories deleted", count: updateManyResult.modifiedCount}, 
                                                                            refreshedTokenMessage: mockRes.locals.refreshedTokenMessage});
    });

    test("Should return status code 400: the request body does not contain all the necessary attributes", async() => {
        const foundCategories = [{type: "category1", color: "red"}, {type: "category2", color: "blue"}];

        const mockReq = {
            body: { color: ["red"] },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "Authorized" }
        })

        jest.spyOn(categories, "find").mockResolvedValueOnce(listOfCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                                      })
                                      .mockResolvedValueOnce(foundCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                                      })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        jest.spyOn(categories, "deleteMany").mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: there is only one category in the database", async() => {
        const mockReq = {
            body: { color: ["red"] },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "Authorized" }
        })

        jest.spyOn(categories, "find").mockResolvedValueOnce([{type: "category1", color: "red"}])

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        jest.spyOn(categories, "deleteMany").mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: at least one of the types in the array is an empty string", async() => {
        const foundCategories = [{type: "category1", color: "red"}, {type: "category2", color: "blue"}];

        const mockReq = {
            body: { types: ["", "category2", "category3"] },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "Authorized" }
        })

        jest.spyOn(categories, "find").mockResolvedValueOnce(listOfCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                                      })
                                      .mockResolvedValueOnce(foundCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                                      })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        jest.spyOn(categories, "deleteMany").mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: the array passed in the request body is empty", async() => {
        const foundCategories = [{type: "category1", color: "red"}, {type: "category2", color: "blue"}];

        const mockReq = {
            body: { types: [] },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "Authorized" }
        })

        jest.spyOn(categories, "find").mockResolvedValueOnce(listOfCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories)
                                      })
                                      .mockResolvedValueOnce(foundCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories)
                                      })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        jest.spyOn(categories, "deleteMany").mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: at least one of the types in the array does not represent a category in the database", async() => {
        const foundCategories = [{type: "category1", color: "red"}, {type: "category2", color: "blue"}];

        const mockReq = {
            body: { types: ["category1", "category2", "errCategory"] },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "Authorized" }
        })

        jest.spyOn(categories, "find").mockResolvedValueOnce(listOfCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                                      })
                                      .mockResolvedValueOnce(foundCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                                      })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        jest.spyOn(categories, "deleteMany").mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: called by an authenticated user who is not an admin (authType = Admin)", async() => {
        const foundCategories = [{type: "category1", color: "red"}, {type: "category2", color: "blue"}];

        const mockReq = {
            body: { color: ["red"] },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: "Requested auth for a different role" }
        })

        jest.spyOn(categories, "find").mockResolvedValueOnce(listOfCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                                      })
                                      .mockResolvedValueOnce(foundCategories)
                                      .mockReturnValueOnce({
                                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                                      })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        jest.spyOn(categories, "deleteMany").mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        jest.spyOn(categories, "updateMany").mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

        expect(verifyAuth).toHaveBeenCalled()

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("getCategories", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("createTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
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

describe("getTransactionsByUserByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroup", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroupByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
