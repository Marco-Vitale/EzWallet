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
  await categories.deleteMany({})
  await transactions.deleteMany({})
  await User.deleteMany({})
  await Group.deleteMany({})
})


describe('register', () => {
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
