import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import e from 'express';

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
    "password": "tester"
}
  */
  
  const exampleUserRefToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjY0NzhhNTg2MzdlZmM0YWZmMmVlNWVlMyIsInVzZXJuYW1lIjoidGVzdGVyIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU2MjgyOTksImV4cCI6MTY4NjIzMzA5OX0.WVpquYNQ9w1WwzP395o57d8-GNqcNJoU6lVawB4N5m8";
  const exampleUserAccToken= exampleUserRefToken;
 

  test("[ADMIN](status: 200) should retrieve list of the only one user", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
      role: "Regular"
    }).then(() => {
      request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${exampleAdminAccToken};refreshToken=${exampleAdminRefToken}`)
        .then((response) => {
          expect(response.status).toBe(200)

          //Controlli sulla dimensione della risposta (può aspettare sia il refresh token che no)
          expect(Object.keys(response.body).length).toBeGreaterThan(0)
          expect(Object.keys(response.body).length).toBeLessThan(3)


          //Controlli sui campi
          expect(response.body).toHaveProperty("data")
          if(Object.keys(response.body).length==2){
            expect(response.body).toHaveProperty("refreshedTokenMessage")
          }
          
          expect(response.body.data).toHaveLength(1)

          //Controllo sui singoli dati
          expect(response.body.data[0].username).toEqual("tester")
          expect(response.body.data[0].email).toEqual("test@test.com")
          expect(response.body.data[0].role).toEqual("Regular")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
  test("[ADMIN](status: 200) no user in the system, returned empty list", (done) => {
    
        request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${exampleAdminAccToken};refreshToken=${exampleAdminRefToken}`)
        .then((response) => {
          expect(response.status).toBe(200)

          //Controlli sulla dimensione della risposta
          expect(Object.keys(response.body).length).toBeGreaterThan(0)
          expect(Object.keys(response.body).length).toBeLessThan(3)

          
          //Controlli sui campi
          expect(response.body).toHaveProperty("data")
          if(Object.keys(response.body).length==2){
            expect(response.body).toHaveProperty("refreshedTokenMessage")
          }
          expect(response.body.data).toHaveLength(0)
          
                  
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  
  test("[ADMIN](status: 200) should retrieve list of all users", (done) => {
    
    
    User.create([{username: "Mario", email: "mario.red@email.com", password: "mario_password", role: "Regular"},
                 {username: "Luigi", email: "luigi.red@email.com", password: "luigi_password", role: "Regular"},
                 {username: "admin", email: "admin@email.com", password: "admin_password", role: "Admin"}],
    ).then(() => {
      request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${exampleAdminAccToken};refreshToken=${exampleAdminRefToken}`)
        .then((response) => {
          expect(response.status).toBe(200)
          

          //Controlli sulla dimensione della risposta
          expect(Object.keys(response.body).length).toBeGreaterThan(0)
          expect(Object.keys(response.body).length).toBeLessThan(3)


          //Controlli sui campi
          expect(response.body).toHaveProperty("data")
          if(Object.keys(response.body).length==2){
            expect(response.body).toHaveProperty("refreshedTokenMessage")
          }
          
          expect(response.body.data).toHaveLength(3)
          //Controllo sui singoli dati
          expect(response.body.data[0].username).toEqual("Mario")
          expect(response.body.data[0].email).toEqual("mario.red@email.com")
          expect(response.body.data[0].role).toEqual("Regular")

          expect(response.body.data[1].username).toEqual("Luigi")
          expect(response.body.data[1].email).toEqual("luigi.red@email.com")
          expect(response.body.data[1].role).toEqual("Regular")

          expect(response.body.data[2].username).toEqual("admin")
          expect(response.body.data[2].email).toEqual("admin@email.com")
          expect(response.body.data[2].role).toEqual("Admin")          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
})

  test("[REGULAR](status: 401) authError if i'm authenticated as regular user", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
      role: "Regular"
    }).then(() => {
      request(app)
        .get("/api/users")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .then((response) => {
          expect(response.status).toBe(401)
          expect(Object.keys(response.body)).toHaveLength(1)
          expect(response.body).toHaveProperty("error")
          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })

  })

})



describe("getUser", () => { 
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
  const exampleAdminAccToken=exampleAdminRefToken;

  /* [REGULAR]
  {
    "username":"tester", 
    "email": "test@test.com",
    "password": "tester"
}
  */
  
  const exampleUserRefToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjY0NzhhNTg2MzdlZmM0YWZmMmVlNWVlMyIsInVzZXJuYW1lIjoidGVzdGVyIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU2MzExMjIsImV4cCI6MTY4NjIzNTkyMn0.XhUwuKINOEQHtYE1hOCPv-a5TR_NIB4l-R9AdRnL024";
  const exampleUserAccToken= exampleUserRefToken;
  test("[ADMIN](status: 200) should retrieve himself", (done) => {
    User.create({
      username: "administratortest",
      email: "administrator@test.com",
      password: "administrator_password",
      role: "Admin"
    }).then(() => {
      request(app)
        .get("/api/users/administratortest")
        .set("Cookie", `accessToken=${exampleAdminAccToken};refreshToken=${exampleAdminRefToken}`)
        .then((response) => {
          expect(response.status).toBe(200)

          //Controlli sulla dimensione della risposta (può aspettare sia il refresh token che no)
          expect(Object.keys(response.body).length).toBeGreaterThan(0)
          expect(Object.keys(response.body).length).toBeLessThan(3)

          expect(response.body.data).not.toBeInstanceOf(Array)

          //Controlli sui campi
          expect(response.body).toHaveProperty("data")
          if(Object.keys(response.body).length==2){
            expect(response.body).toHaveProperty("refreshedTokenMessage")
          }
          
          
        
          
          console.log(response.body)
          //Controllo sui singoli dati
          expect(response.body.data.username).toEqual("administratortest")
          expect(response.body.data.email).toEqual("administrator@test.com")
          expect(response.body.data.role).toEqual("Admin")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

  test("[ADMIN](status: 200) should retrieve another user", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
      role: "Regular"
    }).then(() => {
      request(app)
        .get("/api/users/tester")
        .set("Cookie", `accessToken=${exampleAdminAccToken};refreshToken=${exampleAdminRefToken}`)
        .then((response) => {
          expect(response.status).toBe(200)

          //Controlli sulla dimensione della risposta (può aspettare sia il refresh token che no)
          expect(Object.keys(response.body).length).toBeGreaterThan(0)
          expect(Object.keys(response.body).length).toBeLessThan(3)

          expect(response.body.data).not.toBeInstanceOf(Array)

          //Controlli sui campi
          expect(response.body).toHaveProperty("data")
          if(Object.keys(response.body).length==2){
            expect(response.body).toHaveProperty("refreshedTokenMessage")
          }
          
          

          //Controllo sui singoli dati
          expect(response.body.data.username).toEqual("tester")
          expect(response.body.data.email).toEqual("test@test.com")
          expect(response.body.data.role).toEqual("Regular")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

  test("[REGULAR](status: 200) should retrieve himself", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
      role: "Regular"
    }).then(() => {
      request(app)
        .get("/api/users/tester")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .then((response) => {
          console.log(response)
          expect(response.status).toBe(200)

          //Controlli sulla dimensione della risposta (può aspettare sia il refresh token che no)
          expect(Object.keys(response.body).length).toBeGreaterThan(0)
          expect(Object.keys(response.body).length).toBeLessThan(3)

          expect(response.body.data).not.toBeInstanceOf(Array)

          //Controlli sui campi
          expect(response.body).toHaveProperty("data")
          if(Object.keys(response.body).length==2){
            expect(response.body).toHaveProperty("refreshedTokenMessage")
          }
          
          

          //Controllo sui singoli dati
          expect(response.body.data.username).toEqual("tester")
          expect(response.body.data.email).toEqual("test@test.com")
          expect(response.body.data.role).toEqual("Regular")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })



})

describe("createGroup", () => { })

describe("getGroups", () => { })

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

describe("deleteGroup", () => { })
