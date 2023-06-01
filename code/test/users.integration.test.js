import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';

/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();
beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("getUsers", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
  beforeEach(async () => {
    await User.deleteMany({})
  })
  /* [ADMIN]
  username: administratortest
  password: administratorpassword
  mail: administrator@test.com
  */
  const exampleAdminRefToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluaXN0cmF0b3JAdGVzdC5jb20iLCJpZCI6IjY0Nzg1YTI1MzJhZDk2MGIwNWZhMmJlMiIsInVzZXJuYW1lIjoiYWRtaW5pc3RyYXRvcnRlc3QiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU2MDkwMTEsImV4cCI6MTY4NjIxMzgxMX0.GAlIbL2MjisoEjDE8kHJAjVkAzjUsJjYzmhj6lxi3Yo";
  const exampleAdminAccToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluaXN0cmF0b3JAdGVzdC5jb20iLCJpZCI6IjY0Nzg1YTI1MzJhZDk2MGIwNWZhMmJlMiIsInVzZXJuYW1lIjoiYWRtaW5pc3RyYXRvcnRlc3QiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU2MDkwMTEsImV4cCI6MTY4NjIxMzgxMX0.GAlIbL2MjisoEjDE8kHJAjVkAzjUsJjYzmhj6lxi3Yo";

  /* [REGULAR]
  {
    "username":"test", 
    "email": "test@test.com",
    "password": "testpassword"
}
  */
  const exampleUserAccToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjY0Nzg1OWNjMzJhZDk2MGIwNWZhMmJkYyIsInVzZXJuYW1lIjoidGVzdCIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1NjA4OTE0LCJleHAiOjE2ODYyMTM3MTR9.iCW-B4_BHHYN4lUS0Ny_XP52HVuKdm7nT-ftWIZZUFw";
  const exampleUserRefToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjY0Nzg1OWNjMzJhZDk2MGIwNWZhMmJkYyIsInVzZXJuYW1lIjoidGVzdCIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1NjA4OTE0LCJleHAiOjE2ODYyMTM3MTR9.iCW-B4_BHHYN4lUS0Ny_XP52HVuKdm7nT-ftWIZZUFw";

  test("[ADMIN] should return empty list if there are no users", (done) => {
    request(app)
      .get("/api/users")
      .set("Cookie", `accessToken=${exampleAdminAccToken};refreshToken=${exampleAdminRefToken}`)
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(0)
        done()
      })
      .catch((err) => done(err))
  })

  test("[ADMIN] should retrieve list of all users", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
    }).then(() => {
      request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${exampleAdminAccToken};refreshToken=${exampleAdminRefToken}`)
        .then((response) => {
          expect(response.status).toBe(200)
          expect(response.body).toHaveLength(1)
          expect(response.body[0].username).toEqual("tester")
          expect(response.body[0].email).toEqual("test@test.com")
          expect(response.body[0].password).toEqual("tester")
          expect(response.body[0].role).toEqual("Regular")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
})

describe("getUser", () => { })

describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })
