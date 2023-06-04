import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { categories, transactions } from '../models/model';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseController";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
    await categories.deleteMany({})
    await transactions.deleteMany({})
    await User.deleteMany({})
    await Group.deleteMany({})
});

  const adminAccessTokenValid = jwt.sign({
    email: "admin@email.com",
    //id: existingUser.id, The id field is not required in any check, so it can be omitted
    username: "admin",
    role: "Admin"
  }, process.env.ACCESS_KEY, { expiresIn: '1y' });
  
  const testerAccessTokenValid = jwt.sign({
    email: "tester@test.com",
    username: "tester",
    role: "Regular"
  }, process.env.ACCESS_KEY, { expiresIn: '1y' });
  
  //These tokens can be used in order to test the specific authentication error scenarios inside verifyAuth (no need to have multiple authentication error tests for the same route)
  const testerAccessTokenExpired = jwt.sign({
    email: "tester@test.com",
    username: "tester",
    role: "Regular"
  }, process.env.ACCESS_KEY, { expiresIn: '0s' });
  const testerAccessTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, { expiresIn: "1y" });
  

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
    test('status 200 and correct retrived trasnactions', async () => {

        categories.create({
            type: "Fun",
            color: "Red"
        })
        categories.create({
            type: "Family",
            color: "Green"
        })
        transactions.insertMany([
            {
                username: "tester1",
                type: "Fun",
                amount: 500,
                date: "2023-11-25"
            },
            {
                username: "tester2",
                type: "Fun",
                amount: 400,
                date: "2023-07-22"
            },
            {
                username: "tester3",
                type: "Family",
                amount: 500,
                date: "2023-11-25"
            },
            {
                username: "tester4",
                type: "Family",
                amount: 300,
                date: "2021-11-25"
            }
        ]);


        const response = await request(app)
                      .get("/api/transactions")
                      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`)
                      .send(); //Setting cookies in the request
                      
        expect(response.status).toBe(200)
        expect(response.body.data).toStrictEqual([
            {
                username: "tester1",
                type: "Fun",
                amount: 500,
                date: "2023-11-25T00:00:00.000Z",
                color: "Red"
            },
            {
                username: "tester2",
                type: "Fun",
                amount: 400,
                date: "2023-07-22T00:00:00.000Z",
                color: "Red"
            },
            {
                username: "tester3",
                type: "Family",
                amount: 500,
                date: "2023-11-25T00:00:00.000Z",
                color: "Green"
            },
            {
                username: "tester4",
                type: "Family",
                amount: 300,
                date: "2021-11-25T00:00:00.000Z",
                color: "Green"
            }
        ]);
    });

    test('status 401 for not admin user', async () => {

        categories.create({
            type: "Fun",
            color: "Red"
        })
        categories.create({
            type: "Family",
            color: "Green"
        })
        transactions.insertMany([
            {
                username: "tester1",
                type: "Fun",
                amount: 500,
                date: "2023-11-25"
            },
            {
                username: "tester2",
                type: "Fun",
                amount: 400,
                date: "2023-07-22"
            },
            {
                username: "tester3",
                type: "Family",
                amount: 500,
                date: "2023-11-25"
            },
            {
                username: "tester4",
                type: "Family",
                amount: 300,
                date: "2021-11-25"
            }
        ]);


        const response = await request(app)
                      .get("/api/transactions")
                      .set("Cookie", `accessToken=${testerAccessTokenValid}; refreshToken=${testerAccessTokenValid}`); //Setting cookies in the request
                      
        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty("error");
    });
});

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
