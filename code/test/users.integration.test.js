import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { verifyAuth, handleDateFilterParams } from '../controllers/utils.js';


const exampleAdminAccToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV6d2FsbGV0QHRlc3QuY29tIiwiaWQiOiI2NDc2ZTAwMTNlZGQxZTQ4MzEwOGVhOGEiLCJ1c2VybmFtZSI6ImV6d2FsbGV0XzMxXzA1XzIwMjQiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2ODU1MTIyMTIsImV4cCI6MTcxNzA0ODIxMn0.WjFDAfn9X9hkLFt-6sx8T6cGMsRnSYIdw27mERvRelQ";
const exampleAdminRefToken=exampleAdminAccToken;

const exampleUserAccToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QzNjVAdGVzdC5jb20iLCJpZCI6IjY0NzZlMDhkM2VkZDFlNDgzMTA4ZWE5MCIsInVzZXJuYW1lIjoidGVzdF8zMV8wNV8yMDI0Iiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU1MTIzNDUsImV4cCI6MTcxNzA0ODM0NX0._1pvR1CW1qSuIj_XnM2aKZWD7dC7ToACiXkvxsahRkk";
const exampleUserRefToken=exampleUserAccToken;


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
  })

});

/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
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


/**
 * Alternate way to create the necessary tokens for authentication without using the website
 */
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


describe("getUsers", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
  beforeEach(async () => {
    await categories.deleteMany({})
    await transactions.deleteMany({})
    await User.deleteMany({})
    await Group.deleteMany({})
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
          expect(response.body.data).toEqual(expect.arrayContaining([
            {username: "Mario", email: "mario.red@email.com", role: "Regular"},
            {username: "Luigi", email: "luigi.red@email.com", role: "Regular"},
            {username: "admin", email: "admin@email.com", role: "Admin"}
          ]))

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
      role: "Regular"})
      .then(() => {
      request(app)
        .get("/api/users/tester")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
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

  test("[REGULAR](status: 401) should not retrieve other user", (done) => {
    
    User.create([{username: "Luigi", email: "luigi.red@email.com", password: "luigi_password", role: "Regular"},
    {
      username: "tester",
      email: "test@test.com",
      password: "tester",
      role: "Regular"
    }],)
    .then(() => {
      request(app)
        .get("/api/users/Luigi")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .then((response) => {
          
          expect(response.status).toBe(401)

          //Controlli sulla dimensione della risposta (può aspettare sia il refresh token che no)
          expect(Object.keys(response.body).length).toBeGreaterThan(0)

          expect(response.body).toHaveProperty("error")
          
          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

  // Problema dato il check dell'autorizzazione prima del check dell'esistenza dell'utente, quindi non riesco mai a testare questo errore per regular
  // test("[REGULAR](status: 400) user not found", (done) => {
  //   User.create({
  //     username: "tester",
  //     email: "test@test.com",
  //     password: "tester",
  //     role: "Regular"
  //   }).then(() => {
  //     request(app)
  //       .get("/api/users/fjdksjao")
  //       .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
  //       .then((response) => {
          
  //         expect(response.status).toBe(400)

  //         //Controlli sulla dimensione della risposta (può aspettare sia il refresh token che no)
  //         expect(Object.keys(response.body).length).toBeGreaterThan(0)
  //         expect(Object.keys(response.body).length).toBeLessThan(3)         
  //         expect(response.body).toHaveProperty("error")
          
          
  //         done() // Notify Jest that the test is complete
  //       })
  //       .catch((err) => done(err))
  //   })
  // })

  test("[ADMIN](status: 400) user not found", (done) => {
    User.create({
      username: "administratortest",
      email: "administrator@test.com",
      password: "administratorpassword",
      role: "Admin"
    }).then(() => {
      request(app)
        .get("/api/users/ecci")
        .set("Cookie", `accessToken=${exampleAdminAccToken};refreshToken=${exampleAdminRefToken}`)
        .then((response) => {
          
          expect(response.status).toBe(400)

          //Controlli sulla dimensione della risposta (può aspettare sia il refresh token che no)
          expect(Object.keys(response.body).length).toBeGreaterThan(0)
          expect(Object.keys(response.body).length).toBeLessThan(3)         
          expect(response.body).toHaveProperty("error")
          
          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
})

describe("createGroup", () => { 

  test("status 200 and data object correctly computed", async () => {

    await User.insertMany([{
      username: "tester365",
      email: "test365@test.com",
      password: "tester",
      refreshToken: exampleUserRefToken
      },{
      username: "tester1",
      email: "tester1@test.com",
      password: "tester",
      refreshToken: exampleUserRefToken
      }, {
        username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
    },
      {
        username: "tester3",
        email: "tester3@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
      }]);

      await Group.create({
          name: "Family",
          members: [{email: "tester3@test.com"}]
        });

      const response = await request(app)
                      .post("/api/groups")
                      .set("Cookie", `accessToken=${exampleUserAccToken}; refreshToken=${exampleUserRefToken}`) //Setting cookies in the request
                      .send({name: "Fun", memberEmails: ["tester1@test.com", "tester2@test.com", "tester3@test.com", "notfound@email.com"]});
      
        expect(response.status).toBe(200)
        expect(response.body.data).toStrictEqual({group: {name: "Fun", 
                members: [{email: "test365@test.com"},{email: "tester1@test.com"}, {email: "tester2@test.com"}]}, 
                membersNotFound: [{email: "notfound@email.com"}], alreadyInGroup: [{email: "tester3@test.com"}]});
        //expect(response.body).toHaveProperty("refreshedTokenMessage");

      
  });

  test("status 400 for incorrect body", async () => {

    await User.insertMany([{
      username: "tester1",
      email: "tester1@test.com",
      password: "tester",
      refreshToken: exampleUserRefToken
      }, {
        username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
    },
      {
        username: "tester3",
        email: "tester3@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
      }]);

      await Group.create({
          name: "Family",
          members: [{email: "tester3@test.com"}]
        });

      const response = await request(app)
                      .post("/api/groups")
                      .set("Cookie", `accessToken=${exampleUserAccToken}; refreshToken=${exampleUserRefToken}`) //Setting cookies in the request
                      .send({memberEmails: ["tester1@test.com", "tester2@test.com", "tester3@test.com", "notfound@email.com"]});
      
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error");

      
  });

  test("status 400 for empty group name", async () => {

    await User.insertMany([{
      username: "tester1",
      email: "tester1@test.com",
      password: "tester",
      refreshToken: exampleUserRefToken
      }, {
        username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
    },
      {
        username: "tester3",
        email: "tester3@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
      }]);

      await Group.create({
          name: "Family",
          members: [{email: "tester3@test.com"}]
        });

      const response = await request(app)
                      .post("/api/groups")
                      .set("Cookie", `accessToken=${exampleUserAccToken}; refreshToken=${exampleUserRefToken}`) //Setting cookies in the request
                      .send({name: "    ", memberEmails: ["tester1@test.com", "tester2@test.com", "tester3@test.com", "notfound@email.com"]});
      
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error");
  });


 test("status 400 for already present group", async () => {

    await User.insertMany([{
      username: "tester1",
      email: "tester1@test.com",
      password: "tester",
      refreshToken: exampleUserRefToken
      }, {
        username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
    },
      {
        username: "tester3",
        email: "tester3@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
      }]);

      await Group.create({
          name: "Family",
          members: [{email: "tester3@test.com"}]
        });

      const response = await request(app)
                      .post("/api/groups")
                      .set("Cookie", `accessToken=${exampleUserAccToken}; refreshToken=${exampleUserRefToken}`) //Setting cookies in the request
                      .send({name: "Family", memberEmails: ["tester1@test.com", "tester2@test.com", "tester3@test.com", "notfound@email.com"]});
      
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error");
  });

  test("status 400 for already used/do not exist emails in a group", async () => {

    await User.insertMany([{
      username: "tester1",
      email: "tester1@test.com",
      password: "tester",
      refreshToken: exampleUserRefToken
      }, {
        username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
    },
      {
        username: "tester3",
        email: "tester3@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
      }]);

      await Group.create({
          name: "Family",
          members: [{email: "tester3@test.com"}]
        });

      const response = await request(app)
                      .post("/api/groups")
                      .set("Cookie", `accessToken=${exampleUserAccToken}; refreshToken=${exampleUserRefToken}`) //Setting cookies in the request
                      .send({name: "Fun", memberEmails: ["tester3@test.com", "notfound@email.com"]});
      
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error");
  });

  test("status 400 for invalid email format", async () => {

    await User.insertMany([{
      username: "tester1",
      email: "tester1@test.com",
      password: "tester",
      refreshToken: exampleUserRefToken
      }, {
        username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
    },
      {
        username: "tester3",
        email: "tester3@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
      }]);

      await Group.create({
          name: "Family",
          members: [{email: "tester3@test.com"}]
        });

      const response = await request(app)
                      .post("/api/groups")
                      .set("Cookie", `accessToken=${exampleUserAccToken}; refreshToken=${exampleUserRefToken}`) //Setting cookies in the request
                      .send({name: "Fun", memberEmails: ["tester2@test.com", "invalidEmail.com"]});
      
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error");
  });

  test("status 400 for empty member emails with and without blank spaces", async () => {

    await User.insertMany([{
      username: "tester1",
      email: "tester1@test.com",
      password: "tester",
      refreshToken: exampleUserRefToken
      }, {
        username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
    },
      {
        username: "tester3",
        email: "tester3@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
      }]);

      await Group.create({
          name: "Family",
          members: [{email: "tester3@test.com"}]
        });

      const response = await request(app)
                      .post("/api/groups")
                      .set("Cookie", `accessToken=${exampleUserAccToken}; refreshToken=${exampleUserRefToken}`) //Setting cookies in the request
                      .send({name: "Fun", memberEmails: ["", "   "]});
      
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("error");
  });

  test("status 401 for unauthenticated user", async () => {

    await User.insertMany([{
      username: "tester1",
      email: "tester1@test.com",
      password: "tester",
      refreshToken: exampleUserRefToken
      }, {
        username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
    },
      {
        username: "tester3",
        email: "tester3@test.com",
        password: "tester",
        refreshToken: exampleUserRefToken
      }]);

      await Group.create({
          name: "Family",
          members: [{email: "tester3@test.com"}]
        });

      const response = await request(app)
                      .post("/api/groups")
                      .set("Cookie", `accessToken=${testerAccessTokenEmpty}; refreshToken=${testerAccessTokenEmpty}`) //Setting cookies in the request
                      .send({name: "Fun", memberEmails: ["tester2@test.com"]});
      
        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty("error");
  });



 




})

describe("getGroups", () => { 

  test("should return status 200 for a call by auth admin", async () => {
    await Group.create(
      {
        name: "Family",
        members: [{email: "tester3@test.com"}, {email: "tester2@email.com"}]
      }
    );

    await Group.create({
      name: "Fun",
      members: [{email: "tester4@test.com"}, {email: "tester5@email.com"}]
    });

    const response = await request(app)
                      .get("/api/groups")
                      .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`); //Setting cookies in the request
                    
      
    expect(response.status).toBe(200);
    expect(response.body.data).toStrictEqual([{name: "Family", 
    members: [{email: "tester3@test.com"}, {email: "tester2@email.com"}]},
    {name: "Fun", 
    members: [{email: "tester4@test.com"}, {email: "tester5@email.com"}]}
    ]);
  })

  test("should return status 401 for a call by non admin user", async () => {
    await Group.create(
      {
        name: "Family",
        members: [{email: "tester3@test.com"}, {email: "tester2@email.com"}]
      }
    );

    await Group.create({
      name: "Fun",
      members: [{email: "tester4@test.com"}, {email: "tester5@email.com"}]
    });

    const response = await request(app)
                      .get("/api/groups")
                      .set("Cookie", `accessToken=${exampleUserAccToken}; refreshToken=${exampleUserRefToken}`); //Setting cookies in the request
                    
      
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");

  })
})

describe("getGroup", () => {
  let members = []
  beforeEach(async () => {
    members = []
    await User.deleteMany({})
    await Group.deleteMany({})
    await User.create([{username: "Luigi", email: "luigi.red@email.com", password: "luigi_password", role: "Regular"},{username: "Mario", email: "mario.red@email.com", password: "mario_password", role: "Regular"},
    {
      username: "tester",
      email: "test@test.com",
      password: "tester",
      role: "Regular"
    },
   
    {
      username: "testerAlone",
      email: "tester@alone.com",
      password: "tester_alone",
      role: "Regular"
      
    },
    {  
      username: "administratortest",
      password: "administratorpassword",
      email: "administrator@test.com", 
      role: "Admin"
    }
  ])

    const member_emails  = ["luigi.red@email.com","mario.red@email.com", "test@test.com"]
  
    for (const e of member_emails){
      const user = await User.findOne({email: e}).then((user) => user._id )
      members.push({email: e, user: user})
    }


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
  test("[REGULAR](status: 200) should retrieve group of given user in it", (done) => {
    
    
    Group.create({
      name: "testgroup",
      members: members}
    ).then(() => {
      request(app)
        .get("/api/groups/testgroup")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
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
          expect(response.body.data).toHaveProperty("group")
          expect(response.body.data.group.name).toEqual("testgroup")
          expect(response.body.data.group.members).toBeInstanceOf(Array)
          expect(response.body.data.group.members[0].email).toEqual("luigi.red@email.com")
          expect(response.body.data.group.members[1].email).toEqual("mario.red@email.com")
          expect(response.body.data.group.members[2].email).toEqual("test@test.com")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

  test("[REGULAR](status: 401) should retrieve error cause i'm not in the group", (done) => {    
    const exampleUserAloneRefToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RlckBhbG9uZS5jb20iLCJpZCI6IjY0N2M4ZjA4NDkwYzAzMjI1NGU4ZjYwZiIsInVzZXJuYW1lIjoidGVzdGVyQWxvbmUiLCJyb2xlIjoiUmVndWxhciIsImlhdCI6MTY4NTg4NDY5MiwiZXhwIjoxNjg2NDg5NDkyfQ.d5Jr8qtMadtnh87Yjh4p4OshYAkZ8GHUW3yoUA2Et1o"
    const exampleUserAloneAccToken = exampleUserAloneRefToken
    Group.create({
       name: "testgroup",
       members: members
    }).then(() => {
      request(app)
        .get("/api/groups/testgroup")
        .set("Cookie", `accessToken=${exampleUserAloneAccToken};refreshToken=${exampleUserAloneRefToken}`)
        .then((response) => {
     
          (response.body)

          expect(response.status).toBe(401)
         
          
          expect(Object.keys(response.body).length).toBe(1)
              
          expect(response.body).toHaveProperty("error")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
   })
  })

  test("[ADMIN](status: 200) should retrieve group where i'm not in", (done) => {    
    
    Group.create({
       name: "testgroup",
       members: members
    }).then(() => {
      request(app)
        .get("/api/groups/testgroup")
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
          expect(response.body.data).toHaveProperty("group")
          expect(response.body.data.group.name).toEqual("testgroup")
          expect(response.body.data.group.members).toBeInstanceOf(Array)
          expect(response.body.data.group.members[0].email).toEqual("luigi.red@email.com")
          expect(response.body.data.group.members[1].email).toEqual("mario.red@email.com")
          expect(response.body.data.group.members[2].email).toEqual("test@test.com")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
   })
  })

  test("[ADMIN](status: 400) should retrieve error if group doesn't exist", (done) => {    
    
    Group.create({
       name: "testgroup",
       members: members
    }).then(() => {
      request(app)
        .get("/api/groups/groupnotexisting")
        .set("Cookie", `accessToken=${exampleAdminAccToken};refreshToken=${exampleAdminRefToken}`)
        .then((response) => {
          (response.body)
          expect(response.status).toBe(400)
          //Controlli sulla dimensione della risposta (può aspettare sia il refresh token che no)
          expect(Object.keys(response.body).length).toBeGreaterThan(0)
          expect(Object.keys(response.body).length).toBeLessThan(3)         
          expect(response.body).toHaveProperty("error")
          
         
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
   })
  })

  test("[REGUALAR](status: 400) should retrieve error if group doesn't exist", (done) => {    
    
    Group.create({
       name: "testgroup",
       members: members
    }).then(() => {
      request(app)
        .get("/api/groups/groupnotexisting")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .then((response) => {
          expect(response.status).toBe(400)
          //Controlli sulla dimensione della risposta (può aspettare sia il refresh token che no)
          expect(Object.keys(response.body).length).toBeGreaterThan(0)
          expect(Object.keys(response.body).length).toBeLessThan(3)         
          expect(response.body).toHaveProperty("error")
          
         
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
   })
  })

 })

describe("addToGroup", () => {
let members = []

beforeEach(async () => {
  members = []
  await User.deleteMany({})
  await Group.deleteMany({})
  await User.create([{username: "Luigi", email: "luigi.red@email.com", password: "luigi_password", role: "Regular"},{username: "Mario", email: "mario.red@email.com", password: "mario_password", role: "Regular"},
  {
    username: "tester",
    email: "test@test.com",
    password: "tester",
    role: "Regular"
  },
  
  {
    username: "testerAlone",
    email: "tester@alone.com",
    password: "tester_alone",
    role: "Regular"
    
  },
  {
    username: "federico",
    email: "federico@email.com",
    password: "federico_pass",
    role: "Regular"
    
  },
  {  
    username: "administratortest",
    password: "administratorpassword",
    email: "administrator@test.com", 
    role: "Admin"
  }
])

  const member_emails  = ["luigi.red@email.com","mario.red@email.com", "test@test.com"]

  for (const e of member_emails){
    const user = await User.findOne({email: e}).then((user) => user._id )
    members.push({email: e, user: user})
  }

  
  
})

afterEach(async () => {
  await Group.findOne({name: "testgroup"}).then((group) => {
    const e = group.members
    let poisoned = e.map((el) => el.email).includes("tester@alone.com");
    expect(poisoned).toBe(false)    
    
  })

  
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

test("[REGULAR](status: 200) should retrieve group of given user in it", (done) => {
  
  
  Group.create({
    name: "testgroup",
    members: members}
  ).then((gr) => {
    request(app)
      .patch("/api/groups/"+gr.name+"/add")
      .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
      .send({emails: ["federico@email.com","administrator@test.com"]})
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
        expect(response.body.data).toHaveProperty("group")
        expect(response.body.data.group.name).toEqual("testgroup")
        expect(response.body.data.group.members).toBeInstanceOf(Array)
        expect(response.body.data.group.members[0].email).toEqual("luigi.red@email.com")
        expect(response.body.data.group.members[1].email).toEqual("mario.red@email.com")
        expect(response.body.data.group.members[2].email).toEqual("test@test.com")
        expect(response.body.data.group.members[4].email).toEqual("administrator@test.com")
        expect(response.body.data.group.members[3].email).toEqual("federico@email.com")
        expect(response.body.data.membersNotFound).toHaveLength(0)
        expect(response.body.data.alreadyInGroup).toHaveLength(0)
        done() // Notify Jest that the test is complete
      })
      .catch((err) => done(err))
  })
})

test("[ADMIN](status: 200) should retrieve group of given user not in it", (done) => {
  
  
  Group.create({
    name: "testgroup",
    members: members}
  ).then((gr) => {
    request(app)
      .patch("/api/groups/"+gr.name+"/insert")
      .set("Cookie", `accessToken=${exampleAdminAccToken};refreshToken=${exampleAdminRefToken}`)
      .send({emails: ["federico@email.com","administrator@test.com"]})
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
        expect(response.body.data).toHaveProperty("group")
        expect(response.body.data.group.name).toEqual("testgroup")
        expect(response.body.data.group.members).toBeInstanceOf(Array)
        expect(response.body.data.group.members[0].email).toEqual("luigi.red@email.com")
        expect(response.body.data.group.members[1].email).toEqual("mario.red@email.com")
        expect(response.body.data.group.members[2].email).toEqual("test@test.com")
        expect(response.body.data.group.members[4].email).toEqual("administrator@test.com")
        expect(response.body.data.group.members[3].email).toEqual("federico@email.com")
        expect(response.body.data.membersNotFound).toHaveLength(0)
        expect(response.body.data.alreadyInGroup).toHaveLength(0)
        done() // Notify Jest that the test is complete
      })
      .catch((err) => done(err))
  })
})

test("[REGULAR](status: 400) the request body does not contain all the necessary attributes", (done) => {
  
  
  Group.create({
    name: "testgroup",
    members: members}
  ).then((gr) => {
    request(app)
      .patch("/api/groups/"+gr.name+"/add")
      .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
      .send({})
      .then((response) => {
       
        expect(response.status).toBe(400)
        
        expect(response.body).toHaveProperty("error")

        
        done() // Notify Jest that the test is complete
      })
      .catch((err) => done(err))
  })
})



test("[REGULAR](status: 400) the request body does not contain all the necessary attributes", (done) => {
  
  
  Group.create({
    name: "testgroup",
    members: members}
  ).then((gr) => {
    request(app)
      .patch("/api/groups/"+gr.name+"/add")
      .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
      .send({})
      .then((response) => {
      
        expect(response.status).toBe(400)
        
        expect(response.body).toHaveProperty("error")

        
        done() // Notify Jest that the test is complete
      })
      .catch((err) => done(err))
  })
})

test("[REGULAR](status: 400) the group name passed as a route parameter does not represent a group in the database", (done) => {
  
  
  Group.create({
    name: "testgroup",
    members: members}
  ).then((gr) => {
    request(app)
      .patch("/api/groups/groupNotExist/add")
      .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
      .send({emails: ["ivano@email.com"]})
      .then((response) => {
        
        expect(response.status).toBe(400)
        
        expect(response.body).toHaveProperty("error")

        
        done() // Notify Jest that the test is complete
      })
      .catch((err) => done(err))
  })
})

test("[REGULAR](status: 400) all the provided emails represent users that are already in a group ", (done) => {
  
  
  Group.create({
    name: "testgroup",
    members: members}
  ).then((gr) => {
    request(app)
      .patch("/api/groups/testgroup/add")
      .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
      .send({emails: ["tester@email.com","luigi.red@email.com"]})
      .then((response) => {
       
        expect(response.status).toBe(400)
        
        expect(response.body).toHaveProperty("error")

        
        done() // Notify Jest that the test is complete
      })
      .catch((err) => done(err))
  })
})

test("[REGULAR](status: 400) all the provided emails represent users do not exist in the database ", (done) => {
  
  
  Group.create({
    name: "testgroup",
    members: members}
  ).then((gr) => {
    request(app)
      .patch("/api/groups/testgroup/add")
      .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
      .send({emails: ["giorgio.red@email.com","gianluca.red@email.com","stefania.red@email.com"]})
      .then((response) => {
    
        expect(response.status).toBe(400)
        
        expect(response.body).toHaveProperty("error")

        
        done() // Notify Jest that the test is complete
      })
      .catch((err) => done(err))
  })
})

test("[REGULAR](status: 400) at least one of the member emails is not in a valid email format ", (done) => {
  
  
  Group.create({
    name: "testgroup",
    members: members}
  ).then((gr) => {
    request(app)
      .patch("/api/groups/testgroup/add")
      .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
      .send({emails: ["gianluca.red","tester@alone.com"]})
      .then((response) => {
  
        expect(response.status).toBe(400)
        
        expect(response.body).toHaveProperty("error")

        
        done() // Notify Jest that the test is complete
      })
      .catch((err) => done(err))
  })
})

test("[REGULAR](status: 400) at least one of the member emails is an empty string ", (done) => {
  
  
  Group.create({
    name: "testgroup",
    members: members}
  ).then((gr) => {
    request(app)
      .patch("/api/groups/testgroup/add")
      .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
      .send({emails: ["","tester@alone.com"]})
      .then((response) => {
        
        expect(response.status).toBe(400)
        
        expect(response.body).toHaveProperty("error")

        
        done() // Notify Jest that the test is complete
      })
      .catch((err) => done(err))
  })
})
test("[REGULAR](status: 401) called by an authenticated user who is not part of the group (authType = Group)", (done) => {
  
  const exampleNewUserRefToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9uZVRlc3RAdGVzdC5jb20iLCJpZCI6IjY0N2Q4NDc1NjJlMmVmODk1MzdlY2MzOCIsInVzZXJuYW1lIjoib25lVGVzdCIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1OTQ3NTIyLCJleHAiOjE2ODY1NTIzMjJ9.0dD5GNJNUjAQn9oidvLs1DWOmiGZQ-r5eMy5NoWHoqY"
  const exampleNewUserAccToken = exampleNewUserRefToken
  Group.create({
    name: "testgroup",
    members: members}
  ).then((gr) => {
    request(app)
      .patch("/api/groups/testgroup/add")
      .set("Cookie", `accessToken=${exampleNewUserAccToken};refreshToken=${exampleNewUserRefToken}`)
      .send({emails: ["tester@alone.com"]})
      .then((response) => {
        
        expect(response.status).toBe(401)
      
        expect(response.body).toHaveProperty("error")
        done() // Notify Jest that the test is complete
      })
      .catch((err) => done(err))
  })
})

test("[REGULAR](status: 401) called by an authenticated user who is not part of the group (authType = Admin)", (done) => {
  
  
  Group.create({
    name: "testgroup",
    members: members}
  ).then((gr) => {
    request(app)
      .patch("/api/groups/testgroup/insert")
      .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
      .send({emails: ["tester@alone.com"]})
      .then((response) => {
        
        expect(response.status).toBe(401)
      
        expect(response.body).toHaveProperty("error")
        done() // Notify Jest that the test is complete
      })
      .catch((err) => done(err))
  })
})






})

describe("removeFromGroup", () => {
  let members = []
  let oneMember = []
  beforeEach(async () => {
    members = []
    oneMember = []
    await User.deleteMany({})
    await Group.deleteMany({})
    await User.create([{username: "Luigi", email: "luigi.red@email.com", password: "luigi_password", role: "Regular"},{username: "Mario", email: "mario.red@email.com", password: "mario_password", role: "Regular"},
    {
      username: "tester",
      email: "test@test.com",
      password: "tester",
      role: "Regular"
    },
    
    {
      username: "testerAlone",
      email: "tester@alone.com",
      password: "tester_alone",
      role: "Regular"
      
    },
    {
      username: "federico",
      email: "federico@email.com",
      password: "federico_pass",
      role: "Regular"
      
    },
    {  
      username: "administratortest",
      password: "administratorpassword",
      email: "administrator@test.com", 
      role: "Admin"
    }
  ])
  
    const member_emails  = ["luigi.red@email.com","mario.red@email.com", "test@test.com"]
    

    for (const e of member_emails){
      const user = await User.findOne({email: e}).then((user) => user._id )
      members.push({email: e, user: user})
    }

    
    const oneUser = await User.findOne({email: "tester@alone.com"}).then((user) => user._id )
    oneMember.push({email: "test@test.com", user: oneUser})
    

  
    
    
  })
  
  afterEach(async () => {
    await Group.findOne({name: "testgroup"}).then((group) => {
      const e = group.members
      let poisoned = e.map((el) => el.email).includes("test@test.com");
      expect(poisoned).toBe(true)    
      
    })
  
    
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
  
  test("[REGULAR](status: 200) should retrieve group of given user in it", (done) => {
    
    
    Group.create({
      name: "testgroup",
      members: members}
    ).then((gr) => {
      request(app)
        .patch("/api/groups/"+gr.name+"/remove")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .send({emails: ["luigi.red@email.com","mario.red@email.com"]})
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
          expect(response.body.data).toHaveProperty("group")
          expect(response.body.data.group.name).toEqual("testgroup")
          expect(response.body.data.group.members).toBeInstanceOf(Array)
          expect(response.body.data.group.members[0].email).toEqual("test@test.com")
          expect(response.body.data.group.members).toHaveLength(1)
          expect(response.body.data.membersNotFound).toHaveLength(0)
          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
  
  test("[ADMIN](status: 200) should retrieve group of given user not in it", (done) => {
    
    
    Group.create({
      name: "testgroup",
      members: members}
    ).then((gr) => {
      request(app)
        .patch("/api/groups/"+gr.name+"/pull")
        .set("Cookie", `accessToken=${exampleAdminAccToken};refreshToken=${exampleAdminRefToken}`)
        .send({emails: ["luigi.red@email.com","mario.red@email.com"]})
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
          expect(response.body.data).toHaveProperty("group")
          expect(response.body.data.group.name).toEqual("testgroup")
          expect(response.body.data.group.members).toBeInstanceOf(Array)
          expect(response.body.data.group.members[0].email).toEqual("test@test.com")
          expect(response.body.data.group.members).toHaveLength(1)
          expect(response.body.data.membersNotFound).toHaveLength(0)
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
 
  
  test("[REGULAR](status: 400) the request body does not contain all the necessary attributes", (done) => {
    
    
    Group.create({
      name: "testgroup",
      members: members}
    ).then((gr) => {
      request(app)
        .patch("/api/groups/"+gr.name+"/remove")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .send({})
        .then((response) => {
        
          expect(response.status).toBe(400)
          
          expect(response.body).toHaveProperty("error")
  
          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
  
  test("[REGULAR](status: 400) the group name passed as a route parameter does not represent a group in the database", (done) => {
    
    
    Group.create({
      name: "testgroup",
      members: members}
    ).then((gr) => {
      request(app)
        .patch("/api/groups/groupNotExist/remove")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .send({})
        .then((response) => {
          
          expect(response.status).toBe(400)
          
          expect(response.body).toHaveProperty("error")
  
          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
  
  test("[REGULAR](status: 400) all the provided emails represent users that do not belong to the group", (done) => {
    
    
    Group.create({
      name: "testgroup",
      members: members}
    ).then((gr) => {
      request(app)
        .patch("/api/groups/testgroup/remove")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .send({emails: ["federico@email.com"]})
        .then((response) => {
          expect(response.status).toBe(400)
          
          expect(response.body).toHaveProperty("error")
  
          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
  
  test("[REGULAR](status: 400) all the provided emails represent users do not exist in the database ", (done) => {
    
    
    Group.create({
      name: "testgroup",
      members: members}
    ).then((gr) => {
      request(app)
        .patch("/api/groups/testgroup/remove")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .send({emails: ["giorgio.green@email.com","gianluca.green@email.com","stefania.green@email.com"]})
        .then((response) => {
      
          expect(response.status).toBe(400)
          
          expect(response.body).toHaveProperty("error")
  
          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
  
  test("[REGULAR](status: 400) at least one of the member emails is not in a valid email format ", (done) => {
    
    
    Group.create({
      name: "testgroup",
      members: members}
    ).then((gr) => {
      request(app)
        .patch("/api/groups/testgroup/remove")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .send({emails: ["gianluca.red","tester@test.com"]})
        .then((response) => {
    
          expect(response.status).toBe(400)
          
          expect(response.body).toHaveProperty("error")
  
          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
  
  test("[REGULAR](status: 400) at least one of the member emails is an empty string", (done) => {
    
    
    Group.create({
      name: "testgroup",
      members: members}
    ).then((gr) => {
      request(app)
        .patch("/api/groups/testgroup/remove")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .send({emails: ["","tester@test.com"]})
        .then((response) => {
          
          expect(response.status).toBe(400)
          
          expect(response.body).toHaveProperty("error")
  
          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })


  test("[REGULAR](status: 400) if the group contains only one member before deleting any user", (done) => {
    
    
    Group.create({
      name: "testgroup",
      members: oneMember}
    ).then((gr) => {
      request(app)
        .patch("/api/groups/testgroup/remove")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .send({emails: ["test@test.com"]})
        .then((response) => {
          
          expect(response.status).toBe(400)
          
          expect(response.body).toHaveProperty("error")
  
          
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

  test("(status: 401) called by an authenticated user who is not part of the group (authType = Group)", (done) => {
    
    const exampleNewUserRefToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9uZVRlc3RAdGVzdC5jb20iLCJpZCI6IjY0N2Q4NDc1NjJlMmVmODk1MzdlY2MzOCIsInVzZXJuYW1lIjoib25lVGVzdCIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1OTQ3NTIyLCJleHAiOjE2ODY1NTIzMjJ9.0dD5GNJNUjAQn9oidvLs1DWOmiGZQ-r5eMy5NoWHoqY"
    const exampleNewUserAccToken = exampleNewUserRefToken
    Group.create({
      name: "testgroup",
      members: members}
    ).then((gr) => {
      request(app)
        .patch("/api/groups/testgroup/remove")
        .set("Cookie", `accessToken=${exampleNewUserAccToken};refreshToken=${exampleNewUserRefToken}`)
        .send({emails: ["test@test.com"]})
        .then((response) => {
          
          expect(response.status).toBe(401)
        
          expect(response.body).toHaveProperty("error")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })

  test("(status: 401) called by an authenticated user who is not part of the group (authType = Admin)", (done) => {
    
    
    Group.create({
      name: "testgroup",
      members: members}
    ).then((gr) => {
      request(app)
        .patch("/api/groups/testgroup/pull")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`)
        .send({emails: ["test@test.com"]})
        .then((response) => {
          
          expect(response.status).toBe(401)
        
          expect(response.body).toHaveProperty("error")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  })
  
  
  
  
  
  
  })

  describe("deleteUser", () => { 

    test("(status 200) should delete one user (no transaction, no group) ", async () => {
            
      await User.create(
        {
          username: "luigi", 
          email: "luigi.red@email.com", 
          password: "pass123",
          role: "Regular"
        }
      );
  
      const response = await request(app)
                        .delete("/api/users")
                        .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                        .send({email: "luigi.red@email.com"});
                      
        
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("deletedTransactions");
      expect(response.body.data).toHaveProperty("deletedFromGroup");
      expect(response.body.data.deletedTransactions).toBe(0);
      expect(response.body.data.deletedFromGroup).toBe(false);
  
    })

    test("(status 200) should delete one user and group", async () => {
      await User.create(
        {
          username: "luigi", 
          email: "luigi.red@email.com", 
          password: "pass123",
          role: "Regular"
        }
      );
  
      await Group.create({
        name: "Group1",
        members: [{email: "luigi.red@email.com"}]
      });
  
      const response = await request(app)
                        .delete("/api/users")
                        .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                        .send({email: "luigi.red@email.com"});
                        
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("deletedTransactions");
      expect(response.body.data).toHaveProperty("deletedFromGroup");
      expect(response.body.data.deletedTransactions).toBe(0);
      expect(response.body.data.deletedFromGroup).toBe(true);
      const group = await Group.findOne({name: "Group1"});
      expect(group).toBe(null);

  
    })

    test("(status 200) should delete one user with one transaction", async () => {
      await User.create(
        {
          username: "luigi", 
          email: "luigi.red@email.com", 
          password: "pass123",
          role: "Regular"
        }
      );
      await transactions.create(
        {
          date: new Date("2021-04-20T00:00:00.000Z"),
          type: "expense",
          username: "luigi",
          amount: 10}); 
  
        
      const response = await request(app)
                        .delete("/api/users")
                        .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                        .send({email: "luigi.red@email.com"});
                        
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("deletedTransactions");
      expect(response.body.data).toHaveProperty("deletedFromGroup");
      expect(response.body.data.deletedTransactions).toBe(1);
      expect(response.body.data.deletedFromGroup).toBe(false);
      const group = await transactions.findOne({username: "luigi"});
      expect(group).toBe(null);     
    })
  
    test("should return status 400 for a call with wrong body property", async () => {
                    
      await User.create(
        {
          username: "luigi", 
          email: "luigi.red@email.com", 
          password: "pass123",
          role: "Regular"
        }
      );
      
        
      const response = await request(app)
                        .delete("/api/users")
                        .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                        .send({}); 
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    })
    
    test("Returns a 400 error if the email passed in the request body is an empty string", async () => {
                    
      await User.create(
        {
          username: "luigi", 
          email: "luigi.red@email.com", 
          password: "pass123",
          role: "Regular"
        }
      );
      
        
      const response = await request(app)
                        .delete("/api/users")
                        .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                        .send({email: " "}); 
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    })

    test("Returns a 400 error if the email passed in the request body is not in correct email format", async () => {
                    
      await User.create(
        {
          username: "luigi", 
          email: "luigi.red@email.com", 
          password: "pass123",
          role: "Regular"
        }
      );
      
        
      const response = await request(app)
                        .delete("/api/users")
                        .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                        .send({email: "luigi.red"}); 
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    })

    test("Returns a 400 error if the email passed in the request body does not represent a user in the database", async () => {
                    
      await User.create(
        {
          username: "luigi", 
          email: "luigi.red@email.com", 
          password: "pass123",
          role: "Regular"
        }
      );
      
        
      const response = await request(app)
                        .delete("/api/users")
                        .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                        .send({email: "alfonso.red@email.com"}); 
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    })

    test("Returns a 400 error if the email passed in the request body does not represent a user in the database", async () => {
                    
      await User.create(
        {
          username: "luigi", 
          email: "luigi.red@email.com", 
          password: "pass123",
          role: "Regular"
        }
      );
      
        
      const response = await request(app)
                        .delete("/api/users")
                        .set("Cookie", `accessToken=${exampleUserAccToken}; refreshToken=${exampleUserRefToken}`) //Setting cookies in the request
                        .send({email: "alfonso.red@email.com"}); 
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    })
    
  })

describe("deleteGroup", () => { 

  test("should return status 200 for a sequence of deletion", async () => {
    await Group.create(
      {
        name: "Family",
        members: [{email: "tester3@test.com"}, {email: "tester2@email.com"}]
      }
    );

    await Group.create({
      name: "Fun",
      members: [{email: "tester4@test.com"}, {email: "tester5@email.com"}]
    });

    const response = await request(app)
                      .delete("/api/groups")
                      .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                      .send({name: "Family"});
                    
      
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("message");

    const response2 = await request(app)
                      .delete("/api/groups")
                      .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                      .send({name: "Fun"});
                    
      
    expect(response2.status).toBe(200);
    expect(response2.body.data).toHaveProperty("message");

  })

  test("should return status 400 for a call with wrong body property", async () => {
    await Group.create(
      {
        name: "Family",
        members: [{email: "tester3@test.com"}, {email: "tester2@email.com"}]
      }
    );

    await Group.create({
      name: "Fun",
      members: [{email: "tester4@test.com"}, {email: "tester5@email.com"}]
    });

    const response = await request(app)
                      .delete("/api/groups")
                      .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                      .send({other: "Family"});
                    
      
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  })

  test("should return status 400 for a call with empty stirng body(with spaces)", async () => {
    await Group.create(
      {
        name: "Family",
        members: [{email: "tester3@test.com"}, {email: "tester2@email.com"}]
      }
    );

    await Group.create({
      name: "Fun",
      members: [{email: "tester4@test.com"}, {email: "tester5@email.com"}]
    });

    const response = await request(app)
                      .delete("/api/groups")
                      .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                      .send({name: "    "});
                    
      
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  })

  test("should return status 400 for a call with body that does not represent a group in db", async () => {
    await Group.create(
      {
        name: "Family",
        members: [{email: "tester3@test.com"}, {email: "tester2@email.com"}]
      }
    );

    await Group.create({
      name: "Fun",
      members: [{email: "tester4@test.com"}, {email: "tester5@email.com"}]
    });

    const response = await request(app)
                      .delete("/api/groups")
                      .set("Cookie", `accessToken=${exampleAdminAccToken}; refreshToken=${exampleAdminRefToken}`) //Setting cookies in the request
                      .send({name: "NotInDB"});
                    
      
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  })

  test("should return status 401 for non admin call", async () => {
    await Group.create(
      {
        name: "Family",
        members: [{email: "tester3@test.com"}, {email: "tester2@email.com"}]
      }
    );

    await Group.create({
      name: "Fun",
      members: [{email: "tester4@test.com"}, {email: "tester5@email.com"}]
    });

    const response = await request(app)
                      .delete("/api/groups")
                      .set("Cookie", `accessToken=${exampleUserAccToken}; refreshToken=${exampleUserRefToken}`) //Setting cookies in the request
                      .send({name: "Family"});
                    
      
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
  })
})
