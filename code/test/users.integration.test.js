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

  test("should return empty list if there are no users", (done) => {
    request(app)
      .get("/api/users")
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body).toHaveLength(0)
        done()
      })
      .catch((err) => done(err))
  })

  test("should retrieve list of all users", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
    }).then(() => {
      request(app)
        .get("/api/users")
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

describe("getUser", () => {
  test('Dummy test, change it', () => {
    expect(true).toBe(true);
  });
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

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

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
