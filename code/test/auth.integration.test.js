import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
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

describe('register', () => {
});

describe("registerAdmin", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe('login', () => { 
    
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
    "password": "tester"
}
  */
  
  

  test.skip("[REGULAR](status: 200) should login regular user", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester_pass",
      role: "Regular",
      
    }).then((currUser) => {
      request(app)
        .post("/api/login")
        .send({"email": "test@test.com", "password": "tester_pass"})
        .then((response) => {
          console.log(response.body)
          expect(response.status).toBe(200)

  
          //Controlli sui campi
          expect(response.body).toHaveProperty("data")
          expect(response.body.data).toHaveProperty("accessToken")
          expect(response.body.data).toHaveProperty("refreshToken")

          const decodedAccessToken = jwt.verify(response.body.accessToken, process.env.ACCESS_KEY);

          expect(decodedAccessToken.username).toEqual("tester")
          expect(decodedAccessToken.email).toEqual("test@test.com")
          expect(decodedAccessToken.role).toEqual("Regular")

          const decodedRefreshToken = jwt.verify(response.body.refreshToken, process.env.ACCESS_KEY);

          expect(decodedRefreshToken.username).toEqual("tester")
          expect(decodedRefreshToken.email).toEqual("test@test.com")
          expect(decodedRefreshToken.role).toEqual("Regular")
        
          expect(currUser.refreshToken).toEqual(response.body.refreshToken)


          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

  test("(status: 400) if the request body does not contain all the necessary attributes", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester_pass",
      role: "Regular",
      
    }).then((currUser) => {
      request(app)
        .post("/api/login")
        .send({})
        .then((response) => {
          expect(response.status).toBe(400)
          expect(response.body).toHaveProperty("error") 
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

  test("(status: 400) if the email in the request body is not in a valid email format", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester_pass",
      role: "Regular",
      
    }).then((currUser) => {
      request(app)
        .post("/api/login")
        .send({email: "tester", password:"tester_pass"})
        .then((response) => {
          expect(response.status).toBe(400)
          expect(response.body).toHaveProperty("error") 
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

  test("(status: 400) if the email in the request body does not identify a user in the database", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester_pass",
      role: "Regular",
      
    }).then((currUser) => {
      request(app)
        .post("/api/login")
        .send({email: "gianni@test.com", password:"tester_pass"})
        .then((response) => {
          expect(response.status).toBe(400)
          expect(response.body).toHaveProperty("error") 
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

  test("(status: 400) if the supplied password does not match with the one in the database", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester_pass",
      role: "Regular",
      
    }).then((currUser) => {
      request(app)
        .post("/api/login")
        .send({email: "test@test.com", password:"tester"})
        .then((response) => {
          expect(response.status).toBe(400)
          console.log(response.body)
          expect(response.body).toHaveProperty("error") 
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

});

describe('logout', () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
});
