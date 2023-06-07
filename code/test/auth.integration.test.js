import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
    const dbName = "testingDatabaseAuth";
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

const testerAccessTokenExpired = jwt.sign({
  email: "tester@test.com",
  username: "tester",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '0s' })
const testerAccessTokenEmpty = jwt.sign({}, process.env.ACCESS_KEY, { expiresIn: "1y" })

describe('register', () => {
  test("Should return 200 and register the user", async() => {
    const response = await request(app)
        .post("/api/register")
        .send({username: "tester1", email: "tester1@test.com", password: "secure_password"})
    
    expect(response.status).toBe(200)
    expect(response.body.data).toHaveProperty("message")
  });

  test("Should return 400: the request body does not contain all the necessary attributes", async() => {
    const response = await request(app)
        .post("/api/register")
        .send({username: "tester1", password: "secure_password"})
    
    expect(response.status).toBe(400)
    const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
  });

  test("Should return 400: at least one of the parameters in the request body is an empty strings", async() => {
    const response = await request(app)
        .post("/api/register")
        .send({username: "tester1", email: "tester1@test.com", password: ""})
    
    expect(response.status).toBe(400)
    const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
  });

  test("Should return 400: the email in the request body is not in a valid email format", async() => {
    const response = await request(app)
        .post("/api/register")
        .send({username: "tester1", email: "tester1_test.com", password: "secure_password"})
    
    expect(response.status).toBe(400)
    const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
  });

  test("Should return 400: the username in the request body identifies an already existing use", async() => {
    await User.create(
      {username: "tester1", email: "tester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid}
    )
    const response = await request(app)
        .post("/api/register")
        .send({username: "tester1", email: "tester1@test.com", password: "secure_password"})
    
    expect(response.status).toBe(400)
    const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
  });

  test("Should return 400: the email in the request body identifies an already existing user", async() => {
    await User.create(
      {username: "tester", email: "tester1@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid}
    )
    const response = await request(app)
        .post("/api/register")
        .send({username: "tester1", email: "tester1@test.com", password: "secure_password"})
    
    expect(response.status).toBe(400)
    const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
  });
});

describe("registerAdmin", () => { 
    test('status 200 and message returned', async () => {
      const response = await request(app)
                      .post("/api/admin")
                      .send({username: "admin", email: "admin@email.com", password: "securePass"});
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("message");
    });

    test('status 400 for missing body content', async () => {
      const response = await request(app)
                      .post("/api/admin")
                      .send({username: "admin", password: "securePass"});
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error");
    });

    test('status 400 for empty string body content', async () => {
      const response = await request(app)
                      .post("/api/admin")
                      .send({username: "admin", email: "admin@email.com", password: "   "});
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error");
    });

    test('status 400 for invalid email format', async () => {
      const response = await request(app)
                      .post("/api/admin")
                      .send({username: "admin", email: "wrongemail.it", password: "securePass"});
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error");
    });

    test('status 400 for already existing username', async () => {
      await User.create({
        username: "sameuser",
        email: "test@test.com",
        password: "tester",
      })
      const response = await request(app)
                      .post("/api/admin")
                      .send({username: "sameuser", email: "admin@email.com", password: "securePass"});
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error");
    });

    test('status 400 for already existing email', async () => {
      await User.create({
        username: "tester",
        email: "same@test.com",
        password: "tester",
      })
      const response = await request(app)
                      .post("/api/admin")
                      .send({username: "Admin", email: "same@test.com", password: "securePass"});
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error");
    });



})

describe('login', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});

describe('logout', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});
