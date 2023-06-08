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
    test("Should return 200 and update the category", async() => {
        await transactions.insertMany([
            {
                username: "user1",
                type: "category1",
                amount: 10
            },{
                username: "user1",
                type: "category1",
                amount: 2
            },{
                username: "user1",
                type: "category1",
                amount: 15
            }
        ])
        await categories.create({
            type: "category1",
            color: "red"
        })
        const response = await request(app)
            .patch("/api/categories/category1")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ type: "category2", color: "yellow" })
        
        expect(response.status).toBe(200)
        expect(response.body.data).toHaveProperty("message")
        expect(response.body.data).toHaveProperty("count", 3)
    });

    test("Should return status code 400: request body does not contain all the necessary attributes", async() => {
        await transactions.insertMany([
            {
                username: "user1",
                type: "category1",
                amount: 10
            },{
                username: "user1",
                type: "category1",
                amount: 2
            },{
                username: "user1",
                type: "category1",
                amount: 15
            }
        ])
        await categories.create({
            type: "category1",
            color: "red"
        })
        const response = await request(app)
            .patch("/api/categories/category1")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ color: "yellow" })
        
        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("Should return status code 400: at least one of the parameters in the request body is an empty string", async() => {
        await transactions.insertMany([
            {
                username: "user1",
                type: "category1",
                amount: 10
            },{
                username: "user1",
                type: "category1",
                amount: 2
            },{
                username: "user1",
                type: "category1",
                amount: 15
            }
        ])
        await categories.create({
            type: "category1",
            color: "red"
        })
        const response = await request(app)
            .patch("/api/categories/category1")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ type: "", color: "yellow" })
        
        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("Should return status code 400: the type of category passed as a route parameter does not represent a category in the database", async() => {
        await transactions.insertMany([
            {
                username: "user1",
                type: "category1",
                amount: 10
            },{
                username: "user1",
                type: "category1",
                amount: 2
            },{
                username: "user1",
                type: "category1",
                amount: 15
            }
        ])
        await categories.create({
            type: "category1",
            color: "red"
        })
        const response = await request(app)
            .patch("/api/categories/errCategory")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ type: "category1", color: "yellow" })
        
        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("Should return status code 400: the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one", async() => {
        await transactions.insertMany([
            {
                username: "user1",
                type: "category1",
                amount: 10
            },{
                username: "user1",
                type: "category1",
                amount: 2
            },{
                username: "user1",
                type: "category2",
                amount: 15
            }
        ])
        await categories.insertMany([
            {
                type: "category1",
                color: "red"
            },{
                type: "category2",
                color: "green"
            }
        ])
        const response = await request(app)
            .patch("/api/categories/category1")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ type: "category2", color: "yellow" })
        
        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("Should return status code 401: called by an authenticated user who is not an admin (authType = Admin)", async() => {
        await transactions.insertMany([
            {
                username: "user1",
                type: "category1",
                amount: 10
            },{
                username: "user1",
                type: "category1",
                amount: 2
            },{
                username: "user1",
                type: "category1",
                amount: 15
            }
        ])
        await categories.insertMany([
            {
                type: "category1",
                color: "red"
            },{
                type: "category2",
                color: "green"
            }
        ])
        const response = await request(app)
            .patch("/api/categories/category1")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
            .send({ type: "category3", color: "yellow" })
        
        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });
});

describe("deleteCategory", () => { 
    test("Should return 200 and delete the category", async() => {
        await transactions.insertMany([
            { username: "user1", type: "category1", amount: 10 },
            { username: "user1", type: "category1", amount: 2 },
            { username: "user1", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        const response = await request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ types: ["category1", "category2"] })
        
        expect(response.status).toBe(200)
        expect(response.body.data).toHaveProperty("message")
        expect(response.body.data).toHaveProperty("count", 3)
    });

    test("Should return 200 and delete all the categories mantaining the oldest one", async() => {
        await transactions.insertMany([
            { username: "user1", type: "category2", amount: 10 },
            { username: "user1", type: "category2", amount: 2 },
            { username: "user1", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        const response = await request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ types: ["category1", "category2", "category3", "category4", "category5"] })
        
        expect(response.status).toBe(200)
        expect(response.body.data).toHaveProperty("message")
        expect(response.body.data).toHaveProperty("count", 2)
    });

    test("Should return status code 400: the request body does not contain all the necessary attributes", async() => {
        await transactions.insertMany([
            { username: "user1", type: "category1", amount: 10 },
            { username: "user1", type: "category1", amount: 2 },
            { username: "user1", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        const response = await request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ errLabel: ["category1", "category2"] })
        
        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("Should return status code 400: there is only one category in the database", async() => {
        await transactions.insertMany([
            { username: "user1", type: "category1", amount: 10 },
            { username: "user1", type: "category1", amount: 2 },
            { username: "user1", type: "category1", amount: 15 },
        ])
        await categories.create(
            {type: "lastCategory", color: "red"}
        )
        const response = await request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ types: ["category1", "category2", "lastCategory"] })
        
        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("Should return status code 400: at least one of the types in the array is an empty string", async() => {
        await transactions.insertMany([
            { username: "user1", type: "category1", amount: 10 },
            { username: "user1", type: "category1", amount: 2 },
            { username: "user1", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        const response = await request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ types: ["category1", ""] })
        
        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("Should return status code 400: the array passed in the request body is empty", async() => {
        await transactions.insertMany([
            { username: "user1", type: "category1", amount: 10 },
            { username: "user1", type: "category1", amount: 2 },
            { username: "user1", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        const response = await request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ types: [] })
        
        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("Should return status code 400: at least one of the types in the array does not represent a category in the database", async() => {
        await transactions.insertMany([
            { username: "user1", type: "category1", amount: 10 },
            { username: "user1", type: "category1", amount: 2 },
            { username: "user1", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        const response = await request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
            .send({ types: ["category1", "category2", "category99"] })
        
        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("Should return status code 401: called by an authenticated user who is not an admin (authType = Admin)", async() => {
        await transactions.insertMany([
            { username: "user1", type: "category1", amount: 10 },
            { username: "user1", type: "category1", amount: 2 },
            { username: "user1", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        const response = await request(app)
            .delete("/api/categories")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
            .send({ types: ["category1", "category2"] })
        
        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });
})

describe("getCategories", () => { 
    test('status 200 and correct retrieved categories', async () => {
        await categories.insertMany([
            {
                type: "fun",
                color: "Red"
            },
            {
                type: "family",
                color: "Green"
            },
            {
                type: "investment",
                color: "grey"
            },
            {
                type: "food",
                color: "yellow"
            }
        ]);

        const response = await request(app)
                      .get("/api/categories")
                      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([
            {
                type: "fun",
                color: "Red"
            },
            {
                type: "family",
                color: "Green"
            },
            {
                type: "investment",
                color: "grey"
            },
            {
                type: "food",
                color: "yellow"
            }
        ]);
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
    test('status 200 and correct retrived trasnactions', async () => {

        await categories.create({
            type: "Fun",
            color: "Red"
        })
        await categories.create({
            type: "Family",
            color: "Green"
        })
        await transactions.insertMany([
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
                      .set("Cookie", `accessToken=${adminAccessTokenValid}; refreshToken=${adminAccessTokenValid}`); //Setting cookies in the request
                      
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

        await categories.create({
            type: "Fun",
            color: "Red"
        })
        await categories.create({
            type: "Family",
            color: "Green"
        })
        await transactions.insertMany([
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
        expect(response.body).not.toHaveProperty("data");
    });
});

describe("getTransactionsByUser", () => { 
    test("(admin) Should return 200 and the list of transactions related to the passed user", async() => {
        await transactions.insertMany([
            { username: "tester", type: "category1", amount: 10 },
            { username: "tester", type: "category1", amount: 2 },
            { username: "tester", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        await User.insertMany([
            {username: "tester", email: "tester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "admin", email: "admin@email.com", password: "admin", role: "Admin", refreshToken: adminAccessTokenValid},
        ])
        const response = await request(app)
            .get("/api/transactions/users/tester")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        
        expect(response.status).toBe(200)
        expect(response.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response.body.data.length).toBe(3)
    });

    test("(user) Should return 200 and the list of transactions related to the passed user", async() => {
        await transactions.insertMany([
            { username: "tester", type: "category1", amount: 10 },
            { username: "tester", type: "category1", amount: 2 },
            { username: "tester", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        await User.insertMany([
            {username: "tester", email: "tester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "admin", email: "admin@email.com", password: "admin", role: "Admin", refreshToken: adminAccessTokenValid},
        ])
        const response = await request(app)
            .get("/api/users/tester/transactions")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        
        expect(response.status).toBe(200)
        expect(response.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response.body.data.length).toBe(3)
    });

    test("Should return 400: the username passed as a route parameter does not represent a user in the database", async() => {
        await transactions.insertMany([
            { username: "tester", type: "category1", amount: 10 },
            { username: "tester", type: "category1", amount: 2 },
            { username: "tester", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        await User.insertMany([
            {username: "tester", email: "tester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "admin", email: "admin@email.com", password: "admin", role: "Admin", refreshToken: adminAccessTokenValid},
        ])
        const response = await request(app)
            .get("/api/transactions/users/notPresentUser")
            .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        
        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("Should return 401: called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions`", async() => {
        await transactions.insertMany([
            { username: "tester", type: "category1", amount: 10 },
            { username: "tester", type: "category1", amount: 2 },
            { username: "tester", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        await User.insertMany([
            {username: "tester", email: "tester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "otherTester", email: "otherTester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "admin", email: "admin@email.com", password: "admin", role: "Admin", refreshToken: adminAccessTokenValid},
        ])
        const response = await request(app)
            .get("/api/users/otherTester/transactions")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        
        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("Should return 401: called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username`", async() => {
        await transactions.insertMany([
            { username: "tester", type: "category1", amount: 10 },
            { username: "tester", type: "category1", amount: 2 },
            { username: "tester", type: "category1", amount: 15 },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        await User.insertMany([
            {username: "tester", email: "tester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "otherTester", email: "otherTester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "admin", email: "admin@email.com", password: "admin", role: "Admin", refreshToken: adminAccessTokenValid},
        ])
        const response = await request(app)
            .get("/api/transactions/users/tester")
            .set("Cookie", `accessToken=${testerAccessTokenEmpty};refreshToken=${testerAccessTokenEmpty}`)
        
        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test("(user) Should return 200 and the list of transactions related to the passed user with date filters", async() => {
        await transactions.insertMany([
            { username: "tester", type: "category1", amount: 10, date: "2023-01-10T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 2, date: "2023-01-10T11:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-01-12T10:00:00.000Z" },
            { username: "tester", type: "category3", amount: 15, date: "2023-01-12T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-02-15T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-05-15T10:00:00.000Z" },
            { username: "otherTester", type: "category1", amount: 50, date: "2023-05-15T10:00:00.000Z" },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        await User.insertMany([
            {username: "tester", email: "tester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "tester2", email: "tester2@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "admin", email: "admin@email.com", password: "admin", role: "Admin", refreshToken: adminAccessTokenValid},
        ])
        const response1 = await request(app)
            .get("/api/users/tester/transactions?date=2023-01-10")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        const response2 = await request(app)
            .get("/api/users/tester/transactions?from=2023-01-12")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        
        const response3 = await request(app)
            .get("/api/users/tester/transactions?upTo=2023-01-12")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        
        const response4 = await request(app)
            .get("/api/users/tester/transactions?from=2023-01-12&upTo=2023-02-15")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
                
        expect(response1.status).toBe(200)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response1.body.data.length).toBe(2)

        expect(response2.status).toBe(200)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response2.body.data.length).toBe(4)

        expect(response3.status).toBe(200)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response3.body.data.length).toBe(4)

        expect(response4.status).toBe(200)
        expect(response4.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response4.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response4.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response4.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response4.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response4.body.data.length).toBe(3)
    });

    test("(user) Should return 200 and the list of transactions related to the passed user with amount filters", async() => {
        await transactions.insertMany([
            { username: "tester", type: "category1", amount: 10, date: "2023-01-10T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 2, date: "2023-01-10T11:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-01-12T10:00:00.000Z" },
            { username: "tester", type: "category3", amount: 15, date: "2023-01-12T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-02-15T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-05-15T10:00:00.000Z" },
            { username: "otherTester", type: "category1", amount: 50, date: "2023-05-15T10:00:00.000Z" },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        await User.insertMany([
            {username: "tester", email: "tester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "tester2", email: "tester2@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "admin", email: "admin@email.com", password: "admin", role: "Admin", refreshToken: adminAccessTokenValid},
        ])
        const response1 = await request(app)
            .get("/api/users/tester/transactions?min=15")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        const response2 = await request(app)
            .get("/api/users/tester/transactions?max=10")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        
        const response3 = await request(app)
            .get("/api/users/tester/transactions?min=8&max=17")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
                
        expect(response1.status).toBe(200)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response1.body.data.length).toBe(4)

        expect(response2.status).toBe(200)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response2.body.data.length).toBe(2)

        expect(response3.status).toBe(200)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response3.body.data.length).toBe(5)
    });

    test("(user) Should return 200 and the list of transactions related to the passed user with date and amount filters", async() => {
        await transactions.insertMany([
            { username: "tester", type: "category1", amount: 10, date: "2023-01-10T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 2, date: "2023-01-10T11:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-01-12T10:00:00.000Z" },
            { username: "tester", type: "category3", amount: 15, date: "2023-01-12T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-02-15T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-05-15T10:00:00.000Z" },
            { username: "otherTester", type: "category1", amount: 50, date: "2023-05-15T10:00:00.000Z" },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        await User.insertMany([
            {username: "tester", email: "tester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "tester2", email: "tester2@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "admin", email: "admin@email.com", password: "admin", role: "Admin", refreshToken: adminAccessTokenValid},
        ])
        const response1 = await request(app)
            .get("/api/users/tester/transactions?date=2023-01-10&min=5&max=10")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        const response2 = await request(app)
            .get("/api/users/tester/transactions?from=2023-01-10&min=12")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        
        const response3 = await request(app)
            .get("/api/users/tester/transactions?upTo=2023-06-16&max=8")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        
        const response4 = await request(app)
            .get("/api/users/tester/transactions?from=2023-01-10&upTo=2023-02-15&max=5")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
                
        expect(response1.status).toBe(200)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response1.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response1.body.data.length).toBe(1)

        expect(response2.status).toBe(200)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response2.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response2.body.data.length).toBe(4)

        expect(response3.status).toBe(200)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response3.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response3.body.data.length).toBe(1)

        expect(response4.status).toBe(200)
        expect(response4.body.data.every( transaction => (transaction.hasOwnProperty("username")) ) ).toBe(true)
        expect(response4.body.data.every( transaction => (transaction.hasOwnProperty("amount")) ) ).toBe(true)
        expect(response4.body.data.every( transaction => (transaction.hasOwnProperty("type")) ) ).toBe(true)
        expect(response4.body.data.every( transaction => (transaction.hasOwnProperty("date")) ) ).toBe(true)
        expect(response4.body.data.every( transaction => (transaction.hasOwnProperty("color")) ) ).toBe(true)
        expect(response4.body.data.length).toBe(1)
    });

    test("(user) Should return an error if any of the date filters is not a string in date format", async() => {
        await transactions.insertMany([
            { username: "tester", type: "category1", amount: 10, date: "2023-01-10T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 2, date: "2023-01-10T11:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-01-12T10:00:00.000Z" },
            { username: "tester", type: "category3", amount: 15, date: "2023-01-12T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-02-15T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-05-15T10:00:00.000Z" },
            { username: "otherTester", type: "category1", amount: 50, date: "2023-05-15T10:00:00.000Z" },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        await User.insertMany([
            {username: "tester", email: "tester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "tester2", email: "tester2@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "admin", email: "admin@email.com", password: "admin", role: "Admin", refreshToken: adminAccessTokenValid},
        ])
        const response1 = await request(app)
            .get("/api/users/tester/transactions?date=2023/01/10")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        const response2 = await request(app)
            .get("/api/users/tester/transactions?from=2023;01;12")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        
        const response3 = await request(app)
            .get("/api/users/tester/transactions?upTo=2023/01-12")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        
        const response4 = await request(app)
            .get("/api/users/tester/transactions?from=20230112&upTo=2023-02-15")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
                
        expect(response1.status).toBe(500)
        expect(response2.status).toBe(500)
        expect(response3.status).toBe(500)
        expect(response4.status).toBe(500)
    });

    test("(user) Should return an error if both 'date' and 'from'/'upTo' are present", async() => {
        await transactions.insertMany([
            { username: "tester", type: "category1", amount: 10, date: "2023-01-10T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 2, date: "2023-01-10T11:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-01-12T10:00:00.000Z" },
            { username: "tester", type: "category3", amount: 15, date: "2023-01-12T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-02-15T10:00:00.000Z" },
            { username: "tester", type: "category1", amount: 15, date: "2023-05-15T10:00:00.000Z" },
            { username: "otherTester", type: "category1", amount: 50, date: "2023-05-15T10:00:00.000Z" },
        ])
        await categories.insertMany([
            {type: "category1", color: "red"}, 
            {type: "category2", color: "blue"}, 
            {type: "category3", color: "green"},
            {type: "category4", color: "purple"},
            {type: "category5", color: "yellow"}
        ])
        await User.insertMany([
            {username: "tester", email: "tester@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "tester2", email: "tester2@test.com", password: "tester", role: "Regular", refreshToken: testerAccessTokenValid},
            {username: "admin", email: "admin@email.com", password: "admin", role: "Admin", refreshToken: adminAccessTokenValid},
        ])
        
        const response1 = await request(app)
            .get("/api/users/tester/transactions?from=20230112&date=2023-02-15")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        
        const response2 = await request(app)
            .get("/api/users/tester/transactions?date=20230112&upTo=2023-02-15")
            .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
                
        expect(response1.status).toBe(500)
        expect(response2.status).toBe(500)
    });
})

describe("getTransactionsByUserByCategory", () => { 

    test('Should return status code 200 (admin route)', async () => {
        await categories.create({ type: "food", color: "red" })

        await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/transactions/users/admin/category/food")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)
    });

    test('Should return status code 200 (user route)', async () => {
        await categories.create({ type: "food", color: "red" })

        await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "tester",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/users/tester/transactions/category/food")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)
    });

    test('Should return status code 400, user not in the db (admin route)', async () => {
        await categories.create({ type: "food", color: "red" })

        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/transactions/users/admin/category/food")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, user not in the db (user route)', async () => {
        await categories.create({ type: "food", color: "red" })

        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "tester",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/users/tester/transactions/category/food")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, category not in the db (admin route)', async () => {
        await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/transactions/users/admin/category/food")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, category not in the db (user route)', async () => {
        await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "tester",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/users/tester/transactions/category/food")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 401, not admin user on admin route', async () => {
        await categories.create({ type: "food", color: "red" })

        await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/transactions/users/tester/category/food")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 401, user differs from one in the route', async () => {
        await categories.create({ type: "food", color: "red" })

        await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        await User.create({username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/users/tester2/transactions/category/food")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });
})

describe("getTransactionsByGroup", () => { 

    test('Should return status code 200 (admin route)', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })
        await Group.create({
            name: "Family",
            members: [
                {
                    email: "admin@email.com",
                    user: u1._id
                },
                {
                    email: "tester@test.com",
                    user: u2._id
                }
            ] 
        })
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/transactions/groups/Family")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(3)
    });

    test('Should return status code 200 (user route)', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })
        await Group.create({
            name: "Family",
            members: [
                {
                    email: "admin@email.com",
                    user: u1._id
                },
                {
                    email: "tester@test.com",
                    user: u2._id
                }
            ] 
        })
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/groups/Family/transactions")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(3)
    });

    test('Should return status code 400, group not in the db (admin route)', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })
        
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/transactions/groups/Family")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, group not in the db (user route)', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })
        
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/groups/Family/transactions")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 401, user not in the group', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        const u3 = await User.create({username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        await Group.create({
            name: "Family",
            members: [
                {
                    email: "admin@email.com",
                    user: u1._id
                },
                {
                    email: "tester2@test.com",
                    user: u3._id
                }
            ] 
        })
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/groups/Family/transactions")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 401, user is not an admin', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        await Group.create({
            name: "Family",
            members: [
                {
                    email: "admin@email.com",
                    user: u1._id
                },
                {
                    email: "tester@test.com",
                    user: u2._id
                }
            ] 
        })
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/transactions/groups/Family")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

})

describe("getTransactionsByGroupByCategory", () => { 

    test('Should return status code 200 (admin route)', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })
        await Group.create({
            name: "Family",
            members: [
                {
                    email: "admin@email.com",
                    user: u1._id
                },
                {
                    email: "tester@test.com",
                    user: u2._id
                }
            ] 
        })
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/transactions/groups/Family/category/food")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)
    });

    test('Should return status code 200 (user route)', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })
        await Group.create({
            name: "Family",
            members: [
                {
                    email: "admin@email.com",
                    user: u1._id
                },
                {
                    email: "tester@test.com",
                    user: u2._id
                }
            ] 
        })
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/groups/Family/transactions/category/food")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(2)
    });

    test('Should return status code 400, group not in the db (admin route)', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })
        
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/transactions/groups/Family/category/food")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, group not in the db (user route)', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })
        
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/groups/Family/transactions/category/food")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, category not in the db (admin route)', async () => {
        
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })
        await Group.create({
            name: "Family",
            members: [
                {
                    email: "admin@email.com",
                    user: u1._id
                },
                {
                    email: "tester@test.com",
                    user: u2._id
                }
            ] 
        })
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/transactions/groups/Family/category/food")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, category not in the db (user route)', async () => {
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })
        await Group.create({
            name: "Family",
            members: [
                {
                    email: "admin@email.com",
                    user: u1._id
                },
                {
                    email: "tester@test.com",
                    user: u2._id
                }
            ] 
        })
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/groups/Family/transactions/category/food")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 401, user not in the group', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        const u3 = await User.create({username: "tester2",
        email: "tester2@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        await Group.create({
            name: "Family",
            members: [
                {
                    email: "admin@email.com",
                    user: u1._id
                },
                {
                    email: "tester2@test.com",
                    user: u3._id
                }
            ] 
        })
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/groups/Family/transactions/category/food")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 401, user is not an admin', async () => {
        await categories.create({ type: "food", color: "red" })
        await categories.create({ type: "entertainment", color: "blue" })

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        await Group.create({
            name: "Family",
            members: [
                {
                    email: "admin@email.com",
                    user: u1._id
                },
                {
                    email: "tester@test.com",
                    user: u2._id
                }
            ] 
        })
        await transactions.insertMany([{
            username: "tester",
            type: "food",
            amount: 20
        }, {
            username: "admin",
            type: "entertainment",
            amount: 100
        }, {
            username: "admin",
            type: "food",
            amount: 100
        }, {
            username: "admin2",
            type: "food",
            amount: 60
        }])

        const response = await request(app)
        .get("/api/transactions/groups/Family/category/food")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)

        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

})

describe("deleteTransaction", () => { 
    test('Should return status code 200', async () => {

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const t = await transactions.create({
        username: "admin",
        type: "food",
        amount: 20})

        const response = await request(app)
        .delete("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({_id: t._id})

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("data")
    });

    test('Should return status code 400, missing body parameters', async () => {

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const t = await transactions.create({
        username: "admin",
        type: "food",
        amount: 20})

        const response = await request(app)
        .delete("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, empty id', async () => {

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const t = await transactions.create({
        username: "admin",
        type: "food",
        amount: 20})

        const response = await request(app)
        .delete("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({_id:  "  "})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, user not in the db', async () => {

        const t = await transactions.create({
        username: "admin",
        type: "food",
        amount: 20})

        const response = await request(app)
        .delete("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({_id: t._id})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, transaction not in the db', async () => {

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const response = await request(app)
        .delete("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({_id: "647d8cd8ef939d0588908922"})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
        
    });

    test('Should return status code 400, transaction of a different user', async () => {

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const u2 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        const t = await transactions.create({
        username: "tester",
        type: "food",
        amount: 20})

        const response = await request(app)
        .delete("/api/users/admin/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({_id: t._id})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, user mismatch', async () => {

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const t = await transactions.create({
        username: "admin",
        type: "food",
        amount: 20})

        const response = await request(app)
        .delete("/api/users/tester/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({_id:  "  "})

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });
})


describe("deleteTransactions", () => { 
    test('Should return status code 200', async () => {

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const t = await transactions.create({
        username: "admin",
        type: "food",
        amount: 20})

        const t2 = await transactions.create({
            username: "tester",
            type: "food",
            amount: 20})

        const response = await request(app)
        .delete("/api/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({_ids: [t._id, t2._id]})

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("data")
    });

    test('Should return status code 400, missing body', async () => {

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const t = await transactions.create({
        username: "admin",
        type: "food",
        amount: 20})

        const t2 = await transactions.create({
            username: "tester",
            type: "food",
            amount: 20})

        const response = await request(app)
        .delete("/api/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)

        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, empty string in ids', async () => {

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const t = await transactions.create({
        username: "admin",
        type: "food",
        amount: 20})

        const t2 = await transactions.create({
            username: "tester",
            type: "food",
            amount: 20})

        const response = await request(app)
        .delete("/api/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({_ids: [t._id, t2._id, "   "]})


        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 400, transaction not in the db', async () => {

        const u1 = await User.create({username: "admin",
        email: "admin@email.com",
        password: "admin",
        refreshToken: adminAccessTokenValid,
        role: "Admin"})

        const t = await transactions.create({
        username: "admin",
        type: "food",
        amount: 20})

        const response = await request(app)
        .delete("/api/transactions")
        .set("Cookie", `accessToken=${adminAccessTokenValid};refreshToken=${adminAccessTokenValid}`)
        .send({_ids: [t._id, "647d8cd8ef939d0588908638"]})


        expect(response.status).toBe(400)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });

    test('Should return status code 401, user is not an admin', async () => {

        const u1 = await User.create({username: "tester",
        email: "tester@test.com",
        password: "tester",
        refreshToken: testerAccessTokenValid 
        })

        const t = await transactions.create({
        username: "admin",
        type: "food",
        amount: 20})

        const t2 = await transactions.create({
        username: "tester",
        type: "food",
        amount: 20})

        const response = await request(app)
        .delete("/api/transactions")
        .set("Cookie", `accessToken=${testerAccessTokenValid};refreshToken=${testerAccessTokenValid}`)
        .send({_ids: [t._id, t2._id]})


        expect(response.status).toBe(401)
        const errorMessage = response.body.error ? true : response.body.message ? true : false
        expect(errorMessage).toBe(true)
    });
})
