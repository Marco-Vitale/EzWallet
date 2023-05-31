import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from "../models/model";
import { Group, User, UserSchema } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "../controllers/utils.js";
import { updateCategory } from '../controllers/controller.js';

jest.mock("../models/model");
jest.mock("../models/User.js");
jest.mock("../controllers/utils.js");

beforeEach(() => {
    categories.find.mockClear();
    categories.findOne.mockClear();
    categories.updateOne.mockClear();
    categories.updateMany.mockClear();
    categories.prototype.save.mockClear();
    transactions.find.mockClear();
    transactions.deleteOne.mockClear();
    transactions.aggregate.mockClear();
    transactions.prototype.save.mockClear();
});

describe("createCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("updateCategory", () => {  //TODO: edit with the correct requirements
    const exampleAdminAccToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV6d2FsbGV0QHRlc3QuY29tIiwiaWQiOiI2NDc2ZTAwMTNlZGQxZTQ4MzEwOGVhOGEiLCJ1c2VybmFtZSI6ImV6d2FsbGV0XzMxXzA1XzIwMjQiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU1MTIyMTIsImV4cCI6MTcxNzA0ODIxMn0.WjFDAfn9X9hkLFt-6sx8T6cGMsRnSYIdw27mERvRelQ";
    const exampleAdminRefToken=exampleAdminAccToken;

    const exampleUserAccToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QzNjVAdGVzdC5jb20iLCJpZCI6IjY0NzZlMDhkM2VkZDFlNDgzMTA4ZWE5MCIsInVzZXJuYW1lIjoidGVzdF8zMV8wNV8yMDI0Iiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU1MTIzNDUsImV4cCI6MTcxNzA0ODM0NX0._1pvR1CW1qSuIj_XnM2aKZWD7dC7ToACiXkvxsahRkk";
    const exampleUserRefToken=exampleUserAccToken;

    test("Should return status code 200", async() => {
        const mockReq = {
            params: { type: "oldCategory" },
            body: { type: "newCategory", color: "yellow" },
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
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
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Category edited successfully", count: 2 }, {refreshedTokenMessage: res.locals.refreshedTokenMessage})
    });

    test("Should return status code 400, request body does not contain all the necessary attributes", async() => {
        const mockReq = {
            params: { type: "oldCategory" },
            body: { newType: "", newColor: "yellow" }, // TODO: edit with the correct requirements
            cookies: { accessToken:exampleAdminAccToken, refreshToken:exampleAdminRefToken }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
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

        expect(mockRes.status).toHaveBeenCalledWith(401)
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
