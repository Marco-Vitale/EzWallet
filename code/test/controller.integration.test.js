import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { categories, transactions } from '../models/model';
import { User, Group } from '../models/User';

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
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
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
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("createTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getAllTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

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
    });

    test.skip("(user) Should return 200 and the list of transactions related to the passed user", async() => { //TODO
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

    test.skip("(user) Should return 200 and the list of transactions related to the passed user", async() => { //TODO: handle amount and date
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
    });
})

describe("getTransactionsByUserByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroup", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("getTransactionsByGroupByCategory", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransaction", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

describe("deleteTransactions", () => { 
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
