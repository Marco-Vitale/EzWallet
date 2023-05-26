import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";
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
      res.status(400).json({ error: adminAuth.cause})
    }
  } catch (error) {
    res.status(500).json({error: err.message})    
  }
}

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 400 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
  try {
    const name = req.params.username;
    let data = undefined;

    const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })
    if (userAuth.authorized) {
      const user = await User.findOne({ username : name });
      data = {username: user.username, email: user.email, role: user.role};
    } else {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" })
      if (adminAuth.authorized) {
        const user = await User.findOne({ username : name });
        data = {username: user.username, email: user.email, role: user.role};
      } else {
        res.status(400).json({ error: adminAuth.cause})
      }
    }

    res.status(200).json({data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage});

  } catch (error) {
    res.status(500).json({error: err.message})  
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

        const cookie = req.cookies
        if (!cookie.accessToken || !cookie.refreshToken) {
            return res.status(401).json({ message: "Unauthorized" }) // unauthorized
        }

        const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
      
        const {name, memberEmails} = req.body
        const existingGroup = await Group.findOne({ name: req.body.name });
        if (existingGroup) return res.status(400).json({ message: "already existing group with the same name" });

        //3 Arrays in which i'll save the memberEmails according to their presence

        const members = []
        const alreadyInGroup = []
        const membersNotFound = [] 

        const membersDB = []          //This is an array containing the structure of the db

        //Additional checks on the caller of the creation function

        const inAGroup = await Group.findOne({ members: { $elemMatch: { email: decodedAccessToken.email }}})

        if(inAGroup){
          return res.status(400).json({ message: "You are already part of a group!"});
        }else{
          const calleeUser = await User.findOne({ email: decodedAccessToken.email });
          if(calleeUser){
            members.push(decodedAccessToken.email)
            membersDB.push({ email: decodedAccessToken.email, user: calleeUser._id });
          }else{
            return res.status(400).json({ message: "Unexpected error"});
          }
        }

        for(const mail of memberEmails){
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

        if(members.length === 0) return res.status(400).json({ message: "all the `memberEmails` either do not exist or are already in a group" }); 

        const newGroup = await Group.create({
          name: name,
          members: membersDB
        });

        res.status(200).json({ group: { name: name, members: members }, alreadyInGroup, membersNotFound });

    } catch (err) {
        res.status(500).json(err.message)
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
      if (!adminAuth.authorized) res.status(400).json({error: adminAuth.cause});

      //!! IN QUESTO MOMENTO VIENE RITORNATO ANCHE L'ID PER OGNI MEMBER.. DA TOGLIERE?
      
      const groups = await Group.find();
      if(groups){
        const arrayret = []
        for(const g of groups){
          arrayret.push({name: g.name, members: g.members})
        }
        res.status(200).json({data: arrayret, refreshedTokenMessage: res.locals.refreshedTokenMessage});
      }else{
        res.status(200).json([]);
      }
    } catch (err) {
      res.status(500).json({error: err.message})    
    }
}

/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 400 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {
    try {
      const groupName = req.params.name; 
      const retrieveGroup = (await Group.findOne({ name: groupName }));
      if (!retrieveGroup) res.status(400).json({error: "Group not found"});

      const emails = retrieveGroup.members.map((member) => member.email);

      const auth = verifyAuth(req, res, {authType: "Group", emails: emails});
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      if (!auth.authorized && !adminAuth.authorized) res.status(400).json({error: auth.cause});

      const members = retrieveGroup.members.map((member) => ({email: member.email, user: member.user})); // excluding _id field

      res.status(200).json({data: {name: retrieveGroup.name, members: members}, refreshedTokenMessage: res.locals.refreshedTokenMessage});
  
      } catch (err) {
        res.status(500).json({error: err.message})      
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
    - error 400 is returned if the group does not exist
    - error 400 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const addToGroup = async (req, res) => {
    try {
      const groupName = req.params.name; 
      const retrieveGroup = await Group.findOne({ name: groupName });
      if (!retrieveGroup) res.status(400).json({error: "Group not found"});

      const emails = retrieveGroup.members.map((member) => member.email);

      const auth = verifyAuth(req, res, {authType: "Group", emails: emails});
      const adminAuth = verifyAuth(req, res, { authType: "Admin" });
      if (!auth.authorized && !adminAuth.authorized) res.status(400).json({error: auth.cause});

      const newMembers = req.body;
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

      if (!userData) res.status(400).json({error: "Passed emails do not exist or are already in a group"});

      res.status(200).json({
        data: {
          'group': {
            name: groupName,
            members: members
          },
          'alreadyInGroup': alreadyInGroup,
          'membersNotFound': membersNotFound
        },
        refreshedTokenMessage: res.locals.refreshedTokenMessage
      });

    } catch (err) {
      res.status(500).json({error: err.message})    
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
    - error 400 is returned if the group does not exist
    - error 400 is returned if all the `memberEmails` either do not exist or are not in the group
 */
export const removeFromGroup = async (req, res) => {
  try {
    const groupName = req.params.name; 
    const retrieveGroup = await Group.findOne({ name: groupName });
    if (!retrieveGroup) res.status(400).json({error: "Group not found"});

    const emails = retrieveGroup.members.map((member) => member.email);

    const auth = verifyAuth(req, res, {authType: "Group", emails: emails});
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (!auth.authorized && !adminAuth.authorized) res.status(400).json({error: auth.cause});

    const selectedMembers = req.body;
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
      const result = await Group.updateOne({ name: groupName }, { $pull: { members: userData } });
    }

    if (!userData) res.status(400).json({error: "Passed emails do not exist or are already in a group"});

    const actualMembers = [];
    for (const member of members) {
      const check = removedMembers.find(removed => (removed.email == member.email || removed.user == member.user));
      if (!check) actualMembers.push(member);
    }

    res.status(200).json({
      data: {
        'group': {
          name: groupName,
          members: actualMembers
        },
        'noInGroup': noInGroup,
        'membersNotFound': membersNotFound
      },
      refreshedTokenMessage: res.locals.refreshedTokenMessage
    });

  } catch (err) {
      res.status(500).json({error: err.message})    
    }
}

/**
 * Delete a user
  - Request Parameters: None
  - Request Body Content: A string equal to the `email` of the user to be deleted
  - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
    specifies whether the user was also `deletedFromGroup` or not.
  - Optional behavior:
    - error 400 is returned if the user does not exist 
 */
export const deleteUser = async (req, res) => {
    try {
    } catch (err) {
      res.status(500).json({error: err.message})    
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
      const existingGroup = await Group.findOne({ name: req.body.name });
      if (!existingGroup) return res.status(401).json({ message: "The group does not exist!" });

      const del = await Group.findOneAndDelete({ name: name }
      ).then(res.status(200).json({message: "The group has been deleted!"}))
    } catch (err) {
      res.status(500).json({error: err.message})    
    }
}