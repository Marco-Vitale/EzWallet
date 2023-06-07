import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { Group, User } from '../models/User';
import { verifyAuth } from '../controllers/utils';
import { createCategory, 
    createTransaction, 
    deleteTransaction, 
    deleteTransactions, 
    getTransactionsByGroup, 
    getTransactionsByGroupByCategory, 
    getTransactionsByUserByCategory,
    getCategories,
     getAllTransactions,
    } from '../controllers/controller';

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

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "Authorized" }
        })

        const alreadyExists = undefined;
        categories.findOne.mockResolvedValue(alreadyExists)

        const oldCategory = {type: "oldCategory", color: "red"}
        categories.find.mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        categories.updateOne.mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)

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

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "Authorized" }
        })

        const alreadyExists = undefined;
        categories.findOne.mockResolvedValue(alreadyExists)

        const oldCategory = {type: "oldCategory", color: "red"}
        categories.find.mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        categories.updateOne.mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)

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

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "Authorized" }
        })

        const alreadyExists = undefined;
        categories.findOne.mockResolvedValue(alreadyExists)

        const oldCategory = {type: "oldCategory", color: "red"}
        categories.find.mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        categories.updateOne.mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: the type of category passed as a route parameter does not represent a category in the database", async() => {
        const mockReq = {
            params: { type: "nonPresentCategory" },
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

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "Authorized" }
        })

        const alreadyExists = undefined;
        categories.findOne.mockResolvedValue(alreadyExists)

        const oldCategory = undefined;
        categories.find.mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        categories.updateOne.mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 400: the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one", async() => {
        const mockReq = {
            params: { type: "oldCategory" },
            body: { type: "alreadyPresentCategory", color: "yellow" },
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

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "Authorized" }
        })

        const alreadyExists = {type: "oldCategory", color: "red"};
        categories.findOne.mockResolvedValue(alreadyExists)

        const oldCategory = {type: "oldCategory", color: "red"}
        categories.find.mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        categories.updateOne.mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)

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

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: "Requested auth for a different role" }
        })

        const alreadyExists = {type: "oldCategory", color: "red"};
        categories.findOne.mockResolvedValue(alreadyExists)

        const oldCategory = {type: "oldCategory", color: "red"}
        categories.find.mockResolvedValue(oldCategory)

        const updateOneResult = {
            "acknowledged" : true,
            "matchedCount" : 0,
            "modifiedCount" : 0,
            "upsertedId" : "aaa"
        }
        categories.updateOne.mockResolvedValue(updateOneResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 2, "modifiedCount" : 2 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await updateCategory(mockReq, mockRes)
        
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

        categories.find.mockResolvedValueOnce(listOfCategories)
                        .mockReturnValueOnce({
                            sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                        })
                        .mockResolvedValueOnce(foundCategories)
                        .mockReturnValueOnce({
                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                        })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        categories.deleteMany.mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

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

        categories.find.mockResolvedValueOnce(listOfCategories)
                        .mockReturnValueOnce({
                            sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                        })
                        .mockResolvedValueOnce(foundCategories)
                        .mockReturnValueOnce({
                            sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                        })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        categories.deleteMany.mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

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

        categories.find.mockResolvedValueOnce([{type: "category1", color: "red"}])

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        categories.deleteMany.mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

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

        categories.find.mockResolvedValueOnce(listOfCategories)
                        .mockReturnValueOnce({
                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                        })
                        .mockResolvedValueOnce(foundCategories)
                        .mockReturnValueOnce({
                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                        })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        categories.deleteMany.mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

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

        categories.find.mockResolvedValueOnce(listOfCategories)
                        .mockReturnValueOnce({
                        sort: jest.fn().mockResolvedValueOnce(listOfCategories)
                        })
                        .mockResolvedValueOnce(foundCategories)
                        .mockReturnValueOnce({
                        sort: jest.fn().mockResolvedValueOnce(listOfCategories)
                        })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        categories.deleteMany.mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

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

        categories.find.mockResolvedValueOnce(listOfCategories)
                        .mockReturnValueOnce({
                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                        })
                        .mockResolvedValueOnce(foundCategories)
                        .mockReturnValueOnce({
                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                        })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        categories.deleteMany.mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 401: called by an authenticated user who is not an admin (authType = Admin)", async() => {
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

        categories.find.mockResolvedValueOnce(listOfCategories)
                        .mockReturnValueOnce({
                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                        })
                        .mockResolvedValueOnce(foundCategories)
                        .mockReturnValueOnce({
                        sort: jest.fn().mockResolvedValueOnce(listOfCategories),
                        })

        const deleteManyResult = { "acknowledged" : true, "deletedCount" : 2 }
        categories.deleteMany.mockResolvedValue(deleteManyResult)

        const updateManyResult = { "acknowledged" : true, "matchedCount" : 3, "modifiedCount" : 3 }
        categories.updateMany.mockResolvedValue(updateManyResult)

        await deleteCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})

describe("getCategories", () => { 
    test('return status 200 and correct data', async () => {

        const mockReq = {
            cookies: {accessToken: "some"}
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: "expired token"
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "authorized" }
        });
        const data = [{type: "food", color: "red"}, {type: "health", color: "green"}];
        jest.spyOn(categories, "find").mockResolvedValue(data);

        await getCategories(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({data: [{type: "food", color: "red"}, 
        {type: "health", color: "green"}], 
        refreshedTokenMessage: "expired token"})


    });

    test('return status 200 and empty data with empty db', async () => {

        const mockReq = {
            cookies: {accessToken: "some"}
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: "expired token"
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "authorized" }
        });
        const data = [];
        jest.spyOn(categories, "find").mockResolvedValue(data);

        await getCategories(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({data: [], 
        refreshedTokenMessage: "expired token"})


    });

    test('return status 401 for not admin call', async () => {

        const mockReq = {
            cookies: {accessToken: "some"}
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: "expired token"
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: "Unauthorized" }
        });
        const data = [{type: "food", color: "red"}, {type: "health", color: "green"}];
        jest.spyOn(categories, "find").mockResolvedValue(data);

        await getCategories(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Unauthorized"});


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
    test('return status 200 and correct data', async () => {
        /*res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", 
        date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, 
        type: "health", date: "2023-05-19T10:00:00", color: "green"}, {username: "Luigi", 
        amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ], 
        refreshedTokenMessage: res.locals.refreshedTokenMessage})*/

        const mockReq = {
            cookies: {accessToken: "some"}
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: "expired token"
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: true, cause: "authorized" }
        });
        const data = [{_id: 1, username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red"}}, 
                        {_id: 2, username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", categories_info: {color: "green"}}, 
                        {_id: 3, username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00",categories_info: {color: "red"}} ]
        jest.spyOn(transactions, "aggregate").mockResolvedValue(data);

        await getAllTransactions(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({data: [{username: "Mario", amount: 100, type: "food", 
        date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, 
        type: "health", date: "2023-05-19T10:00:00", color: "green"}, {username: "Luigi", 
        amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ], 
        refreshedTokenMessage: "expired token"})


    });

    test('return status 401 for not admin call', async () => {
        /*res.status(200).json({data: [{username: "Mario", amount: 100, type: "food", 
        date: "2023-05-19T00:00:00", color: "red"}, {username: "Mario", amount: 70, 
        type: "health", date: "2023-05-19T10:00:00", color: "green"}, {username: "Luigi", 
        amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red"} ], 
        refreshedTokenMessage: res.locals.refreshedTokenMessage})*/

        const mockReq = {
            cookies: {accessToken: "some"}
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: "expired token"
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: "Unauthorized" }
        });
        const data = [{_id: 1, username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red"}}, 
                        {_id: 2, username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", categories_info: {color: "green"}}, 
                        {_id: 3, username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00",categories_info: {color: "red"}} ]
        jest.spyOn(transactions, "aggregate").mockResolvedValue(data);

        await getAllTransactions(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Unauthorized"});


    });
})

describe("getTransactionsByUser", () => { 
    const userTransactions = [
        {username: "test1", amount: 100, type: "category1", date: "2023-05-19T00:00:00", categories_info: {color: "red"}}, 
        {username: "test1", amount: 70,  type: "category2", date: "2023-06-19T10:00:00", categories_info: {color: "green"}},
        {username: "test1", amount: 20,  type: "category1", date: "2023-07-19T10:00:00", categories_info: {color: "red"}}
    ]

    test("Admin route: Should return status code 200", async() => {
        const mockReq = {
            params: { username: "test1" },
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/users/test1" // admin route
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

        User.findOne.mockResolvedValue({username: "test1"})
        transactions.aggregate.mockResolvedValueOnce(userTransactions)

        await getTransactionsByUser(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({ data: [
                                                        {username: "test1", amount: 100, type: "category1", date: "2023-05-19T00:00:00", color: "red"}, 
                                                        {username: "test1", amount: 70,  type: "category2", date: "2023-06-19T10:00:00", color: "green"},
                                                        {username: "test1", amount: 20,  type: "category1", date: "2023-07-19T10:00:00", color: "red"}
                                                    ], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage});
    });

    test("User router: Should return status code 200", async() => {
        const mockReq = {
            params: { username: "test1" },
            body: {},
            cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken },
            url: "/api/users/test1/transactions" // user route
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

        User.findOne.mockResolvedValue({username: "test1"})
        transactions.aggregate.mockResolvedValueOnce(userTransactions)

        handleAmountFilterParams.mockImplementation(() => { return {} })

        handleDateFilterParams.mockImplementation(() => { return {} })

        await getTransactionsByUser(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({ data: [
                                                        {username: "test1", amount: 100, type: "category1", date: "2023-05-19T00:00:00", color: "red"}, 
                                                        {username: "test1", amount: 70,  type: "category2", date: "2023-06-19T10:00:00", color: "green"},
                                                        {username: "test1", amount: 20,  type: "category1", date: "2023-07-19T10:00:00", color: "red"}
                                                    ], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage});
    });

    test("Should return status code 400: the username passed as a route parameter does not represent a user in the database", async() => {
        const mockReq = {
            params: { username: "errTest" },
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/users/errTest"
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

        User.findOne.mockResolvedValue(undefined)

        await getTransactionsByUser(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 401: called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions`", async() => {
        const mockReq = {
            params: { username: "test1" },
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/users/test1/transactions"
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        verifyAuth.mockImplementation(() => {
            return { authorized: false, cause: "Requested auth for a different user" }
        })

        User.findOne.mockResolvedValue({username: "test1"})

        await getTransactionsByUser(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });

    test("Should return status code 401: called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username`", async() => {
        const mockReq = {
            params: { username: "test1" },
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/users/test1"
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

        User.findOne.mockResolvedValue({username: "test1"})

        await getTransactionsByUser(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }))
    });
})


describe("getTransactionsByUserByCategory", () => { 

    const userTransactions = [
        {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red"}}, 
        {username: "Mario", amount: 70,  type: "food", date: "2023-06-19T10:00:00", categories_info: {color: "red"}},
        {username: "Mario", amount: 20,  type: "food", date: "2023-07-19T10:00:00", categories_info: {color: "red"}}
    ]

    const mockUser = {
        username: "Mario",
        email: "xxx@yyyy.it",
        password: "xxxxxxx",
        refreshToken: "xxxx",
        role:"Regular"
    }

    const mockCategory = {
        type: "food",
        color: "red"
    }

    test("Should return status code 200 (admin route)", async() => {

        const mockReq = {
            params: { username: "Mario", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/users/Mario/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        User.findOne.mockResolvedValueOnce(mockUser)
        categories.findOne.mockResolvedValueOnce(mockCategory)

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        transactions.aggregate.mockResolvedValueOnce(userTransactions)

        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(User.findOne).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({ data: [
                                                        {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, 
                                                        {username: "Mario", amount: 70,  type: "food", date: "2023-06-19T10:00:00", color: "red"},
                                                        {username: "Mario", amount: 20,  type: "food", date: "2023-07-19T10:00:00", color: "red"}
                                                    ], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage});
    });

    test("Should return status code 200 (user route)", async() => {

        const mockReq = {
            params: { username: "Mario", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/users/Mario/transactions/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        User.findOne.mockResolvedValueOnce(mockUser)
        categories.findOne.mockResolvedValueOnce(mockCategory)
        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        transactions.aggregate.mockResolvedValueOnce(userTransactions)

        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(User.findOne).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({ data: [
                                                        {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, 
                                                        {username: "Mario", amount: 70,  type: "food", date: "2023-06-19T10:00:00", color: "red"},
                                                        {username: "Mario", amount: 20,  type: "food", date: "2023-07-19T10:00:00", color: "red"}
                                                    ], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage});
    });

    test("Should return status code 400, user not in the db (admin route)", async() => {

        const mockReq = {
            params: { username: "Mario", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/users/Mario/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        User.findOne.mockResolvedValueOnce(null)

        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(User.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, user not in the db (user route)", async() => {

        const mockReq = {
            params: { username: "Mario", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/users/Mario/transactions/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        User.findOne.mockResolvedValueOnce(null)

        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(User.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, category not in the db (admin route)", async() => {

        const mockReq = {
            params: { username: "Mario", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/users/Mario/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        User.findOne.mockResolvedValueOnce(mockUser)
        categories.findOne.mockResolvedValueOnce(null)

        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(User.findOne).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, category not in the db (user route)", async() => {

        const mockReq = {
            params: { username: "Mario", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/users/Mario/transactions/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        User.findOne.mockResolvedValueOnce(mockUser)
        categories.findOne.mockResolvedValueOnce(null)


        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(User.findOne).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 401, user is not admin (admin route)", async() => {

        const mockReq = {
            params: { username: "Mario", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/users/Mario/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        User.findOne.mockResolvedValueOnce(mockUser)
        categories.findOne.mockResolvedValueOnce(mockCategory)

        verifyAuth.mockReturnValue({ authorized: false, cause: "Requested auth for a different role" })

        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(User.findOne).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, user not the same as route (user route)", async() => {

        const mockReq = {
            params: { username: "Mario", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/users/Mario/transactions/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        User.findOne.mockResolvedValueOnce(mockUser)
        categories.findOne.mockResolvedValueOnce(mockCategory)

        verifyAuth.mockReturnValue({ authorized: false, cause: "Requested auth for a different user" })

        await getTransactionsByUserByCategory(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });
})

describe("getTransactionsByGroup", () => { 

    const Transactionsgrouped = [
        {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red"}}, 
        {username: "Mario", amount: 70,  type: "entertainment", date: "2023-06-19T10:00:00", categories_info: {color: "green"}},
        {username: "Luigi", amount: 20,  type: "food", date: "2023-07-19T10:00:00", categories_info: {color: "red"}}
    ]

    const mockUser = {
        username: "Mario",
        email: "mario@yyyy.it",
        password: "xxxxxxx",
        refreshToken: "xxxx",
        role:"Regular"
    }

    const mockUser2 = {
        username: "Luigi",
        email: "luigi@yyyy.it",
        password: "xxxxxxx",
        refreshToken: "xxxx",
        role:"Regular"
    }

    const mockGroup = {
        name: "Family",
        members: [
            {
                email: "mario@yyyy.it",
                user: "xxxxxxx"
            },
            {
                email: "luigi@yyyy.it",
                user: "yyyyyyy"
            }
        ] 
    }

    const mocktest = [{username: "Mario"}, {username: "Luigi"}]
    

    test("Should return status code 200 (admin route)", async() => {

        const mockReq = {
            params: {name: "Family"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/groups/Family"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup)

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        User.find.mockResolvedValue(mocktest)

        transactions.aggregate.mockResolvedValueOnce(Transactionsgrouped)

        await getTransactionsByGroup(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(verifyAuth).toHaveBeenCalled()
        expect(User.find).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({ data: [
                                                        {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, 
                                                        {username: "Mario", amount: 70,  type: "entertainment", date: "2023-06-19T10:00:00", color: "green"},
                                                        {username: "Luigi", amount: 20,  type: "food", date: "2023-07-19T10:00:00", color: "red"}
                                                    ], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage});
    });
    
    test("Should return status code 200 (user route)", async() => {

        const mockReq = {
            params: {name: "Family"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/groups/Family/transactions"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup)

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        User.find.mockResolvedValue(mocktest)

        transactions.aggregate.mockResolvedValueOnce(Transactionsgrouped)

        await getTransactionsByGroup(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(verifyAuth).toHaveBeenCalled()
        expect(User.find).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({ data: [
                                                        {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, 
                                                        {username: "Mario", amount: 70,  type: "entertainment", date: "2023-06-19T10:00:00", color: "green"},
                                                        {username: "Luigi", amount: 20,  type: "food", date: "2023-07-19T10:00:00", color: "red"}
                                                    ], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage});
    });

    test("Should return status code 400, group not in the db (admin route)", async() => {

        const mockReq = {
            params: {name: "Family"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/groups/Family"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(null)
        
        await getTransactionsByGroup(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, group not in the db (user route)", async() => {

        const mockReq = {
            params: {name: "Family"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/groups/Family/transactions"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(null)
        
        await getTransactionsByGroup(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 401, user is not admin (admin route)", async() => {

        const mockReq = {
            params: {name: "Family"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/groups/Family"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup)

        verifyAuth.mockReturnValue({ authorized: false, cause: "Requested auth for a different role" })

        await getTransactionsByGroup(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 401, user not in the group (user route)", async() => {

        const mockReq = {
            params: {name: "Family"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/groups/Family/transactions"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup)
        
        verifyAuth.mockReturnValue({ authorized: false, cause: "Mail of the token not present in the group" })

        await getTransactionsByGroup(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

})

describe("getTransactionsByGroupByCategory", () => { 
    const Transactionsgrouped = [
        {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red"}}, 
        {username: "Luigi", amount: 20,  type: "food", date: "2023-07-19T10:00:00", categories_info: {color: "red"}}
    ]

    const mockUser = {
        username: "Mario",
        email: "mario@yyyy.it",
        password: "xxxxxxx",
        refreshToken: "xxxx",
        role:"Regular"
    }

    const mockUser2 = {
        username: "Luigi",
        email: "luigi@yyyy.it",
        password: "xxxxxxx",
        refreshToken: "xxxx",
        role:"Regular"
    }

    const mockCategory = {
        type: "food",
        color: "red"
    }

    const mockGroup = {
        name: "Family",
        members: [
            {
                email: "mario@yyyy.it",
                user: "xxxxxxx"
            },
            {
                email: "luigi@yyyy.it",
                user: "yyyyyyy"
            }
        ] 
    }

    const mocktest = [{username: "Mario"}, {username: "Luigi"}]

    test("Should return status code 200 (admin route)", async() => {

        const mockReq = {
            params: {name: "Family", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/groups/Family/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup)

        categories.findOne.mockResolvedValueOnce(mockCategory)

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        User.find.mockResolvedValue(mocktest)

        transactions.aggregate.mockResolvedValueOnce(Transactionsgrouped)

        await getTransactionsByGroupByCategory(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(verifyAuth).toHaveBeenCalled()
        expect(User.find).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({ data: [
                                                        {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, 
                                                        {username: "Luigi", amount: 20,  type: "food", date: "2023-07-19T10:00:00", color: "red"}
                                                    ], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage});
    });

    test("Should return status code 200 (user route)", async() => {

        const mockReq = {
            params: {name: "Family", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/groups/Family/transactions/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup)

        categories.findOne.mockResolvedValueOnce(mockCategory)

        verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

        User.find.mockResolvedValue(mocktest)

        transactions.aggregate.mockResolvedValueOnce(Transactionsgrouped)

        await getTransactionsByGroupByCategory(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(verifyAuth).toHaveBeenCalled()
        expect(User.find).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith({ data: [
                                                        {username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red"}, 
                                                        {username: "Luigi", amount: 20,  type: "food", date: "2023-07-19T10:00:00", color: "red"}
                                                    ], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage});
    });

    test("Should return status code 400, group not in the db (admin route)", async() => {

        const mockReq = {
            params: {name: "Family", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/groups/Family/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(null)
        
        await getTransactionsByGroupByCategory(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    

    test("Should return status code 400, group not in the db (user route)", async() => {

        const mockReq = {
            params: {name: "Family", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/groups/Family/transactions/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(null)
        
        await getTransactionsByGroupByCategory(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, category not in the db (admin route)", async() => {

        const mockReq = {
            params: {name: "Family", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/groups/Family/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup)
        categories.findOne.mockResolvedValue(null)

        await getTransactionsByGroupByCategory(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, category not in the db (user route)", async() => {

        const mockReq = {
            params: {name: "Family", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/groups/Family/transactions/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup)
        categories.findOne.mockResolvedValue(null)
        
        await getTransactionsByGroupByCategory(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 401, user is not an admin (admin route)", async() => {

        const mockReq = {
            params: {name: "Family", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/transactions/groups/Family/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup)
        categories.findOne.mockResolvedValue(mockCategory)

        verifyAuth.mockReturnValue({ authorized: false, cause: "Requested auth for a different role" })

        await getTransactionsByGroupByCategory(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 401, user not in the group (user route)", async() => {

        const mockReq = {
            params: {name: "Family", category: "food"},
            body: {},
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken },
            url: "/api/groups/Family/transactions/category/food"
        }

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          locals: {
            refreshedTokenMessage: ""
          }
        }

        Group.findOne.mockResolvedValueOnce(mockGroup)
        categories.findOne.mockResolvedValue(mockCategory)

        verifyAuth.mockReturnValue({ authorized: false, cause: "Mail of the token not present in the group" })

        
        await getTransactionsByGroupByCategory(mockReq, mockRes)

        expect(Group.findOne).toHaveBeenCalled()
        expect(categories.findOne).toHaveBeenCalled()
        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

})

describe("deleteTransaction", () => { 
    test("Should return status code 200", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {_id: "647d8cd8ef939d0588908944"},
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

        const mockUser = {
            username: "Mario",
            email: "xxx@yyyy.it",
            password: "xxxxxxx",
            refreshToken: "xxxx",
            role:"Regular"
        }
        User.findOne.mockResolvedValueOnce(mockUser)

        const mockTrans = {
            username: "Mario",
            amount: 100,
            type: "food",
            date: "2023-05-19T00:00:00",
            _id: "647d8cd8ef939d0588908944"
        }

        transactions.findById.mockResolvedValue(mockTrans)
        transactions.deleteOne.mockResolvedValueOnce({_id: "647d8cd8ef939d0588908944"});

        await deleteTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalled()
        expect(transactions.findById).toHaveBeenCalled()
        expect(transactions.deleteOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({data: expect.objectContaining({message: "Transaction deleted"})}))
    });

    test("Should return status code 400, missing body parameters", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {},
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

        await deleteTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, empty id", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {_id: " "},
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

        await deleteTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, user not in the db", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {_id: "647d8cd8ef939d0588908944"},
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


        User.findOne.mockResolvedValueOnce(null)

        await deleteTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalled()
        
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, transaction not in the db", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {_id: "647d8cd8ef939d0588908944"},
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

        const mockUser = {
            username: "Mario",
            email: "xxx@yyyy.it",
            password: "xxxxxxx",
            refreshToken: "xxxx",
            role:"Regular"
        }
        User.findOne.mockResolvedValueOnce(mockUser)

        transactions.findById.mockResolvedValue(null)

        await deleteTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()

        expect(User.findOne).toHaveBeenCalled()
        expect(transactions.findById).toHaveBeenCalled()
        
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, transaction belong to a different user", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {_id: "647d8cd8ef939d0588908944"},
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

        const mockUser = {
            username: "Mario",
            email: "xxx@yyyy.it",
            password: "xxxxxxx",
            refreshToken: "xxxx",
            role:"Regular"
        }
        User.findOne.mockResolvedValueOnce(mockUser)

        const mockTrans = {
            username: "Luigi",
            amount: 100,
            type: "food",
            date: "2023-05-19T00:00:00",
            _id: "647d8cd8ef939d0588908944"
        }

        transactions.findById.mockResolvedValue(mockTrans)

        await deleteTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalled()
        expect(transactions.findById).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 401, user is not the same as the route", async () => {

        const mockReq = {
            params: {username: "Mario"},
            body: {_id: "647d8cd8ef939d0588908944"},
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

        await deleteTransaction(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()        
        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

})

describe("deleteTransactions", () => { 
    test("Should return status code 200", async () => {

        const mockReq = {
            body: {_ids: ["647d8cd8ef939d0588908944", "647d8cd8ef939d0588908943"]},
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

        const mockTrans1 = {
            username: "Mario",
            amount: 100,
            type: "food",
            date: "2023-05-19T00:00:00",
            _id: "647d8cd8ef939d0588908944"
        }

        const mockTrans2 = {
            username: "Luigi",
            amount: 100,
            type: "food",
            date: "2023-05-19T00:00:00",
            _id: "647d8cd8ef939d0588908943"
        }

        transactions.findById.mockResolvedValueOnce(mockTrans1)
        transactions.findById.mockResolvedValueOnce(mockTrans2)

        transactions.deleteOne.mockResolvedValueOnce({_id: "647d8cd8ef939d0588908944"});
        transactions.deleteOne.mockResolvedValueOnce({_id: "647d8cd8ef939d0588908943"});


        await deleteTransactions(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(transactions.findById).toHaveBeenCalled()
        expect(transactions.deleteOne).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({data: expect.objectContaining({message: "Transactions deleted"})}))
    });

    test("Should return status code 400, missing body attribute", async () => {

        const mockReq = {
            body: {},
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

        await deleteTransactions(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, one empty string", async () => {

        const mockReq = {
            body: {_ids: ["647d8cd8ef939d0588908944", "647d8cd8ef939d0588908943", " "]},
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

        const mockTrans1 = {
            username: "Mario",
            amount: 100,
            type: "food",
            date: "2023-05-19T00:00:00",
            _id: "647d8cd8ef939d0588908944"
        }

        const mockTrans2 = {
            username: "Luigi",
            amount: 100,
            type: "food",
            date: "2023-05-19T00:00:00",
            _id: "647d8cd8ef939d0588908943"
        }

        transactions.findById.mockResolvedValueOnce(mockTrans1)
        transactions.findById.mockResolvedValueOnce(mockTrans2)
        

        await deleteTransactions(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(transactions.findById).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 400, transaction not in the db", async () => {

        const mockReq = {
            body: {_ids: ["647d8cd8ef939d0588908944", "647d8cd8ef939d0588908943"]},
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

        const mockTrans1 = {
            username: "Mario",
            amount: 100,
            type: "food",
            date: "2023-05-19T00:00:00",
            _id: "647d8cd8ef939d0588908944"
        }

        
        transactions.findById.mockResolvedValueOnce(mockTrans1)
        transactions.findById.mockResolvedValueOnce(null)
        

        await deleteTransactions(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(transactions.findById).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });

    test("Should return status code 401, user is not an admin", async () => {

        const mockReq = {
            body: {_ids: ["647d8cd8ef939d0588908944", "647d8cd8ef939d0588908943", " "]},
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

        await deleteTransactions(mockReq,mockRes)

        expect(verifyAuth).toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: expect.any(String)}))
    });
})
