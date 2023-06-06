import { categories, transactions } from "../models/model.js";
import { Group, User, UserSchema } from "../models/User.js";
import { getGroup } from "./users.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";


/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
  - Optional behaviour:
    - error 400 returned if the request body does not contain all the necessary attributes
    - error 400 returned if at least one of the parameters in the request body is an empty string
    - error 400 returned if the type of category passed in the request body represents an already existing category in the database
    - error 401 returned if called by an authenticated user who is not an admin (authType = Admin)
 */
export const createCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (!adminAuth.authorized) res.status(401).json({error: adminAuth.cause});
        
        const { type, color } = req.body;
        if(!type || !color) return res.status(400).json({error: "Missing parameters"});

        const retrieveCategory = await categories.findOne({type: type});
        if (retrieveCategory) res.status(400).json({error: `Invalid input values, a category of type ${type} already exists`});

        const new_categories = new categories({ type, color });
        new_categories.save()
            .then(data => res.json(data))
            .catch(err => { throw err })

        res.status(200).json({data: {type: type, color: color}, refreshedTokenMessage: res.locals.refreshedTokenMessage});
    } catch (error) {
        res.status(500).json({error: error.message})    
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
            return res.status(401).json({ error: "Unauthorized for access token" }); // unauthorized
        }
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (adminAuth.authorized) { 
            //Admin auth successful
            const oldType = req.params.type;
            const {newType, newColor} = req.body;
            const alreadyIn = await categories.findOne({ "type" : newType });
            if(!newType || !newColor || newType.trim() === "" || newColor.trim() === "" || alreadyIn){
                return res.status(400).json({error: "Invalid input values"});
            }
            const exists = await categories.find({"type": oldType});
            if(!exists){
                return res.status(400).json({error: "Category does not exist"});
            }
            const query = {"type" : oldType};
            const update = {$set : {"type": newType, "color": newColor}};
            const writeResult1 = await categories.updateOne(query, update);
            const updateTransactions = {$set: {type: newType}};
            const writeResult2 = await transactions.updateMany(query, updateTransactions);
            res.status(200).json({data: {message: "Category edited successfully", count: writeResult2.modifiedCount}, 
                                        refreshedTokenMessage: res.locals.refreshedTokenMessage});
        } else {
            res.status(401).json({ error: adminAuth.message})
        }

    } catch (error) {
        res.status(500).json({error: error.message})    
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
            return res.status(401).json({ error: "Unauthorized" }); // unauthorized
        }
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (adminAuth.authorized) { 
        //Admin auth successful
            let types = req.body
            if(!types || types.some((type) => type.trim() === "" )){
                return res.status(400).json({ error: "Input not present or empty string!" });
            }

            const n_categories = await categories.find({});
            if(n_categories.length === 1){
                return res.status(400).json({ error: "There is only one category left!" });
            }
            if(n_categories.length === types.length){
                const oldestType = await categories.find({}).sort({_id: 1})[0].type;
                types = types.filter((t) => t !== oldestType);
            }
            const inDB = await categories.find({type: {$in: types}});
            if(types.length !== inDB.length){
                return res.status(400).json({ error: "Category doesn't exist" });
            }
            
            const result = await categories.deleteMany({type: {$in: types}});
            const writeResult2 = await transactions.updateMany({type: {$in: types}}, {$set: {type: "investment"}});
            res.status(200).json({data: {message: "Category edited successfully", 
                                        count: writeResult2.modifiedCount}, 
                                        refreshedTokenMessage: res.locals.refreshedTokenMessage});
        } else {
            res.status(401).json({ error: adminAuth.cause});
        }

    } catch (error) {
        res.status(500).json({error: error.message})   
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
        const auth = verifyAuth(req, res, { authType: "Simple" });
        if (!auth.authorized) res.status(401).json({error: auth.cause});

        let data = await categories.find({})

        let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color }))

        res.status(200).json({data: filter, refreshedTokenMessage: res.locals.refreshedTokenMessage});
    } catch (error) {
        res.status(500).json({error: error.message})    
    }
}

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 400 is returned if the request body does not contain all the necessary attributes
    - error 400 is returned if at least one of the parameters in the request body is an empty string
    - error 400 is returned if the type of category passed in the request body does not represent a category in the database
    - error 400 is returned if the username passed in the request body is not equal to the one passed as a route parameter
    - error 400 is returned if the username passed in the request body does not represent a user in the database
    - error 400 is returned if the username passed as a route parameter does not represent a user in the database
    - error 400 is returned if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted)
    - error 401 is returned if called by an authenticated user who is not the same user as the one in the route parameter (authType = User)
 */
export const createTransaction = async (req, res) => {
    try {
        const userAuth = verifyAuth(req, res, {authType: "User", username: req.params.username});
        if (!userAuth.authorized) res.status(401).json({error: userAuth.cause});
        
        const { username, amount, type } = req.body;
        if(!username || !amount || !type) return res.status(400).json({error: "Missing parameters"});

        if (isNaN(parseFloat(amount))) res.status(400).json({error: "Error in casting amount to float"});

        const retrieveCategory = await categories.findOne({type: type});
        if (!retrieveCategory) res.status(400).json({error: "Category doesn't exist"});

        const usernameParam = req.params.username;
        if (usernameParam !== username) res.status(400).json({error: "the username passed in the request body is not equal to the one passed as a route parameter"});

        const retrieveUserParam = await User.findOne({username: usernameParam});
        if (!retrieveUserParam) res.status(400).json({error: "User doesn't exist"});
        
        const new_transactions = new transactions({ username, amount, type });
        new_transactions.save()
            .then(data => res.json(data))
            .catch(err => { throw err })

        res.status(200).json({
            data: {
                username: new_transactions.username,
                amount: new_transactions.amount,
                type: new_transactions.type,
                date: new_transactions.date
            }, 
            refreshedTokenMessage: res.locals.refreshedTokenMessage});
        
    } catch (error) {
        res.status(500).json({error: error.message})    
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
        res.status(500).json({error: error.message})    
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
        const isUserPresent = await User.findOne({username: req.params.username});
        if(!isUserPresent){
            return res.status(400).json({error: "User not found"});
        } 
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        if (req.url.indexOf("/transactions/users/") >= 0) {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if(adminAuth.authorized){
                const username = req.params.username;
                transactions.aggregate([
                    {
                        $match: {
                            "username": username
                        }
                    },
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
                    let data_array = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
                    res.json(res.status(200).json({data: data_array, refreshedTokenMessage: res.locals.refreshedTokenMessage}));
                }).catch(error => { throw (error) })

            }else{
                return res.status(401).json({ error: "Unauthorized" });
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
                              date_filter ,
                              amount_filter,
                              {username: req.params.username}
                            ]
                        }
                    },
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
                    let data_array = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))
                    res.json({data: data_array, refreshedTokenMessage: res.locals.refreshedTokenMessage});
                }).catch(error => { throw (error) })
            }else{
                return res.status(401).json({ error: "Unauthorized" });
            }
        } 
        
        //throw new Error("Authorization problem");
    } catch (error) {
        res.status(500).json({error: error.message})    
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
    try{

        const user = req.params.username;
        const category = req.params.category; 
        const cookie = req.cookies
        if (!cookie.accessToken) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }

        const isUserPresent = await User.findOne({username: user});
        if(!isUserPresent){
            return res.status(400).json({error: "User not found"});
        } 
        
        const isCategoryPresent = await categories.findOne({type: category});
        if(!isCategoryPresent){
            return res.status(400).json({error: "Category not found"});
        }
        

        //ADMIN check: /transactions/users/:username/category/:category
        if(req.url.indexOf("/transactions/users/"+user+"/category/"+category)>=0){
            const adminAuth = verifyAuth(req, res, {authType: "Admin"})         
            if(!adminAuth.authorized){
                return res.status(401).json({ error: "Needed admin privileges" });
            }
        }  
        //REGULAR check: /users/:username/transactions/category/:category
        else if(req.url.indexOf("/users/"+user+"/transactions/category/"+category)>=0){
            const userAuth = verifyAuth(req, res, {authType: "User", username: user})
            if(!userAuth.authorized){
                return res.status(401).json({ error: "Forbidden operation: not possible to make split requests" });
            }
        }
        else{
            return res.status(400).json({ error: "Bad request" });
        }
            
        transactions.aggregate([
            {
            $match: {
                $and: [
                    { username: req.params.username },
                    { type: req.params.category }
                  ]
                }
            },
            
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
            let dataResponse = result.map(v => Object.assign({}, {username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color}))
            res.status(200).json({data: dataResponse, refreshedTokenMessage: res.locals.refreshedTokenMessage });
        }).catch(error => { throw (error) })
    }  
    
    
    
    catch (error) {
        res.status(500).json({error: error.message})    
    }
}


export const getTransactionsByGroup = async (req, res) => {
   
    try {
        
        

        const groupName = req.params.name; 
        
        /*
        const isGroupPresent = await Group.findOne({name: groupName});
        if(!isGroupPresent){
            return res.status(400).json({error: "User not found"});
        }
        */
        //Get user list form group
        const retrieveGroup = (await Group.findOne({ name: groupName })); 
        if (!retrieveGroup) return res.status(400).json({error: "Group not found"});

        //ADMIN route: /transactions/groups/:name
        if(req.url.indexOf("/transactions/groups")>=0){
            const adminAuth = verifyAuth(req, res, {authType: "Admin"})         
            if(!adminAuth.authorized){
                return res.status(401).json({ error: "Needed admin privileges" });
            }
        }  

        //REGULAR route: /groups/:name/transactions (check for group)
        else if(req.url.indexOf("/groups/"+req.params.name+"/transactions")>=0){
            const groupEmails = retrieveGroup.members.map((member) => member.email) 
            const userAuth = verifyAuth(req, res, {authType: "Group", emails: groupEmails})
            if(!userAuth.authorized){
                return res.status(401).json({ error: "Forbidden operation: you are not in the group" });
            }
        }
        else{
            return res.status(400).json({ error: "Bad request" });
        }
          
       
     
        let userList = retrieveGroup.members.map((member) => member.user);
        
        const userArray = await User.find({ _id: { $in: userList} }).select('username')
        .lean();
      
        const usernames = userArray.map((user) => user.username);
        console.log(userArray);

       // const auth = verifyAuth(req, res, {authType: "Group", emails: emails});
       // if (!auth.authorized) res.status(400).json({error: auth.cause});

        transactions.aggregate([
        {
        $match: {
            username: {$in: usernames}
        }
        },
        
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
        
        let dataResponse = result.map(v => Object.assign({}, {username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color}))
        res.status(200).json({data: dataResponse, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    }).catch(error => { throw (error) })

        

    } catch (error) {
        res.status(500).json({error: error.message})  
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
    
        const groupName = req.params.name;
        const category = req.params.category;

        /*
        const isGroupPresent = await Group.findOne({name: groupName});
        if(!isGroupPresent){
            return res.status(400).json({error: "User not found"});
        }*/

        const retrieveGroup = (await Group.findOne({ name: groupName })); 
        if (!retrieveGroup) return res.status(400).json({error: "Group not found"});

        const isCategoryPresent = await categories.findOne({type: category});
        if(!isCategoryPresent){
            return res.status(400).json({error: "Category not found"});
        }
        

         //ADMIN route: /transactions/groups/:name/category/:category
         if(req.url.indexOf("transactions/groups/"+groupName+"/category/"+category)>=0){
             const adminAuth = verifyAuth(req, res, {authType: "Admin"})         
             if(!adminAuth.authorized){
                 return res.status(401).json({ error: "Needed admin privileges" });
             }
         } 

        
         //REGULAR route: /groups/:name/transactions/category/:category
         else if(req.url.indexOf("/groups/"+groupName+"/transactions/category/"+category)>=0){
            const groupEmails = retrieveGroup.members.map((member) => member.email) 
            const userAuth = verifyAuth(req, res, {authType: "Group", emails: groupEmails})
             if(!userAuth.authorized){
                 return res.status(401).json({ error: "Forbidden operation: you are not in the group" });
             }
         }
         else{
             return res.status(400).json({ error: "Bad request" });
         }
        

        //Get user list form group
        
     
        let userList = retrieveGroup.members.map((member) => member.user);
        
        const userArray = await User.find({ _id: { $in: userList} }).select('username')
        .lean();
      
        const usernames = userArray.map((user) => user.username);
        console.log(userArray);
       
    
        transactions.aggregate([
        {
        $match: {

            $and: [
                { username: {$in: usernames} },
                { type: req.params.category }
              ]
            }            
        }
        ,
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
        
        let dataResponse = result.map(v => Object.assign({}, {username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color}))
        res.status(200).json({data: dataResponse, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    }).catch(error => { throw (error) })

        

    } catch (error) {
        res.status(500).json({error: error.message})  
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
        
        const username = req.params.username;
        const curAuthUser = req.params.username;
        const adminAuth = verifyAuth(req, res, {authType: "Admin"})         
        const userAuth = verifyAuth(req, res, {authType: "User", username: curAuthUser})         
        
        
        //Returns a 401 error if the user is not the user whose transactions are being deleted nor an admin
        if(!(adminAuth.authorized || userAuth.authorized)){
            return res.status(401).json({ error: "Forbidden operation: you are not the user nor an admin" });
        }
    
        /*
        //ROUTE: /users/:username/transactions
        if(req.url.indexOf("users/"+username+"/transactions")>=0){
            
            return res.status(400).json({ error: "Bad request" });
            
        }  
        */  
        
        //Returns a 400 error if the request body does not contain all the necessary attributes
        if(!Object.keys(req.body).includes("_id" )){
            return res.status(400).json({ error: "Bad request: _id information missing" });
        }
    
        const id = req.body._id;
        //Returns a 400 error if the `_id` in the request body is an empty string
        if (id.trim() === "") {
            return res.status(400).json({ error: "Bad request: _id is an empty string" });
        }
        
        const userEx = await User.findOne({ username: username })
    
        //Returns a 400 error if the username passed as a route parameter does not represent a user in the database
        if(!userEx){
            return res.status(400).json({ error: "Bad request: username not found" });
        }
        
        //Returns a 400 error if the `_id` in the request body does not represent a transaction in the database
        
        const tran = await transactions.findById(id);
    
        if(!tran) return res.status(400).json({ error: "Transaction not in the db" });
    
        //Returns a 400 error if the `_id` in the request body represents a transaction made by a different user than the one in the route
        if(tran.username != username){
                return res.status(400).json({ error: "Bad request: not my transaction" });
        }
    
    
        await transactions.deleteOne({ _id: id });
    
        return res.status(200).json({data: {message: "Transaction deleted"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})
    }
    catch (error) {
        console.log(error.message)
        res.status(500).json({error: error.message})    
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
        if (!cookie.accessToken) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }
        
        const adminAuth = verifyAuth(req, res, {authType: "Admin"})     
        
        //Returns a 401 error if the user is not the user whose transactions are being deleted nor an admin
        if(!(adminAuth.authorized)){
            return res.status(401).json({ error: "Admin privileges required" });
        }            

        const ids = req.body._ids;                 
        
        //Returns a 400 error if the request body does not contain all the necessary attributes
        if(!Object.keys(req.body).includes("_ids" )){
            return res.status(400).json({ error: "Bad request: request body does not contain all the necessary attributes" });
        }
        if (!Array.isArray(ids)) {
            return res.status(400).json({ error: "Bad request: 'ids' should be an array" });
          }
          
    
        for (const id of ids) {
            if(id.trim()==""){
                return res.status(400).json({ error: "Bad request: _id information missing" });
            }

        const transaction = await transactions.findById(id);
        if (transaction === null) {
        console.log("Transaction does not exist.");
        return res.status(400).json({ error: "Id not found in the system: " + id + ". No operation performed." });
        } else {
        console.log("Transaction found:", transaction);
        }
           
            
        }
                
   
        ids.forEach((id) => {
            transactions.deleteOne({ _id: id })
              .then(() => {
                console.log(`Transaction with ID ${id} deleted successfully.`);
              })
              .catch((err) => {
                console.error(`Failed to delete transaction with ID ${id}:`, err);
              });
          });
               

        

        return res.status(200).json({data: {message: "Transactions deleted"}, refreshedTokenMessage: res.locals.refreshedTokenMessage})
    }
        
    catch (error) {
        res.status(500).json({error: error.message})    
    }
}
    
    
    
