import { Group, User } from "../models/User.js";

/** 
@param info Is a JSON param that has in it all the information for the query 
These are the fields: {
    auth: "admin/regular"
    user: "username"

    
} */
export function getTransacitionByUserWrapper(info) 
{


    const isUserPresent = User.find({username: info.user});
    if(!isUserPresent){
        return {error: "User not found"};
    } 

    //ADMIN query
    if (info.auth == "admin"){
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
    }
}


/** 
@param info Is a JSON param that has in it all the information for the query 
These are the fields: {
    name: group name
    
} */
export function getGroupWrapper(info) {
    
    const retrieveGroup =  Group.findOne({ name: info.name });
    if (!retrieveGroup) return {error: "Group not found"};


    const members = retrieveGroup.members.map((member) => ({email: member.email, user: member.user})); // excluding _id field

    return {data: {name: retrieveGroup.name, members: members}}; 

}