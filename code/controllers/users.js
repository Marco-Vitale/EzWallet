import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth, verifyEmail } from "./utils.js";
import jwt from 'jsonwebtoken'

/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
  try {
    const adminAuth = verifyAuth(req, res, { authType: "Admin" })
    if (adminAuth.authorized) {
      const users = (await User.find()).map(user => ({username: user.username, email: user.email, role: user.role}));
      res.status(200).json({data: users, refreshedTokenMessage: res.locals.refreshedTokenMessage});
    } else {
      res.status(401).json({ error: adminAuth.cause})
    }
  } catch (error) {
    res.status(500).json({error: error.message})    
  }
}

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 400 is returned if the username passed as the route parameter does not represent a user in the database
    - error 401 is returned if called by an authenticated user who is neither the same user as the one in the route parameter (authType = User) nor an admin (authType = Admin)
 */
export const getUser = async (req, res) => {
  try {
    const name = req.params.username;
    let data = undefined;

    const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });

    if (userAuth.authorized || adminAuth.authorized) {
      const user = await User.findOne({ username : name });
      if (!user) return res.status(400).json({ error: "User not found"}); 
      data = {username: user.username, email: user.email, role: user.role};
    } else {
      return res.status(401).json({ error: adminAuth.cause});
    }

    res.status(200).json({data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage});

  } catch (error) {
    res.status(500).json({error: error.message})  
  }
}

/**
 * Create a new group
  - Request Body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name`
    of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members
    (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email
    +does not appear in the system)
  - Optional behavior:
    - error 400 is returned if there is already an existing group with the same name
    - error 400 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const createGroup = async (req, res) => {
    try {

      //If the function is called with an empty array for members the group is created with only the user that is logged in
      
        const cookie = req.cookies
        if (!cookie.accessToken || !cookie.refreshToken) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }

        const userAuth = verifyAuth(req, res, { authType: "Simple"})
        if(!userAuth) return res.status(401).json({error: userAuth.cause})

        const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
      
        const {name, memberEmails} = req.body
        if(!name || !memberEmails || name.trim() === "" || memberEmails.some((mail) => mail.trim() === "")) return res.status(400).json({error: "Missing parameters"})

        const existingGroup = await Group.findOne({ name: req.body.name });
        if (existingGroup) return res.status(400).json({ error: "already existing group with the same name" });

        //3 Arrays in which i'll save the memberEmails according to their presence

        const members = []
        const alreadyInGroup = []
        const membersNotFound = [] 

        const membersDB = []          //This is an array containing the structure of the db

        //Additional checks on the caller of the creation function

        const inAGroup = await Group.findOne({ members: { $elemMatch: { email: decodedAccessToken.email }}})

        if(inAGroup){
          return res.status(400).json({ error: "You are already part of a group!"});
        }else{
          const calleeUser = await User.findOne({ email: decodedAccessToken.email });
          if(calleeUser){
            if(!memberEmails.includes(decodedAccessToken.email)){
              members.push(decodedAccessToken.email)
              membersDB.push({ email: decodedAccessToken.email, user: calleeUser._id });
            }
          }else{
            return res.status(400).json({ error: "Unexpected error"});
          }
        }

        for(const mail of memberEmails){

          if(!verifyEmail(mail)) return res.status(400).json({error: "Something's wrong with memberemails"})

          const present = await User.findOne({ email: mail });
          if(present){
            const inAGroup = await Group.findOne({ members: { $elemMatch: { email: mail }}})
            if(inAGroup){
              alreadyInGroup.push(mail)
            }else{
              members.push(mail)
              membersDB.push({ email: mail, user: present._id });
            }
          }else{
            membersNotFound.push(mail);
          }
        }

        //Theoretically at this point the callee user is always in the members array, so if the lenght is equals to 1
        //This means that no other members can be added to this group, the creation is aborted.

        /*It should not be possible to create a group with only the email of the calling user and no other member's email. 
        There must be at least one more valid email in the array for the function to not return an error*/

        if(members.length === 0 || members.length === 1) return res.status(400).json({ error: "all the `memberEmails` either do not exist or are already in a group" }); 

        const newGroup = await Group.create({
          name: name,
          members: membersDB
        });

        res.status(200).json({data: {group: { name: name, members: members }, alreadyInGroup, membersNotFound }, refreshedTokenMessage: res.locals.refreshedTokenMessage});

    } catch (error) {
        res.status(500).json({error: error.message})
    }
}
  

  

/**
 * Return all the groups
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
    and an array for the `members` of the group
  - Optional behavior:
    - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
    try {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" })
      if (!adminAuth.authorized) res.status(401).json({error: adminAuth.cause});


      const groups = await Group.find();
      if(groups){
        const arrayret = []

        for(const g of groups){
          const members = g.members.map((member) => ({email: member.email}));
          arrayret.push({name: g.name, members: members})
        }
        res.status(200).json({data: arrayret, refreshedTokenMessage: res.locals.refreshedTokenMessage});
      }else{
        res.status(200).json({data: [], refreshedTokenMessage: res.locals.refreshedTokenMessage});
      }
    } catch (error) {
      res.status(500).json({error: error.message})    
    }
}

/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 400 is returned if the group does not exist
    - error 401 is returned if called by an authenticated user who is neither part of the group (authType = Group) nor an admin (authType = Admin)
 */
export const getGroup = async (req, res) => {
    try {
      const groupName = req.params.name; 
      const retrieveGroup = (await Group.findOne({ name: groupName }));
      if (!retrieveGroup) return res.status(400).json({error: "Group not found"});

      const emails = retrieveGroup.members.map((member) => member.email);

      const auth = verifyAuth(req, res, {authType: "Group", emails: emails});
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      if (!auth.authorized && !adminAuth.authorized) return res.status(401).json({error: auth.cause});

      const members = retrieveGroup.members.map((member) => ({email: member.email, user: member.user})); // excluding _id field

      return res.status(200).json({data: {group:{name: retrieveGroup.name, members: members}}, refreshedTokenMessage: res.locals.refreshedTokenMessage});
  
      } catch (error) {
        return res.status(500).json({error: error.message});
      }
}

/**
 * Add new members to a group
  - Request Body Content: An array of strings containing the emails of the members to add to the group
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include the new members as well as the old ones), 
    an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 400 is returned if the request body does not contain all the necessary attributes
    - error 400 is returned if the group name passed as a route parameter does not represent a group in the database
    - error 400 is returned if all the provided emails represent users that are already in a group or do not exist in the database
    - error 400 is returned if at least one of the member emails is not in a valid email format
    - error 400 is returned if at least one of the member emails is an empty string
    - error 401 is returned if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/add`
    - error 401 is returned if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/insert`
 */
    export const addToGroup = async (req, res) => {
      try {
        const groupName = req.params.name;
        const retrieveGroup = await Group.findOne({ name: groupName });
        if (!retrieveGroup) return res.status(400).json({error: "Group not found"});
        
        const emails = retrieveGroup.members.map((member) => member.email); // retrieve the current emails of selected group
  
        if (req.url.includes("insert")){
          const adminAuth = verifyAuth(req, res, { authType: "Admin" });
          if (!adminAuth.authorized) return res.status(401).json({error: adminAuth.cause}); 
        } else {
          const auth = verifyAuth(req, res, {authType: "Group", emails: emails});
          if (!auth.authorized) return res.status(401).json({error: auth.cause});
        }
  
        const newMembers = req.body.emails;
        // check if the body is correct
        if (!newMembers || newMembers.length==0 || newMembers.some((member) => member.trim() === "")) 
          return res.status(400).json({error: "Body doesn't contain all requested attributes"});
  
        // check if the passed emails are in the correct format
        for (const email of newMembers) {
          if(!verifyEmail(email)) return res.status(400).json({error: `${email} has an incorrect email format, it is empty or not valid.`});
        }
  
        const members = retrieveGroup.members.map((member) => ({email: member.email, user: member.user})); // excluding _id field
        const membersNotFound = [];
        const alreadyInGroup = [];
        let userData = undefined; // used as auxiliary variable and as flag
  
        for (const email of newMembers) {
          const retrieveUser = await User.findOne({email: email});
          if (!retrieveUser) {
            membersNotFound.push(email);
            continue;
          }
  
          const userInGroup = await Group.findOne({ 'members.email': email });
          if (userInGroup) {
            alreadyInGroup.push(email);
            continue;
          }
  
          userData = {email: retrieveUser.email, user: retrieveUser._id};
          const duplicate = members.find(member => (member.email == userData.email || member.user == userData.user));
          if(duplicate) continue;
          
          members.push(userData);
          const result = await Group.updateOne({ name: groupName }, { $push: { members: userData } });
        }
  
        if (!userData) return res.status(400).json({error: "Passed emails do not exist or are already in a group"});
  
        return res.status(200).json({
          data: {
            'group': {
              name: groupName,
              members: members.map((member => ({email: member.email})))
            },
            'alreadyInGroup': alreadyInGroup,
            'membersNotFound': membersNotFound
          },
          refreshedTokenMessage: res.locals.refreshedTokenMessage
        });
  
      } catch (error) {
        res.status(500).json({error: error.message})    
      }
  }
  
  /**
   * Remove members from a group
    - Request Body Content: An array of strings containing the emails of the members to remove from the group
    - Response Body Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
      created group and an array for the `members` of the group, this array must include only the remaining members),
      an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists 
      the `membersNotFound` (members whose email does not appear in the system)
    - Optional behavior:
      - error 400 is returned if the request body does not contain all the necessary attributes
      - error 400 is returned if the group name passed as a route parameter does not represent a group in the database
      - error 400 is returned if all the provided emails represent users that do not belong to the group or do not exist in the database
      - error 400 is returned if at least one of the emails is not in a valid email format
      - error 400 is returned if at least one of the emails is an empty string
      - error 400 is returned if the group contains only one member before deleting any user
      - error 401 is returned if called by an authenticated user who is not part of the group (authType = Group) if the route is `api/groups/:name/remove`
      - error 401 is returned if called by an authenticated user who is not an admin (authType = Admin) if the route is `api/groups/:name/pull`
   */
  export const removeFromGroup = async (req, res) => {
    try {
      const groupName = req.params.name; 
      const retrieveGroup = await Group.findOne({ name: groupName });
      if (!retrieveGroup) return res.status(400).json({error: "Group not found"});
  
      const emails = retrieveGroup.members.map((member) => member.email);
  
      if (req.url.includes("pull")){
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) return res.status(401).json({error: adminAuth.cause}); 
      } else {
        const auth = verifyAuth(req, res, {authType: "Group", emails: emails});
        if (!auth.authorized) return res.status(401).json({error: auth.cause});
      }
  
      const selectedMembers = req.body.emails;
      // check if the body is correct
      if (!selectedMembers || selectedMembers.length==0 || selectedMembers.some((member) => member.trim() === "")) 
        return res.status(400).json({error: "Body doesn't contain all requested attributes"});
  
      // check if the passed emails are in the correct format
      for (const email of selectedMembers) {
        if(!verifyEmail(email)) return res.status(400).json({error: `${email} has an incorrect email format, it is empty or not valid.`});
      }
  
      const members = retrieveGroup.members.map((member) => ({email: member.email, user: member.user})); // excluding _id field
      const removedMembers = [];
      const membersNotFound = [];
      const noInGroup = [];
      let userData = undefined; // used as auxiliary variable and as flag
  
      for (const email of selectedMembers) {
        const retrieveUser = await User.findOne({email: email});
        if (!retrieveUser) {
          membersNotFound.push(email);
          continue;
        }
  
        const userInGroup = retrieveGroup.members.find(member => member.email === email);
        if (!userInGroup) {
          noInGroup.push(email);
          continue;
        }
  
        userData = {email: retrieveUser.email, user: retrieveUser._id};
        const duplicate = removedMembers.find(member => (member.email == userData.email || member.user == userData.user));
        if(duplicate) continue;
          
        removedMembers.push(userData);
        if ((members.length - removedMembers.length) == 0) {
          return res.status(400).json({error: `The member ${email} cannot be removed from ${groupName}, it is the last member.`});
          break;
        }
  
        const result = await Group.updateOne({ name: groupName }, { $pull: { members: userData } });
      }
  
      if (!userData) return res.status(400).json({error: "Passed emails do not exist or are already in a group"});
  
      const actualMembers = [];
      for (const member of members) {
        const check = removedMembers.find(removed => (removed.email == member.email || removed.user == member.user));
        if (!check) actualMembers.push(member);
      }
  
      return res.status(200).json({
        data: {
          'group': {
            name: groupName,
            members: actualMembers.map((member => ({email: member.email})))
          },
          'notInGroup': noInGroup,
          'membersNotFound': membersNotFound
        },
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });
  
    } catch (error) {
        res.status(500).json({error: error.message})    
      }
  }
  
  

/**
 * Delete a user
  - Request Parameters: None
  - Request Body Content: A string equal to the `email` of the user to be deleted
  - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
    specifies whether the user was also `deletedFromGroup` or not.
  - Optional behavior:
    - If the user is the last user of a group then the group is deleted as well
    - error 400 is returned if the user does not exist 
    - error 400 is returned if the request body does not contain all the necessary attributes
    - error 400 is returned if the email passed in the request body is an empty string
    - error 400 is returned if the email passed in the request body is not in correct email format
    - error 400 is returned if the email passed in the request body does not represent a user in the database
    - error 401 is returned if called by an authenticated user who is not an admin (authType = Admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (!adminAuth.authorized) res.status(401).json({error: adminAuth.cause});

    const email = req.body;
    if (!email) res.status(400).json({error: "The body doesn't contain the necessary attributes."});
    if(!verifyEmail(email)) res.status(400).json({error: `${email} has an incorrect email format, it is empty or not valid.`});

    const userData = await User.findOne({email: email});
    if (!userData) res.status(400).json({error: `The user ${email} doesn't exist.`});

    // check if the user is the last member of the user
    let groupFlag = undefined;
    const groupAssociated = await Group.findOne({"members.email": userData.email});
    if (!groupAssociated) {
      groupFlag = false;
    } else {
      groupFlag = true;
      // check if the group is empty
      if (groupAssociated.members.length == 1){
        // selected user is the last member, directly remove the group
        const removeGroup = await Group.deleteOne({name: groupAssociated.name});
      } else {
        // remove the selected user from the group associated (if present)
        const groupAssociatedRemoved = await Group.updateOne(
          { "members.email": userData.email }, 
          { $pull: { members: { email: userData.email, user: userData._id} } }
        );
      }
    }

    // remove all transactions related to the selected user
    const numberOfTransactions = await transactions.deleteMany({username: userData.username});

    // remove the user
    const removeUser = await User.remove({username: userData.username, email: userData.email});

    res.status(200).json({
      data: {
        deletedTransaction: numberOfTransactions.deletedCount,
        deletedFromGroup: groupFlag
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });

  } catch (error) {
    res.status(500).json({error: error.message})    
  }
}

/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 400 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
    try {

      const adminAuth = verifyAuth(req, res, { authType: "Admin" })
      if (!adminAuth.authorized) res.status(400).json({error: adminAuth.cause});

      const {name} = req.body

      if(!name || name.trim() === "") return res.status(400).json({error: "Missing the name of the group"})

      const existingGroup = await Group.findOne({ name: req.body.name });
      if (!existingGroup) return res.status(400).json({ message: "The group does not exist!" });

      const del = await Group.findOneAndDelete({ name: name }
      ).then(res.status(200).json({data: {message: "The group has been deleted!"}, refreshedTokenMessage: res.locals.refreshedTokenMessage}))
    } catch (error) {
      res.status(500).json({error: error.message})    
    }
}