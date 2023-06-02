import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { User } from '../models/User';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

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
})

const adminAccessTokenValid = jwt.sign({
    email: "admin@email.com",
    username: "admin",
    role: "Admin"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

const testerAccessTokenValid = jwt.sign({
    email: "tester@test.com",
    username: "tester",
    role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1y' })

describe("createCategory", () => { 

    test('Should return status code 200', async () => {
        const response = await request(app)
        .post("/api/categories")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({type: "food", color: "blue"})

        expect(response.status).toBe(200)
        expect(response.body.data.type).toEqual("food")
        expect(response.body.data.color).toEqual("blue")
    });

    test('Should return status code 400, missing parameters', async () => {
        const response = await request(app)
        .post("/api/categories")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({type: "food"})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, parametes has an empty string', async () => {
        const response = await request(app)
        .post("/api/categories")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({type: "food", color:""})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, already existing category', async () => {
        await categories.create({ type: "food", color: "red" })

        const response = await request(app)
        .post("/api/categories")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({type: "food", color:"blue"})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 401, the user is not an admin', async () => {

        const response = await request(app)
        .post("/api/categories")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        .send({type: "food", color:"blue"})

        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
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
    test('Should return status code 200', async () => {
        await categories.create({ type: "food", color: "red" })
        await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const response = await request(app)
        .post("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({username: "admin", amount: 100, type: "food"})

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("data")
    });

    test('Should return status code 400, missing parameters', async () => {
        await categories.create({ type: "food", color: "red" })
        await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const response = await request(app)
        .post("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({username: "admin", type: "food"})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, empty parameter', async () => {
        await categories.create({ type: "food", color: "red" })
        await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const response = await request(app)
        .post("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({username: "admin", amount: 100, type: " "})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, category does not exist', async () => {
        await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const response = await request(app)
        .post("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({username: "admin", amount: 100, type: "food"})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    //! If the user passed as a parameter is different from the one in the token this test will return 401
    //! beacuse the verify auth is executed firstly

    test('Should return status code 400, users in body and parameter mismatch', async () => {
        await categories.create({ type: "food", color: "red" })
        await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const response = await request(app)
        .post("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({username: "test", amount: 100, type: "food"})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    //!Since body username and param username are checked one against each other this test is valid for both cases.

    test('Should return status code 400, users not in the db', async () => {
        await categories.create({ type: "food", color: "red" })

        const response = await request(app)
        .post("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({username: "admin", amount: 100, type: "food"})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, amount cannot be parsed', async () => {
        await categories.create({ type: "food", color: "red" })
        await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const response = await request(app)
        .post("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({username: "admin", amount: "ciao", type: "food"})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 401, called by different user then route param', async () => {
        await categories.create({ type: "food", color: "red" })
        await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const response = await request(app)
        .post("/api/users/test/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({username: "test", amount: "ciao", type: "food"})

        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
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
