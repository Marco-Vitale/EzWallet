import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

let hashedPassword; 
const ACCESS_KEY = process.env.ACCESS_KEY;
beforeAll(async () => {
    const dbName = "testingDatabaseAuth";
    const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  hashedPassword = await bcrypt.hash("tester_pass", 12); 

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
  
  

  test("[REGULAR](status: 200) should login regular user", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password:  hashedPassword,
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

          const decodedAccessToken = jwt.verify(response.body.data.accessToken, ACCESS_KEY);

          expect(decodedAccessToken.username).toEqual("tester")
          expect(decodedAccessToken.email).toEqual("test@test.com")
          expect(decodedAccessToken.role).toEqual("Regular")

          const decodedRefreshToken = jwt.verify(response.body.data.refreshToken, ACCESS_KEY);

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
  const exampleUserRefToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjY0NzhhNTg2MzdlZmM0YWZmMmVlNWVlMyIsInVzZXJuYW1lIjoidGVzdGVyIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU2MjgyOTksImV4cCI6MTY4NjIzMzA5OX0.WVpquYNQ9w1WwzP395o57d8-GNqcNJoU6lVawB4N5m8";
  const exampleUserAccToken= exampleUserRefToken;
  test.skip("(status: 200) logout", (done) => {

    User.create({
      username: "tester",
      email: "test@test.com",
      password: hashedPassword,
      role: "Regular",
      
    }).then((currUser) => {
      request(app)
        .get("/api/logout")
        .set("Cookie", `accessToken=${exampleUserAccToken};refreshToken=${exampleUserRefToken}`) 
        .then((response) => {
          expect(response.status).toBe(200)
          expect(response.body).toHaveProperty("message")
          expect(response.body.message).toEqual("User logged out")
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  }) 

  test.skip("(status: 400) does not have refresh token", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester_pass",
      role: "Regular",
      
    }).then((currUser) => {
      request(app)
        .get("/api/logout")
        .set("Cookie", `accessToken=${exampleAdminAccToken}`) 
        .then((response) => {
          console.log(response.body)
          expect(response.status).toBe(400)
          expect(response.body).toHaveProperty("error")
         
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  }) 

  test.skip("(status: 400) the refresh token doesn't rappresent user in database", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester_pass",
      role: "Regular",
      
    }).then((currUser) => {
      request(app)
        .post("/api/logout")
        .set("Cookie", `accessToken=${exampleAdminAccToken}`) 
        .send({"email": "test@test.com", "password": "tester_pass"})
        .then((response) => {
          console.log(response.body)
          expect(response.status).toBe(400)
          expect(response.body).toHaveProperty("error")
         
          done() // Notify Jest that the test is complete
        })
        .catch((err) => done(err))
    })
  }) 
  
});
