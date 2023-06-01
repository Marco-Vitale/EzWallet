import jwt from 'jsonwebtoken'

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 */

function validateDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
}


export const handleDateFilterParams = (req) => {
    const date = req.query.date;
    const from = req.query.from;
    const upTo = req.query.upTo;
    if(date && (from || upTo)){
        throw new Error("filter params inconsistency");
    }
    if(date){
        if(!validateDateFormat(date)){
            throw new Error("Incorrect format fo the date!");
        }
        const start = new Date(`${date}T00:00:00.000Z`);
        const end = new Date(`${date}T23:59:59.999Z`);
        return {$and: [{date: {$gte: start}}, {date: {$lte: end}}]};
    }else if(from){
        if(!validateDateFormat(from)){
            throw new Error("Incorrect format of the date!");
        }
        if(upTo){
            if(!validateDateFormat(upTo)){
                throw new Error("Incorrect format of the date!");
            }
            return {$and: [{date: {$gte: new Date(`${from}T00:00:00.000Z`)}}, {date: {$lte:new Date(`${upTo}T23:59:59.999Z`)}}]};
        }else{
            return {date: {$gte: new Date(`${from}T00:00:00.000Z`)}};
        }
    }else if(upTo){
        if(!validateDateFormat(upTo)){
            throw new Error("Incorrect format of the date!");
        }
        return {date: {$lte: new Date(`${upTo}T23:59:59.999Z`)}};
    }else{
        return {};
    }
}

/**
 * Handle possible authentication modes depending on `authType`
 * @param req the request object that contains cookie information
 * @param res the result object of the request
 * @param info an object that specifies the `authType` and that contains additional information, depending on the value of `authType`
 *      Example: {authType: "Simple"}
 *      Additional criteria:
 *          - authType === "User":
 *              - either the accessToken or the refreshToken have a `username` different from the requested one => error 401
 *              - the accessToken is expired and the refreshToken has a `username` different from the requested one => error 401
 *              - both the accessToken and the refreshToken have a `username` equal to the requested one => success
 *              - the accessToken is expired and the refreshToken has a `username` equal to the requested one => success
 *          - authType === "Admin":
 *              - either the accessToken or the refreshToken have a `role` which is not Admin => error 401
 *              - the accessToken is expired and the refreshToken has a `role` which is not Admin => error 401
 *              - both the accessToken and the refreshToken have a `role` which is equal to Admin => success
 *              - the accessToken is expired and the refreshToken has a `role` which is equal to Admin => success
 *          - authType === "Group":
 *              - either the accessToken or the refreshToken have a `email` which is not in the requested group => error 401
 *              - the accessToken is expired and the refreshToken has a `email` which is not in the requested group => error 401
 *              - both the accessToken and the refreshToken have a `email` which is in the requested group => success
 *              - the accessToken is expired and the refreshToken has a `email` which is in the requested group => success
 * @returns true if the user satisfies all the conditions of the specified `authType` and false if at least one condition is not satisfied
 *  Refreshes the accessToken if it has expired and the refreshToken is still valid
 */
/* USAGE examples:
const simpleAuth = verifyAuth(req, res, {authType: "Simple"})
const userAuth = verifyAuth(req, res, {authType: "User", username: req.params.username})
const adminAuth = verifyAuth(req, res, {authType: "Admin"})
const groupAuth = verifyAuth(req, res, {authType: "Group", emails: <array of emails>})
*/
export const verifyAuth = (req, res, info) => {
    const cookie = req.cookies
    if (!cookie.accessToken || !cookie.refreshToken) {
        return { authorized: false, cause: "Unauthorized" };
    }
    try {

        //These are the basic controls performed for each tipe (the only controls for the 'simple' authType)

        const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
        const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);
        if (!decodedAccessToken.username || !decodedAccessToken.email || !decodedAccessToken.role) {
            return { authorized: false, cause: "Token is missing information" }
        }
        if (!decodedRefreshToken.username || !decodedRefreshToken.email || !decodedRefreshToken.role) {
            return { authorized: false, cause: "Token is missing information" }
        }
        if (decodedAccessToken.username !== decodedRefreshToken.username || decodedAccessToken.email !== decodedRefreshToken.email || decodedAccessToken.role !== decodedRefreshToken.role) {
            return { authorized: false, cause: "Mismatched users" };
        }


        switch(info.authType){
            case 'Simple':
                return { authorized: true, cause: "Authorized" }
                break;

            case 'User':
                if (decodedAccessToken.username !== info.username || decodedRefreshToken.username !== info.username) {
                    return { authorized: false, cause: "Requested auth for a different user" }
                }

                if (decodedAccessToken.username == info.username && decodedRefreshToken.username == info.username) {
                    return { authorized: true, cause: "Authorized" }
                }
                break;

            case 'Admin':

                if (decodedAccessToken.role !== "Admin" || decodedRefreshToken.role !== "Admin") {
                    return { authorized: false, cause: "Requested auth for a different role" }
                }

                if (decodedAccessToken.role == "Admin" && decodedRefreshToken.role == "Admin") {
                    return { authorized: true, cause: "Authorized" }
                }
                break;

            case 'Group':
                if (!info.emails.includes(decodedAccessToken.email) || !info.emails.includes(decodedRefreshToken.email)) {
                    return { authorized: false, cause: "Mail of the token not present in the group" }
                }

                if (info.emails.includes(decodedAccessToken.email) && info.emails.includes(decodedRefreshToken.email)) {
                    return { authorized: true, cause: "Authorized" }
                }

                break;

            default:
                return { authorized: false, cause: "Wrong authType inserted" }
        }
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            try {
                const refreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY)
                const newAccessToken = jwt.sign({
                    username: refreshToken.username,
                    email: refreshToken.email,
                    id: refreshToken.id,
                    role: refreshToken.role
                }, process.env.ACCESS_KEY, { expiresIn: '1h' })
                res.cookie('accessToken', newAccessToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true })
                res.locals.refreshedTokenMessage = 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
                
                switch(info.authType){
                    case 'Simple':
                        return { authorized: true, cause: "Authorized" }
                        break;

                    case 'User':
                        if (refreshToken.username !== info.username) {
                            return { authorized: false, cause: "Requested auth for a different user" }
                        }
        
                        if (refreshToken.username == info.username) {
                            return { authorized: true, cause: "Authorized" }
                        }
                        break;

                    case 'Admin':
                        if (refreshToken.role !== "Admin") {
                            return { authorized: false, cause: "Requested auth for a different role" }
                        }
        
                        if (refreshToken.role == "Admin") {
                            return { authorized: true, cause: "Authorized" }
                        }
                        break;

                    case 'Group':
                        if (!info.emails.includes(refreshToken.email)) {
                            return { authorized: false, cause: "Mail of the token not present in the group" }
                        }
        
                        if (info.emails.includes(refreshToken.email)) {
                            return { authorized: true, cause: "Authorized" }
                        }
                        break;

                    default:
                        return { authorized: false, cause: "Wrong authType inserted" }
                }
            } catch (error) {
                if (error.name === "TokenExpiredError") {
                    return { authorized: false, cause: "Perform login again" }
                } else {
                    return { authorized: false, cause: error.name }
                }
            }
        } else {
            return { authorized: false, cause: err.name };
        }
    }
}


/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 */
export const handleAmountFilterParams = (req) => {
    const min = req.query.min;
    const max = req.query.max;


    if(min){
        if(isNaN(min)){
            throw new Error("not numerical values");
        }
        if(max){
            if(isNaN(max)){
                throw new Error("not numerical values");
            }
            return {$and: [{amount: {$lte: parseFloat(max)}}, {amount: {$gte: parseFloat(min)}}]};
        }else{
            return {amount: {$gte: parseFloat(min)}};
        }
    }else if(max){
        if(isNaN(max)){
            throw new Error("not numerical values");
        }
        return {amount: {$lte: parseFloat(max)}};
    }else{
        return {};
    }
}

export const verifyEmail = (mail) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(mail);
}
