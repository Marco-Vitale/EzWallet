import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { verifyAuth } from '../controllers/utils';
import { getAllTransactions } from '../controllers/controller';

jest.mock('../models/model');

beforeEach(() => {
    jest.clearAllMocks();
    //additional `mockClear()` must be placed here
  });
  
jest.mock('../controllers/utils.js', () => ({
    verifyAuth: jest.fn(),
}))

describe("createCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
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
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
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
