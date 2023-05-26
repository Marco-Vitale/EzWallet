import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = (req, res) => {
    try {
        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }
        const { type, color } = req.body;
        const new_categories = new categories({ type, color });
        new_categories.save()
            .then(data => res.json(data))
            .catch(err => { throw err })
    } catch (error) {
        res.status(500).json({error: err.message})    
    }
}

/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 400 returned if the specified category does not exist
    - error 400 is returned if new parameters have invalid values
 */
export const updateCategory = async (req, res) => {
    try {
        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ message: "Unauthorized for access token" }); // unauthorized
        }
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (adminAuth.authorized) { 
            //Admin auth successful
            const oldType = req.params.type;
            const {newType, newColor} = req.body;
            const alreadyIn = await categories.findOne({$or: [ { "type" : newType }, { "color" : newColor } ] });
            if(newType === "" || newColor === "" || alreadyIn){
                return res.status(401).json({error: "Invalid input values"});
            }
            const exists = await categories.find({"type": oldType});
            if(!exists){
                return res.status(401).json({message: "Category does not exist"});
            }
            const query = {"type" : oldType};
            const update = {$set : {"type": newType, "color": newColor}};
            const writeResult1 = await categories.updateOne(query, update);
            const updateTransactions = {$set: {type: newType}};
            const writeResult2 = await transactions.updateMany(query, updateTransactions);
            res.status(200).json({message: "Update Done", count: writeResult2.modifiedCount})
        } else {
            res.status(401).json({ error: adminAuth.message})
        }

    } catch (error) {
        res.status(500).json({error: err.message})    
    }
}

/**
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 400 is returned if the specified category does not exist

  Additional requirements:
  - it can delete more than one category as it receives an array of types
  - it must return with an error if there is at least one type in the array that does not exist
  - at least one category must remain in the database after deletion (if there are three categories in the database and the method is called to delete all the categories, then the first category in the database cannot be deleted)
  - all the transactions that have a category that is deleted must have their category changed to the first category type rather than to the default category. Transactions with a category that does not exist are not fetched by the aggregate method, which performs a join operation.
 */
export const deleteCategory = async (req, res) => {
    try {
        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ message: "Unauthorized" }); // unauthorized
        }
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (adminAuth.authorized) { 
        //Admin auth successful
            const types = req.body
            const inDB = await categories.find({type: {$in: types}});
            if(types.length != inDB.length){
                return res.status(400).json({ message: "Category doesn't exist" });
            }
            const result = await categories.deleteMany({type: {$in: types}});
            const writeResult2 = await transactions.updateMany({type: {$in: types}}, {$set: {type: "investment"}});
            res.status(200).json({message: "Deletion successful", count: writeResult2.modifiedCount});
        } else {
            res.status(401).json({ error: adminAuth.message})
        }

    } catch (error) {
        res.status(500).json({error: err.message})   
    }
}

/**
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
    try {
        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }
        let data = await categories.find({})

        let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color }))

        return res.json(filter)
    } catch (error) {
        res.status(500).json({error: err.message})    
    }
}

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 400 is returned if the username or the type of category does not exist

  The createTransaction method receives a username in both its request body and as its request parameter: 
  - The two must be equal to allow the creation, in case they are different then the method must return a 400 error
 */
export const createTransaction = async (req, res) => {
    try {
        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }
        const { username, amount, type } = req.body;
        const new_transactions = new transactions({ username, amount, type });
        new_transactions.save()
            .then(data => res.json(data))
            .catch(err => { throw err })
    } catch (error) {
        res.status(500).json({error: err.message})    
    }
}

/**
 * Return all transactions made by all users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
 */
export const getAllTransactions = async (req, res) => {
    try {
        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }
        
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (!adminAuth.authorized) res.status(401).json({error: adminAuth.cause});

        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
            res.status(200).json({data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage});
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({error: err.message})    
    }
}

/**
 * Return all transactions made by a specific user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 400 is returned if the user does not exist
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
 */
export const getTransactionsByUser = async (req, res) => {
    try {

        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }
        const isUserPresent = await User.find({username: req.params.username});
        if(!isUserPresent){
            return res.status(400).json({error: "User not found"});
        } 
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        if (req.url.indexOf("/transactions/users/") >= 0) {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if(adminAuth.authorized){
                transactions.aggregate([
                    {
                        $match: {
                            username: req.params.username
                        },
                        $lookup: {
                            from: "categories",
                            localField: "type",
                            foreignField: "type",
                            as: "categories_info"
                        }
                    },
                    { $unwind: "$categories_info" }
                ]).then((result) => {
                    let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
                    res.json(data);
                }).catch(error => { throw (error) })

            }else{
                return res.status(401).json({ message: "Unauthorized" });
            }
        }
        else if ((pathComponents[1] == "users" && pathComponents[3] == "transactions") && req.params.username==path[2] && (userAuth||adminAuth)) {
            transactions.findOne({ username: pathComponents[1]}, function(err, result) {
                if (err) {
                  console.error('Error finding user:', err);
                  res.status(401).json({ error: "User not found"})
                }
                else{
                    console.log('User exists:', result);
                    result}             
                                 
        });
        } 
        else {
            const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username});
            const date_filter = handleDateFilterParams(req);
            const amount_filter = handleAmountFilterParams(req);
            
            if(userAuth.authorized){
                transactions.aggregate([
                    {
                        $match: {
                            $and: [
                              { date_filter },
                              { amount_filter },
                              {username: req.params.username}
                            ]
                        },
                        $lookup: {
                            from: "categories",
                            localField: "type",
                            foreignField: "type",
                            as: "categories_info"
                        }
                    },
                    { $unwind: "$categories_info" }
                ]).then((result) => {
                    let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
                    res.json(data);
                }).catch(error => { throw (error) })
            }else{
                return res.status(401).json({ message: "Unauthorized" });
            }
        } 
        
        //throw new Error("Authorization problem");
    } catch (error) {
        res.status(500).json({error: err.message})    
    }
}

/**
 * Return all transactions made by a specific user filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user with the specified category
    - error 400 is returned if the user or the category does not exist
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {
    } catch (error) {
        res.status(500).json({error: err.message})    
    }
}

/**
 * Return all transactions made by members of a specific group
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - empty array must be returned if there are no transactions made by the group
 */
export const getTransactionsByGroup = async (req, res) => {
    try {
    } catch (error) {
        res.status(500).json({error: err.message})    
    }
}

/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - error 400 is returned if the group or the category does not exist
    - empty array must be returned if there are no transactions made by the group with the specified category
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
    try {
    } catch (error) {
        res.status(500).json({error: err.message})   
    }
}

/**
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 400 is returned if the user or the transaction does not exist
 */
export const deleteTransaction = async (req, res) => {
    try {
        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }
        
        const userAuth = verifyAuth(req, res, {authType: "User", username: req.params.username})
        const adminAuth = verifyAuth(req, res, {authType: "Admin"})

        if (!adminAuth){
           if(!userAuth){
            throw new Error('User can not perform this operation on other user (admin required)');
           }
        }
        
            
        


        

        let data = await transactions.deleteOne({ _id: req.body._id });
        return res.json("deleted");
    } catch (error) {
        res.status(500).json({error: err.message})    
    }
}

/**
 * Delete multiple transactions identified by their ids
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 400 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
 */
export const deleteTransactions = async (req, res) => {
    try {
        const cookie = req.cookies
        const adminAuth = verifyAuth(req, res, {authType: "Admin"})

        if (!cookie.accessToken && adminAuth) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }
        req.body.forEach(el => {
            transactions.deleteOne({_id: el});
        })
            
        return res.json("deleted");
    } catch (error) {
        res.status(500).json({error: err.message})    
    }
}
