# Test Report

The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover.

# Contents

- [Dependency graph](#dependency-graph)

- [Integration approach](#integration-approach)

- [Tests](#tests)

- [Coverage](#Coverage)


# Dependency graph 

![EzWallet_dependencies](images/V2/EzWallet_dependencies.png)

# Integration approach

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence
    (ex: step1: unit A, step 2: unit A+B, step 3: unit A+B+C, etc)> 
    <Some steps may  correspond to unit testing (ex step1 in ex above)>
    <One step will  correspond to API testing, or testing unit route.js>

### Mixed approach:
* Step #1: unit tests valid input & invalid input
    * controller.js 
    * users.js
    * auth.js
    * utils.js
* Step #2: integration tests valid input & invalid input
    * testing external libraries
    


# Tests

   <in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case  (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)>   <split the table if needed>


| Num | Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|--|
| 1 | Returns an object with a property <date> passing <date> (with properties <$gte> and <$lte>) | handleDateFilterParams | Unit | WB - Statement Coverage |
 | 2 | Returns an object with a property <date> passing <from> (only $gte property) | handleDateFilterParams | Unit | WB - Statement Coverage |
 | 3 | Returns an object with a property <date> passing <upTo> (only $lte property) | handleDateFilterParams | Unit | WB - Statement Coverage |
 | 4 | Returns an object with a property <date> passing <from> and <upTo> (with properties <$gte> and <$lte>) | handleDateFilterParams | Unit | WB - Statement Coverage |
 | 5 | Returns errors | handleDateFilterParams | Unit | WB - Statement Coverage |
 | 6 | Returns empty | handleDateFilterParams | Unit | WB - Statement Coverage |
 | 7 | Simple auth: Should return a flag/label setted to true | verifyAuth | Unit | WB - Statement Coverage |
 | 8 | Simple auth: Should return a flag/label setted to false (missing informations) | verifyAuth | Unit | WB - Statement Coverage |
 | 9 | User auth: Should return a flag/label setted to true | verifyAuth | Unit | WB - Statement Coverage |
 | 10 | User auth: Should return a flag/label setted to false (mismatched informations) | verifyAuth | Unit | WB - Statement Coverage |
 | 11 | User auth: Should return a flag/label setted to false (request for a different user) | verifyAuth | Unit | WB - Statement Coverage |
 | 12 | Admin auth: Should return a flag/label setted to true | verifyAuth | Unit | WB - Statement Coverage |
 | 13 | Admin auth: Should return a flag/label setted to false (requested auth for a different role) | verifyAuth | Unit | WB - Statement Coverage |
 | 14 | Group auth: Should return a flag/label setted to true | verifyAuth | Unit | WB - Statement Coverage |
 | 15 | Group auth: Should return a flag/label setted to false (mail of the token not present in the group) | verifyAuth | Unit | WB - Statement Coverage |
 | 16 | Simple auth: Should return a flag/label setted to true and set the new accessToken | verifyAuth | Unit | WB - Statement Coverage |
 | 17 | User auth: Should return a flag/label setted to true and set the new accessToken | verifyAuth | Unit | WB - Statement Coverage |
 | 18 | Admin auth: Should return a flag/label setted to true and set the new accessToken | verifyAuth | Unit | WB - Statement Coverage |
 | 19 | Group auth: Should return a flag/label setted to true and set the new accessToken | verifyAuth | Unit | WB - Statement Coverage |
 | 20 | Error auth: Should return a flag/label setted to false (undefined auth) | verifyAuth | Unit | WB - Statement Coverage |
 | 21 | Error auth: Should return a flag/label setted to false (perform login again) | verifyAuth | Unit | WB - Statement Coverage |
 | 22 | Correct email format: Should return true | verifyEmail | Unit | WB - Statement Coverage |
 | 23 | Incorrect email format: Should return false | verifyEmail | Unit | WB - Statement Coverage |
 | 24 | Should return the condition just for the min | handleAmountFilterParams | Unit | WB - Statement Coverage |
 | 25 | Should return the condition for the min and max | handleAmountFilterParams | Unit | WB - Statement Coverage |
 | 26 | Should return error (min is not a number), max is a number | handleAmountFilterParams | Unit | WB - Statement Coverage |
 | 27 | Should return error (max is not a number), min is a number | handleAmountFilterParams | Unit | WB - Statement Coverage |
 | 28 | Should return error (min is not a number) | handleAmountFilterParams | Unit | WB - Statement Coverage |
 | 29 | Should return error (max is not a number) | handleAmountFilterParams | Unit | WB - Statement Coverage |
 | 30 | Should return an ampty result | handleAmountFilterParams | Unit | WB - Statement Coverage |
 | 31 | Should return status code 200 | register | Unit | WB - Statement Coverage |
 | 32 | Should return status code 400: the request body does not contain all the necessary attributes | register | Unit | WB - Statement Coverage |
 | 33 | Should return status code 400: at least one of the parameters in the request body is an empty string | register | Unit | WB - Statement Coverage |
 | 34 | Should return status code 400: the email in the request body is not in a valid email format | register | Unit | WB - Statement Coverage |
 | 35 | Should return status code 400: the username in the request body identifies an already existing user | register | Unit | WB - Statement Coverage |
 | 36 | Should return status code 400: the email in the request body identifies an already existing user | register | Unit | WB - Statement Coverage |
 | 37 | status 200 when successful creates an admin | registerAdmin | Unit | WB - Statement Coverage |
 | 38 | status 400 req does not contain all inputs | registerAdmin | Unit | WB - Statement Coverage |
 | 39 | status 400 if req contains an empty param | registerAdmin | Unit | WB - Statement Coverage |
 | 40 | status 400 if email is not valid | registerAdmin | Unit | WB - Statement Coverage |
 | 41 | status 400 if there is an already existing email | registerAdmin | Unit | WB - Statement Coverage |
 | 42 | status 400 if there is an already existing username | registerAdmin | Unit | WB - Statement Coverage |
 | 43 | should return 200 for correct login | login | Unit | WB - Statement Coverage |
 | 44 | should return 400 if the request body does not contain all the necessary attributes | login | Unit | WB - Statement Coverage |
 | 45 | should return 400 if at least one of the parameters in the request body is an empty string | login | Unit | WB - Statement Coverage |
 | 46 | should return 400 if the email in the request body is not in a valid email format | login | Unit | WB - Statement Coverage |
 | 47 | 200 logout | logout | Unit | WB - Statement Coverage |
 | 48 | 400 logout | logout | Unit | WB - Statement Coverage |
 | 49 | Should return status code 200 | createCategory | Unit | WB - Statement Coverage |
 | 50 | Should return status code 400, missing parameters | createCategory | Unit | WB - Statement Coverage |
 | 51 | Should return status code 400, a parameter has an empty string | createCategory | Unit | WB - Statement Coverage |
 | 52 | Should return status code 400, already existing category | createCategory | Unit | WB - Statement Coverage |
 | 53 | Should return status code 401, the user is not an admin | createCategory | Unit | WB - Statement Coverage |
 | 54 | Should return status code 200 | updateCategory | Unit | WB - Statement Coverage |
 | 55 | Should return status code 400: request body does not contain all the necessary attributes | updateCategory | Unit | WB - Statement Coverage |
 | 56 | Should return status code 400: at least one of the parameters in the request body is an empty string | updateCategory | Unit | WB - Statement Coverage |
 | 57 | Should return status code 400: the type of category passed as a route parameter does not represent a category in the database | updateCategory | Unit | WB - Statement Coverage |
 | 58 | Should return status code 400: the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one | updateCategory | Unit | WB - Statement Coverage |
 | 59 | Should return status code 401: called by an authenticated user who is not an admin (authType = Admin) | updateCategory | Unit | WB - Statement Coverage |
 | 60 | Should return status code 200 | deleteCategory | Unit | WB - Statement Coverage |
 | 61 | Should return status code 200 having categories in the database equal to the categories to be deleted | deleteCategory | Unit | WB - Statement Coverage |
 | 62 | Should return status code 400: the request body does not contain all the necessary attributes | deleteCategory | Unit | WB - Statement Coverage |
 | 63 | Should return status code 400: there is only one category in the database | deleteCategory | Unit | WB - Statement Coverage |
 | 64 | Should return status code 400: at least one of the types in the array is an empty string | deleteCategory | Unit | WB - Statement Coverage |
 | 65 | Should return status code 400: the array passed in the request body is empty | deleteCategory | Unit | WB - Statement Coverage |
 | 66 | Should return status code 400: at least one of the types in the array does not represent a category in the database | deleteCategory | Unit | WB - Statement Coverage |
 | 67 | Should return status code 401: called by an authenticated user who is not an admin (authType = Admin) | deleteCategory | Unit | WB - Statement Coverage |
 | 68 | return status 200 and correct data | getCategories | Unit | WB - Statement Coverage |
 | 69 | return status 200 and empty data with empty db | getCategories | Unit | WB - Statement Coverage |
 | 70 | return status 401 for not admin call | getCategories | Unit | WB - Statement Coverage |
 | 71 | Should return status code 200 | createTransaction | Unit | WB - Statement Coverage |
 | 72 | Should return status code 400, missing parameters | createTransaction | Unit | WB - Statement Coverage |
 | 73 | Should return status code 400, empty string | createTransaction | Unit | WB - Statement Coverage |
 | 74 | Should return status code 400, category not present | createTransaction | Unit | WB - Statement Coverage |
 | 75 | Should return status code 400, user in body mismatch user in params | createTransaction | Unit | WB - Statement Coverage |
 | 76 | Should return status code 400, user not in the db | createTransaction | Unit | WB - Statement Coverage |
 | 77 | Should return status code 400, amount cannot be parsed | createTransaction | Unit | WB - Statement Coverage |
 | 78 | Should return status code 401, called by different user then route param | createTransaction | Unit | WB - Statement Coverage |
 | 79 | return status 200 and correct data | getAllTransactions | Unit | WB - Statement Coverage |
 | 80 | return status 401 for not admin call | getAllTransactions | Unit | WB - Statement Coverage |
 | 81 | Admin route: Should return status code 200 | getTransactionsByUser | Unit | WB - Statement Coverage |
 | 82 | User router: Should return status code 200 | getTransactionsByUser | Unit | WB - Statement Coverage |
 | 83 | Should return status code 400: the username passed as a route parameter does not represent a user in the database | getTransactionsByUser | Unit | WB - Statement Coverage |
 | 84 | Should return status code 401: called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions` | getTransactionsByUser | Unit | WB - Statement Coverage |
 | 85 | Should return status code 401: called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username` | getTransactionsByUser | Unit | WB - Statement Coverage |
 | 86 | Should return status code 200 (admin route) | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
 | 87 | Should return status code 200 (user route) | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
 | 88 | Should return status code 400, user not in the db (admin route) | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
 | 89 | Should return status code 400, user not in the db (user route) | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
 | 90 | Should return status code 400, category not in the db (admin route) | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
 | 91 | Should return status code 400, category not in the db (user route) | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
 | 92 | Should return status code 401, user is not admin (admin route) | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
 | 93 | Should return status code 400, user not the same as route (user route) | getTransactionsByUserByCategory | Unit | WB - Statement Coverage |
 | 94 | Should return status code 200 (admin route) | getTransactionsByGroup | Unit | WB - Statement Coverage |
 | 95 | Should return status code 200 (user route) | getTransactionsByGroup | Unit | WB - Statement Coverage |
 | 96 | Should return status code 400, group not in the db (admin route) | getTransactionsByGroup | Unit | WB - Statement Coverage |
 | 97 | Should return status code 400, group not in the db (user route) | getTransactionsByGroup | Unit | WB - Statement Coverage |
 | 98 | Should return status code 401, user is not admin (admin route) | getTransactionsByGroup | Unit | WB - Statement Coverage |
 | 99 | Should return status code 401, user not in the group (user route) | getTransactionsByGroup | Unit | WB - Statement Coverage |
 | 100 | Should return status code 200 (admin route) | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
 | 101 | Should return status code 200 (user route) | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
 | 102 | Should return status code 400, group not in the db (admin route) | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
 | 103 | Should return status code 400, group not in the db (user route) | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
 | 104 | Should return status code 400, category not in the db (admin route) | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
 | 105 | Should return status code 400, category not in the db (user route) | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
 | 106 | Should return status code 401, user is not an admin (admin route) | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
 | 107 | Should return status code 401, user not in the group (user route) | getTransactionsByGroupByCategory | Unit | WB - Statement Coverage |
 | 108 | Should return status code 200 | deleteTransaction | Unit | WB - Statement Coverage |
 | 109 | Should return status code 400, missing body parameters | deleteTransaction | Unit | WB - Statement Coverage |
 | 110 | Should return status code 400, empty id | deleteTransaction | Unit | WB - Statement Coverage |
 | 111 | Should return status code 400, user not in the db | deleteTransaction | Unit | WB - Statement Coverage |
 | 112 | Should return status code 400, transaction not in the db | deleteTransaction | Unit | WB - Statement Coverage |
 | 113 | Should return status code 400, transaction belong to a different user | deleteTransaction | Unit | WB - Statement Coverage |
 | 114 | Should return status code 401, user is not the same as the route | deleteTransaction | Unit | WB - Statement Coverage |
 | 115 | Should return status code 200 | deleteTransactions | Unit | WB - Statement Coverage |
 | 116 | Should return status code 400, missing body attribute | deleteTransactions | Unit | WB - Statement Coverage |
 | 117 | Should return status code 400, one empty string | deleteTransactions | Unit | WB - Statement Coverage |
 | 118 | Should return status code 400, transaction not in the db | deleteTransactions | Unit | WB - Statement Coverage |
 | 119 | Should return status code 401, user is not an admin | deleteTransactions | Unit | WB - Statement Coverage |
 | 120 | should return empty list if there are no users | getUsers | Unit | WB - Statement Coverage |
 | 121 | should retrieve list of all users | getUsers | Unit | WB - Statement Coverage |
 | 122 | (status 200) should return empty list if there are no users | getUsers | Unit | WB - Statement Coverage |
 | 123 | (status 200) should retrieve list of all users | getUsers | Unit | WB - Statement Coverage |
 | 124 | should return status code 200 | createGroup | Unit | WB - Statement Coverage |
 | 125 | should return status code 400 for incomplete body req | createGroup | Unit | WB - Statement Coverage |
 | 126 | should return status code 400 for empty name in req | createGroup | Unit | WB - Statement Coverage |
 | 127 | should return status code 400 for existing group | createGroup | Unit | WB - Statement Coverage |
 | 128 | should return status code 400 for existing group | createGroup | Unit | WB - Statement Coverage |
 | 129 | should return status code 400 if the caller is in a group | createGroup | Unit | WB - Statement Coverage |
 | 130 | should return status code 400 for email invalid format | createGroup | Unit | WB - Statement Coverage |
 | 131 | should return status code 400 for empty email string | createGroup | Unit | WB - Statement Coverage |
 | 132 | should return status code 400 for duplicated memeber emails | createGroup | Unit | WB - Statement Coverage |
 | 133 | should return status code 401 for unauthenticated user | createGroup | Unit | WB - Statement Coverage |
 | 134 | (status 200) should retrieve another user if i have auth | getUser | Unit | WB - Statement Coverage |
 | 135 | (status 400) user not found, should retreive an error | getUser | Unit | WB - Statement Coverage |
 | 136 | (status 401) no auth | getUser | Unit | WB - Statement Coverage |
 | 137 | should return status 200 | getGroups | Unit | WB - Statement Coverage |
 | 138 | should return status 401 for call by a unauthorized user | getGroups | Unit | WB - Statement Coverage |
 | 139 | (status 200) should return all the group information | getGroup | Unit | WB - Statement Coverage |
 | 140 | (400) group not in the database | getGroup | Unit | WB - Statement Coverage |
 | 141 | (401) group doesnt have auth  | getGroup | Unit | WB - Statement Coverage |
 | 142 | (status 200)[REGULAR] should return all added user | addToGroup | Unit | WB - Statement Coverage |
 | 143 | (400) request body does not contain all the necessary attributes | addToGroup | Unit | WB - Statement Coverage |
 | 144 | (400) group name passed as a route parameter does not represent a group in the database | addToGroup | Unit | WB - Statement Coverage |
 | 145 | (400) if all the provided emails represent users that are already in a group | addToGroup | Unit | WB - Statement Coverage |
 | 146 | (400) if all the provided emails represent users that do not exist in the database | addToGroup | Unit | WB - Statement Coverage |
 | 147 | (400) at least one of the member emails is an empty string | addToGroup | Unit | WB - Statement Coverage |
 | 148 | (401) if called by an authenticated user who is not part of the group (authType = Group) | addToGroup | Unit | WB - Statement Coverage |
 | 149 | (401) if called by an authenticated user who is not an admin (authType = Admin) | addToGroup | Unit | WB - Statement Coverage |
 | 150 | (status 200)[REGULAR] should return group without removed users | removeFromGroup | Unit | WB - Statement Coverage |
 | 151 | (status 200)[ADMIN] should return group without removed users | removeFromGroup | Unit | WB - Statement Coverage |
 | 152 | (400) request body does not contain all the necessary attributes | removeFromGroup | Unit | WB - Statement Coverage |
 | 153 | (400) group name passed as a route parameter does not represent a group in the database | removeFromGroup | Unit | WB - Statement Coverage |
 | 154 | (400) all the provided emails represent users that do not exist in the database | removeFromGroup | Unit | WB - Statement Coverage |
 | 155 | (400) at least one of the emails is not in a valid email format | removeFromGroup | Unit | WB - Statement Coverage |
 | 156 | (400) at least one of the emails is an empty string | removeFromGroup | Unit | WB - Statement Coverage |
 | 157 | (400) the group contains only one member before deleting any user | removeFromGroup | Unit | WB - Statement Coverage |
 | 158 | (401) called by an authenticated user who is not part of the group (authType = Group) | removeFromGroup | Unit | WB - Statement Coverage |
 | 159 | (401) called by an authenticated user who is not admin (authType = Admin) | removeFromGroup | Unit | WB - Statement Coverage |
 | 160 | (status: 200) deletion of user and its group and transactions | deleteUser | Unit | WB - Statement Coverage |
 | 161 | should return status 400 for body without necessary attributes | deleteUser | Unit | WB - Statement Coverage |
 | 162 | Returns a 400 error if the email passed in the request body is an empty string | deleteUser | Unit | WB - Statement Coverage |
 | 163 | Returns a 400 error if the email passed in the request body is not in correct email format | deleteUser | Unit | WB - Statement Coverage |
 | 164 | Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) | deleteUser | Unit | WB - Statement Coverage |
 | 165 | should return status 200 for successful deletion | deleteGroup | Unit | WB - Statement Coverage |
 | 166 | should return status 400 for body without necessary attributes | deleteGroup | Unit | WB - Statement Coverage |
 | 167 | should return status 400 empty string name in the body | deleteGroup | Unit | WB - Statement Coverage |
 | 168 | should return status 400 for a group that is not in the database | deleteGroup | Unit | WB - Statement Coverage |
 | 169 | should return status 401 when called by a user that is not an admin | deleteGroup | Unit | WB - Statement Coverage |
 | 170 | Simple auth: Should return a flag/label setted to true | verifyAuth | Integration | WB - Statement Coverage |
 | 171 | Simple auth: Should return a flag/label setted to false (missing informations) | verifyAuth | Integration | WB - Statement Coverage |
 | 172 | User auth: Should return a flag/label setted to true | verifyAuth | Integration | WB - Statement Coverage |
 | 173 | User auth: Should return a flag/label setted to false (mismatched informations) | verifyAuth | Integration | WB - Statement Coverage |
 | 174 | User auth: Should return a flag/label setted to false (request for a different user) | verifyAuth | Integration | WB - Statement Coverage |
 | 175 | Admin auth: Should return a flag/label setted to true | verifyAuth | Integration | WB - Statement Coverage |
 | 176 | Admin auth: Should return a flag/label setted to false (requested auth for a different role) | verifyAuth | Integration | WB - Statement Coverage |
 | 177 | Group auth: Should return a flag/label setted to true | verifyAuth | Integration | WB - Statement Coverage |
 | 178 | Group auth: Should return a flag/label setted to false (mail of the token not present in the group) | verifyAuth | Integration | WB - Statement Coverage |
 | 179 | Simple auth: Should return a flag/label setted to true and set the new accessToken | verifyAuth | Integration | WB - Statement Coverage |
 | 180 | User auth: Should return a flag/label setted to true and set the new accessToken | verifyAuth | Integration | WB - Statement Coverage |
 | 181 | Admin auth: Should return a flag/label setted to true and set the new accessToken | verifyAuth | Integration | WB - Statement Coverage |
 | 182 | Group auth: Should return a flag/label setted to true and set the new accessToken | verifyAuth | Integration | WB - Statement Coverage |
 | 183 | Error auth: Should return a flag/label setted to false (undefined auth) | verifyAuth | Integration | WB - Statement Coverage |
 | 184 | Error auth: Should return a flag/label setted to false (perform login again) | verifyAuth | Integration | WB - Statement Coverage |
 | 185 | Should return 200 and register the user | register | Integration | WB - Statement Coverage |
 | 186 | Should return 400: the request body does not contain all the necessary attributes | register | Integration | WB - Statement Coverage |
 | 187 | Should return 400: at least one of the parameters in the request body is an empty strings | register | Integration | WB - Statement Coverage |
 | 188 | Should return 400: the email in the request body is not in a valid email format | register | Integration | WB - Statement Coverage |
 | 189 | Should return 400: the username in the request body identifies an already existing use | register | Integration | WB - Statement Coverage |
 | 190 | Should return 400: the email in the request body identifies an already existing user | register | Integration | WB - Statement Coverage |
 | 191 | status 200 and message returned | registerAdmin | Integration | WB - Statement Coverage |
 | 192 | status 400 for missing body content | registerAdmin | Integration | WB - Statement Coverage |
 | 193 | status 400 for empty string body content | registerAdmin | Integration | WB - Statement Coverage |
 | 194 | status 400 for invalid email format | registerAdmin | Integration | WB - Statement Coverage |
 | 195 | status 400 for already existing username | registerAdmin | Integration | WB - Statement Coverage |
 | 196 | status 400 for already existing email | registerAdmin | Integration | WB - Statement Coverage |
 | 197 | [REGULAR](status: 200) should login regular user | login | Integration | WB - Statement Coverage |
 | 198 | (status: 400) if the request body does not contain all the necessary attributes | login | Integration | WB - Statement Coverage |
 | 199 | (status: 400) if the email in the request body is not in a valid email format | login | Integration | WB - Statement Coverage |
 | 200 | (status: 400) if the email in the request body does not identify a user in the database | login | Integration | WB - Statement Coverage |
 | 201 | (status: 400) if the supplied password does not match with the one in the database | login | Integration | WB - Statement Coverage |
 | 202 | (status: 200) logout | logout | Integration | WB - Statement Coverage |
 | 203 | (status: 400) request does not have refresh token | logout | Integration | WB - Statement Coverage |
 | 204 | (status: 400) the refresh token doesnt rappresent user in database | logout | Integration | WB - Statement Coverage |
 | 205 | Should return status code 200 | createCategory | Integration | WB - Statement Coverage |
 | 206 | Should return status code 400, missing parameters | createCategory | Integration | WB - Statement Coverage |
 | 207 | Should return status code 400, parametes has an empty string | createCategory | Integration | WB - Statement Coverage |
 | 208 | Should return status code 400, already existing category | createCategory | Integration | WB - Statement Coverage |
 | 209 | Should return status code 401, the user is not an admin | createCategory | Integration | WB - Statement Coverage |
 | 210 | Should return 200 and update the category | updateCategory | Integration | WB - Statement Coverage |
 | 211 | Should return status code 400: request body does not contain all the necessary attributes | updateCategory | Integration | WB - Statement Coverage |
 | 212 | Should return status code 400: at least one of the parameters in the request body is an empty string | updateCategory | Integration | WB - Statement Coverage |
 | 213 | Should return status code 400: the type of category passed as a route parameter does not represent a category in the database | updateCategory | Integration | WB - Statement Coverage |
 | 214 | Should return status code 400: the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one | updateCategory | Integration | WB - Statement Coverage |
 | 215 | Should return status code 401: called by an authenticated user who is not an admin (authType = Admin) | updateCategory | Integration | WB - Statement Coverage |
 | 216 | Should return 200 and delete the category | deleteCategory | Integration | WB - Statement Coverage |
 | 217 | Should return 200 and delete all the categories mantaining the oldest one | deleteCategory | Integration | WB - Statement Coverage |
 | 218 | Should return status code 400: the request body does not contain all the necessary attributes | deleteCategory | Integration | WB - Statement Coverage |
 | 219 | Should return status code 400: there is only one category in the database | deleteCategory | Integration | WB - Statement Coverage |
 | 220 | Should return status code 400: at least one of the types in the array is an empty string | deleteCategory | Integration | WB - Statement Coverage |
 | 221 | Should return status code 400: the array passed in the request body is empty | deleteCategory | Integration | WB - Statement Coverage |
 | 222 | Should return status code 400: at least one of the types in the array does not represent a category in the database | deleteCategory | Integration | WB - Statement Coverage |
 | 223 | Should return status code 401: called by an authenticated user who is not an admin (authType = Admin) | deleteCategory | Integration | WB - Statement Coverage |
 | 224 | status 200 and correct retrieved categories | getCategories | Integration | WB - Statement Coverage |
 | 225 | Should return status code 200 | createTransaction | Integration | WB - Statement Coverage |
 | 226 | Should return status code 400, missing parameters | createTransaction | Integration | WB - Statement Coverage |
 | 227 | Should return status code 400, empty parameter | createTransaction | Integration | WB - Statement Coverage |
 | 228 | Should return status code 400, category does not exist | createTransaction | Integration | WB - Statement Coverage |
 | 229 | Should return status code 400, users in body and parameter mismatch | createTransaction | Integration | WB - Statement Coverage |
 | 230 | Should return status code 400, users not in the db | createTransaction | Integration | WB - Statement Coverage |
 | 231 | Should return status code 400, amount cannot be parsed | createTransaction | Integration | WB - Statement Coverage |
 | 232 | Should return status code 401, called by different user then route param | createTransaction | Integration | WB - Statement Coverage |
 | 233 | status 200 and correct retrived trasnactions | getAllTransactions | Integration | WB - Statement Coverage |
 | 234 | status 401 for not admin user | getAllTransactions | Integration | WB - Statement Coverage |
 | 235 | (admin) Should return 200 and the list of transactions related to the passed user | getTransactionsByUser | Integration | WB - Statement Coverage |
 | 236 | (user) Should return 200 and the list of transactions related to the passed user | getTransactionsByUser | Integration | WB - Statement Coverage |
 | 237 | Should return 400: the username passed as a route parameter does not represent a user in the database | getTransactionsByUser | Integration | WB - Statement Coverage |
 | 238 | Should return 401: called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions` | getTransactionsByUser | Integration | WB - Statement Coverage |
 | 239 | Should return 401: called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username` | getTransactionsByUser | Integration | WB - Statement Coverage |
 | 240 | (user) Should return 200 and the list of transactions related to the passed user with date filters | getTransactionsByUser | Integration | WB - Statement Coverage |
 | 241 | (user) Should return 200 and the list of transactions related to the passed user with amount filters | getTransactionsByUser | Integration | WB - Statement Coverage |
 | 242 | (user) Should return 200 and the list of transactions related to the passed user with date and amount filters | getTransactionsByUser | Integration | WB - Statement Coverage |
 | 243 | (user) Should return an error if any of the date filters is not a string in date format | getTransactionsByUser | Integration | WB - Statement Coverage |
 | 244 | (user) Should return an error if both date and from/upTo are present | getTransactionsByUser | Integration | WB - Statement Coverage |
 | 245 | Should return status code 200 (admin route) | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
 | 246 | Should return status code 200 (user route) | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
 | 247 | Should return status code 400, user not in the db (admin route) | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
 | 248 | Should return status code 400, user not in the db (user route) | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
 | 249 | Should return status code 400, category not in the db (admin route) | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
 | 250 | Should return status code 400, category not in the db (user route) | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
 | 251 | Should return status code 401, not admin user on admin route | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
 | 252 | Should return status code 401, user differs from one in the route | getTransactionsByUserByCategory | Integration | WB - Statement Coverage |
 | 253 | Should return status code 200 (admin route) | getTransactionsByGroup | Integration | WB - Statement Coverage |
 | 254 | Should return status code 200 (user route) | getTransactionsByGroup | Integration | WB - Statement Coverage |
 | 255 | Should return status code 400, group not in the db (admin route) | getTransactionsByGroup | Integration | WB - Statement Coverage |
 | 256 | Should return status code 400, group not in the db (user route) | getTransactionsByGroup | Integration | WB - Statement Coverage |
 | 257 | Should return status code 401, user not in the group | getTransactionsByGroup | Integration | WB - Statement Coverage |
 | 258 | Should return status code 401, user is not an admin | getTransactionsByGroup | Integration | WB - Statement Coverage |
 | 259 | Should return status code 200 (admin route) | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
 | 260 | Should return status code 200 (user route) | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
 | 261 | Should return status code 400, group not in the db (admin route) | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
 | 262 | Should return status code 400, group not in the db (user route) | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
 | 263 | Should return status code 400, category not in the db (admin route) | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
 | 264 | Should return status code 400, category not in the db (user route) | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
 | 265 | Should return status code 401, user not in the group | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
 | 266 | Should return status code 401, user is not an admin | getTransactionsByGroupByCategory | Integration | WB - Statement Coverage |
 | 267 | Should return status code 200 | deleteTransaction | Integration | WB - Statement Coverage |
 | 268 | Should return status code 400, missing body parameters | deleteTransaction | Integration | WB - Statement Coverage |
 | 269 | Should return status code 400, empty id | deleteTransaction | Integration | WB - Statement Coverage |
 | 270 | Should return status code 400, user not in the db | deleteTransaction | Integration | WB - Statement Coverage |
 | 271 | Should return status code 400, transaction not in the db | deleteTransaction | Integration | WB - Statement Coverage |
 | 272 | Should return status code 400, transaction of a different user | deleteTransaction | Integration | WB - Statement Coverage |
 | 273 | Should return status code 400, user mismatch | deleteTransaction | Integration | WB - Statement Coverage |
 | 274 | Should return status code 200 | deleteTransactions | Integration | WB - Statement Coverage |
 | 275 | Should return status code 400, missing body | deleteTransactions | Integration | WB - Statement Coverage |
 | 276 | Should return status code 400, empty string in ids | deleteTransactions | Integration | WB - Statement Coverage |
 | 277 | Should return status code 400, transaction not in the db | deleteTransactions | Integration | WB - Statement Coverage |
 | 278 | Should return status code 401, user is not an admin | deleteTransactions | Integration | WB - Statement Coverage |
 | 279 | [ADMIN](status: 200) should retrieve list of the only one user | getUsers | Integration | WB - Statement Coverage |
 | 280 | [ADMIN](status: 200) no user in the system, returned empty list | getUsers | Integration | WB - Statement Coverage |
 | 281 | [ADMIN](status: 200) should retrieve list of all users | getUsers | Integration | WB - Statement Coverage |
 | 282 | [REGULAR](status: 401) authError if im authenticated as regular user | getUsers | Integration | WB - Statement Coverage |
 | 283 | [ADMIN](status: 200) should retrieve himself | getUser | Integration | WB - Statement Coverage |
 | 284 | [ADMIN](status: 200) should retrieve another user | getUser | Integration | WB - Statement Coverage |
 | 285 | [REGULAR](status: 200) should retrieve himself | getUser | Integration | WB - Statement Coverage |
 | 286 | [REGULAR](status: 401) should not retrieve other user | getUser | Integration | WB - Statement Coverage |
 | 287 | [ADMIN](status: 400) user not found | getUser | Integration | WB - Statement Coverage |
 | 288 | status 200 and data object correctly computed | createGroup | Integration | WB - Statement Coverage |
 | 289 | status 400 for incorrect body | createGroup | Integration | WB - Statement Coverage |
 | 290 | status 400 for empty group name | createGroup | Integration | WB - Statement Coverage |
 | 291 | status 400 for already present group | createGroup | Integration | WB - Statement Coverage |
 | 292 | status 400 for already used/do not exist emails in a group | createGroup | Integration | WB - Statement Coverage |
 | 293 | status 400 for invalid email format | createGroup | Integration | WB - Statement Coverage |
 | 294 | status 400 for empty member emails with and without blank spaces | createGroup | Integration | WB - Statement Coverage |
 | 295 | status 401 for unauthenticated user | createGroup | Integration | WB - Statement Coverage |
 | 296 | should return status 200 for a call by auth admin | getGroups | Integration | WB - Statement Coverage |
 | 297 | should return status 401 for a call by non admin user | getGroups | Integration | WB - Statement Coverage |
 | 298 | [REGULAR](status: 200) should retrieve group of given user in it | getGroup | Integration | WB - Statement Coverage |
 | 299 | [REGULAR](status: 401) should retrieve error cause im not in the group | getGroup | Integration | WB - Statement Coverage |
 | 300 | [ADMIN](status: 200) should retrieve group where im not in | getGroup | Integration | WB - Statement Coverage |
 | 301 | [ADMIN](status: 400) should retrieve error if group doesnt exist | getGroup | Integration | WB - Statement Coverage |
 | 302 | [REGUALAR](status: 400) should retrieve error if group doesnt exist | getGroup | Integration | WB - Statement Coverage |
 | 303 | [REGULAR](status: 200) should retrieve group of given user in it | addToGroup | Integration | WB - Statement Coverage |
 | 304 | [ADMIN](status: 200) should retrieve group of given user not in it | addToGroup | Integration | WB - Statement Coverage |
 | 305 | [REGULAR](status: 400) the request body does not contain all the necessary attributes | addToGroup | Integration | WB - Statement Coverage |
 | 306 | [REGULAR](status: 400) the request body does not contain all the necessary attributes | addToGroup | Integration | WB - Statement Coverage |
 | 307 | [REGULAR](status: 400) the group name passed as a route parameter does not represent a group in the database | addToGroup | Integration | WB - Statement Coverage |
 | 308 | [REGULAR](status: 400) all the provided emails represent users that are already in a group  | addToGroup | Integration | WB - Statement Coverage |
 | 309 | [REGULAR](status: 400) all the provided emails represent users do not exist in the database  | addToGroup | Integration | WB - Statement Coverage |
 | 310 | [REGULAR](status: 400) at least one of the member emails is not in a valid email format  | addToGroup | Integration | WB - Statement Coverage |
 | 311 | [REGULAR](status: 400) at least one of the member emails is an empty string  | addToGroup | Integration | WB - Statement Coverage |
 | 312 | [REGULAR](status: 401) called by an authenticated user who is not part of the group (authType = Group) | addToGroup | Integration | WB - Statement Coverage |
 | 313 | [REGULAR](status: 401) called by an authenticated user who is not part of the group (authType = Admin) | addToGroup | Integration | WB - Statement Coverage |
 | 314 | [REGULAR](status: 200) should retrieve group of given user in it | removeFromGroup | Integration | WB - Statement Coverage |
 | 315 | [ADMIN](status: 200) should retrieve group of given user not in it | removeFromGroup | Integration | WB - Statement Coverage |
 | 316 | [REGULAR](status: 400) the request body does not contain all the necessary attributes | removeFromGroup | Integration | WB - Statement Coverage |
 | 317 | [REGULAR](status: 400) the group name passed as a route parameter does not represent a group in the database | removeFromGroup | Integration | WB - Statement Coverage |
 | 318 | [REGULAR](status: 400) all the provided emails represent users that do not belong to the group | removeFromGroup | Integration | WB - Statement Coverage |
 | 319 | [REGULAR](status: 400) all the provided emails represent users do not exist in the database  | removeFromGroup | Integration | WB - Statement Coverage |
 | 320 | [REGULAR](status: 400) at least one of the member emails is not in a valid email format  | removeFromGroup | Integration | WB - Statement Coverage |
 | 321 | [REGULAR](status: 400) at least one of the member emails is an empty string | removeFromGroup | Integration | WB - Statement Coverage |
 | 322 | [REGULAR](status: 400) if the group contains only one member before deleting any user | removeFromGroup | Integration | WB - Statement Coverage |
 | 323 | (status: 401) called by an authenticated user who is not part of the group (authType = Group) | removeFromGroup | Integration | WB - Statement Coverage |
 | 324 | (status: 401) called by an authenticated user who is not part of the group (authType = Admin) | removeFromGroup | Integration | WB - Statement Coverage |
 | 325 | (status 200) should delete one user (no transaction, no group)  | removeFromGroup | Integration | WB - Statement Coverage |
 | 326 | (status 200) should delete one user and group | removeFromGroup | Integration | WB - Statement Coverage |
 | 327 | (status 200) should delete one user with one transaction | removeFromGroup | Integration | WB - Statement Coverage |
 | 328 | should return status 400 for a call with wrong body property | removeFromGroup | Integration | WB - Statement Coverage |
 | 329 | Returns a 400 error if the email passed in the request body is an empty string | removeFromGroup | Integration | WB - Statement Coverage |
 | 330 | Returns a 400 error if the email passed in the request body is not in correct email format | removeFromGroup | Integration | WB - Statement Coverage |
 | 331 | Returns a 400 error if the email passed in the request body does not represent a user in the database | removeFromGroup | Integration | WB - Statement Coverage |
 | 332 | Returns a 400 error if the email passed in the request body does not represent a user in the database | removeFromGroup | Integration | WB - Statement Coverage |
 | 333 | should return status 200 for a sequence of deletion | deleteGroup | Integration | WB - Statement Coverage |
 | 334 | should return status 400 for a call with wrong body property | deleteGroup | Integration | WB - Statement Coverage |
 | 335 | should return status 400 for a call with empty stirng body(with spaces) | deleteGroup | Integration | WB - Statement Coverage |
 | 336 | should return status 400 for a call with body that does not represent a group in db | deleteGroup | Integration | WB - Statement Coverage |
 | 337 | should return status 401 for non admin call | deleteGroup | Integration | WB - Statement Coverage |





# Coverage



## Coverage of FR

<Report in the following table the coverage of  functional requirements (from official requirements) >

| Functional Requirements covered |   Test(s) | 
| ------------------------------- | ----------- | 
| FR11 (register)                           |  |
| FR12 (login)                              |  |
| FR13 (logout)                             |  |
| FR14 (registerAdmin)                      |  |
| FR15 (getUsers)                           |  |
| FR16 (getUser)                            |  |
| FR17 (deleteUser)                         |  |
| FR21 (createGroup)                        |  |
| FR22 (getGroups)                          |  |
| FR23 (getGroup)                           |  |
| FR24 (addToGroup)                         |  |
| FR26 (removeFromGroup)                    |  |
| FR28 (deleteGroup)                        |  |
| FR31 (createTransaction)                  |  |
| FR32 (getAllTransactions)                 |  |
| FR33 (getTransactionsByUser)              |  |
| FR34 (getTransactionsByUserByCategory)    |  |
| FR35 (getTransactionsByGroup)             |  |
| FR36 (getTransactionsByGroupByCategory)   |  |
| FR37 (deleteTransaction)                  |  |
| FR38 (deleteTransactions)                 |  |
| FR41 (createCategory)                     |  |
| FR42 (updateCategory)                     |  |
| FR43 (deleteCategory)                     |  |
| FR44 (getCategories)                      |  |
|	FR11 (register)	| 	Should return status code 200 - Unit	|
|	     	| 	Should return status code 400: the request body does not contain all the necessary attributes - Unit	|
|	     	| 	Should return status code 400: at least one of the parameters in the request body is an empty string - Unit	|
|	     	| 	Should return status code 400: the email in the request body is not in a valid email format - Unit	|
|	     	| 	Should return status code 400: the username in the request body identifies an already existing user - Unit	|
|	     	| 	Should return status code 400: the email in the request body identifies an already existing user - Unit	|
|	     	| 	Should return 200 and register the user - Integration	|
|	     	| 	Should return 400: the request body does not contain all the necessary attributes - Integration	|
|	     	| 	Should return 400: at least one of the parameters in the request body is an empty strings - Integration	|
|	     	| 	Should return 400: the email in the request body is not in a valid email format - Integration	|
|	     	| 	Should return 400: the username in the request body identifies an already existing use - Integration	|
|	     	| 	Should return 400: the email in the request body identifies an already existing user - Integration	|
|	FR14 (registerAdmin)	| 	status 200 when successful creates an admin - Unit	|
|	     	| 	status 400 req does not contain all inputs - Unit	|
|	     	| 	status 400 if req contains an empty param - Unit	|
|	     	| 	status 400 if email is not valid - Unit	|
|	     	| 	status 400 if there is an already existing email - Unit	|
|	     	| 	status 400 if there is an already existing username - Unit	|
|	     	| 	status 200 and message returned - Integration	|
|	     	| 	status 400 for missing body content - Integration	|
|	     	| 	status 400 for empty string body content - Integration	|
|	     	| 	status 400 for invalid email format - Integration	|
|	     	| 	status 400 for already existing username - Integration	|
|	     	| 	status 400 for already existing email - Integration	|
|	FR12 (login)	| 	should return 200 for correct login - Unit	|
|	     	| 	should return 400 if the request body does not contain all the necessary attributes - Unit	|
|	     	| 	should return 400 if at least one of the parameters in the request body is an empty string - Unit	|
|	     	| 	should return 400 if the email in the request body is not in a valid email format - Unit	|
|	     	| 	[REGULAR](status: 200) should login regular user - Integration	|
|	     	| 	(status: 400) if the request body does not contain all the necessary attributes - Integration	|
|	     	| 	(status: 400) if the email in the request body is not in a valid email format - Integration	|
|	     	| 	(status: 400) if the email in the request body does not identify a user in the database - Integration	|
|	     	| 	(status: 400) if the supplied password does not match with the one in the database - Integration	|
|	FR13 (logout)	| 	200 logout - Unit	|
|	     	| 	400 logout - Unit	|
|	     	| 	(status: 200) logout - Integration	|
|	     	| 	(status: 400) request does not have refresh token - Integration	|
|	     	| 	(status: 400) the refresh token doesnt rappresent user in database - Integration	|
|	FR41 (createCategory)	| 	Should return status code 200 - Unit	|
|	     	| 	Should return status code 400, missing parameters - Unit	|
|	     	| 	Should return status code 400, a parameter has an empty string - Unit	|
|	     	| 	Should return status code 400, already existing category - Unit	|
|	     	| 	Should return status code 401, the user is not an admin - Unit	|
|	     	| 	Should return status code 200 - Integration	|
|	     	| 	Should return status code 400, missing parameters - Integration	|
|	     	| 	Should return status code 400, parametes has an empty string - Integration	|
|	     	| 	Should return status code 400, already existing category - Integration	|
|	     	| 	Should return status code 401, the user is not an admin - Integration	|
|	FR42 (updateCategory)	| 	Should return status code 200 - Unit	|
|	     	| 	Should return status code 400: request body does not contain all the necessary attributes - Unit	|
|	     	| 	Should return status code 400: at least one of the parameters in the request body is an empty string - Unit	|
|	     	| 	Should return status code 400: the type of category passed as a route parameter does not represent a category in the database - Unit	|
|	     	| 	Should return status code 400: the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one - Unit	|
|	     	| 	Should return status code 401: called by an authenticated user who is not an admin (authType = Admin) - Unit	|
|	     	| 	Should return 200 and update the category - Integration	|
|	     	| 	Should return status code 400: request body does not contain all the necessary attributes - Integration	|
|	     	| 	Should return status code 400: at least one of the parameters in the request body is an empty string - Integration	|
|	     	| 	Should return status code 400: the type of category passed as a route parameter does not represent a category in the database - Integration	|
|	     	| 	Should return status code 400: the type of category passed in the request body as the new type represents an already existing category in the database and that category is not the same as the requested one - Integration	|
|	     	| 	Should return status code 401: called by an authenticated user who is not an admin (authType = Admin) - Integration	|
|	FR43 (deleteCategory)	| 	Should return status code 200 - Unit	|
|	     	| 	Should return status code 200 having categories in the database equal to the categories to be deleted - Unit	|
|	     	| 	Should return status code 400: the request body does not contain all the necessary attributes - Unit	|
|	     	| 	Should return status code 400: there is only one category in the database - Unit	|
|	     	| 	Should return status code 400: at least one of the types in the array is an empty string - Unit	|
|	     	| 	Should return status code 400: the array passed in the request body is empty - Unit	|
|	     	| 	Should return status code 400: at least one of the types in the array does not represent a category in the database - Unit	|
|	     	| 	Should return status code 401: called by an authenticated user who is not an admin (authType = Admin) - Unit	|
|	     	| 	Should return 200 and delete the category - Integration	|
|	     	| 	Should return 200 and delete all the categories mantaining the oldest one - Integration	|
|	     	| 	Should return status code 400: the request body does not contain all the necessary attributes - Integration	|
|	     	| 	Should return status code 400: there is only one category in the database - Integration	|
|	     	| 	Should return status code 400: at least one of the types in the array is an empty string - Integration	|
|	     	| 	Should return status code 400: the array passed in the request body is empty - Integration	|
|	     	| 	Should return status code 400: at least one of the types in the array does not represent a category in the database - Integration	|
|	     	| 	Should return status code 401: called by an authenticated user who is not an admin (authType = Admin) - Integration	|
|	FR44 (getCategories)	| 	return status 200 and correct data - Unit	|
|	     	| 	return status 200 and empty data with empty db - Unit	|
|	     	| 	return status 401 for not admin call - Unit	|
|	     	| 	status 200 and correct retrieved categories - Integration	|
|	FR31 (createTransaction)	| 	Should return status code 200 - Unit	|
|	     	| 	Should return status code 400, missing parameters - Unit	|
|	     	| 	Should return status code 400, empty string - Unit	|
|	     	| 	Should return status code 400, category not present - Unit	|
|	     	| 	Should return status code 400, user in body mismatch user in params - Unit	|
|	     	| 	Should return status code 400, user not in the db - Unit	|
|	     	| 	Should return status code 400, amount cannot be parsed - Unit	|
|	     	| 	Should return status code 401, called by different user then route param - Unit	|
|	     	| 	Should return status code 200 - Integration	|
|	     	| 	Should return status code 400, missing parameters - Integration	|
|	     	| 	Should return status code 400, empty parameter - Integration	|
|	     	| 	Should return status code 400, category does not exist - Integration	|
|	     	| 	Should return status code 400, users in body and parameter mismatch - Integration	|
|	     	| 	Should return status code 400, users not in the db - Integration	|
|	     	| 	Should return status code 400, amount cannot be parsed - Integration	|
|	     	| 	Should return status code 401, called by different user then route param - Integration	|
|	FR32 (getAllTransactions)	| 	return status 200 and correct data - Unit	|
|	     	| 	return status 401 for not admin call - Unit	|
|	     	| 	status 200 and correct retrived trasnactions - Integration	|
|	     	| 	status 401 for not admin user - Integration	|
|	FR33 (getTransactionsByUser)	| 	Admin route: Should return status code 200 - Unit	|
|	     	| 	User router: Should return status code 200 - Unit	|
|	     	| 	Should return status code 400: the username passed as a route parameter does not represent a user in the database - Unit	|
|	     	| 	Should return status code 401: called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions` - Unit	|
|	     	| 	Should return status code 401: called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username` - Unit	|
|	     	| 	(admin) Should return 200 and the list of transactions related to the passed user - Integration	|
|	     	| 	(user) Should return 200 and the list of transactions related to the passed user - Integration	|
|	     	| 	Should return 400: the username passed as a route parameter does not represent a user in the database - Integration	|
|	     	| 	Should return 401: called by an authenticated user who is not the same user as the one in the route (authType = User) if the route is `/api/users/:username/transactions` - Integration	|
|	     	| 	Should return 401: called by an authenticated user who is not an admin (authType = Admin) if the route is `/api/transactions/users/:username` - Integration	|
|	     	| 	(user) Should return 200 and the list of transactions related to the passed user with date filters - Integration	|
|	     	| 	(user) Should return 200 and the list of transactions related to the passed user with amount filters - Integration	|
|	     	| 	(user) Should return 200 and the list of transactions related to the passed user with date and amount filters - Integration	|
|	     	| 	(user) Should return an error if any of the date filters is not a string in date format - Integration	|
|	     	| 	(user) Should return an error if both date and from/upTo are present - Integration	|
|	FR34 (getTransactionsByUserByCategory)	| 	Should return status code 200 (admin route) - Unit	|
|	     	| 	Should return status code 200 (user route) - Unit	|
|	     	| 	Should return status code 400, user not in the db (admin route) - Unit	|
|	     	| 	Should return status code 400, user not in the db (user route) - Unit	|
|	     	| 	Should return status code 400, category not in the db (admin route) - Unit	|
|	     	| 	Should return status code 400, category not in the db (user route) - Unit	|
|	     	| 	Should return status code 401, user is not admin (admin route) - Unit	|
|	     	| 	Should return status code 400, user not the same as route (user route) - Unit	|
|	     	| 	Should return status code 200 (admin route) - Integration	|
|	     	| 	Should return status code 200 (user route) - Integration	|
|	     	| 	Should return status code 400, user not in the db (admin route) - Integration	|
|	     	| 	Should return status code 400, user not in the db (user route) - Integration	|
|	     	| 	Should return status code 400, category not in the db (admin route) - Integration	|
|	     	| 	Should return status code 400, category not in the db (user route) - Integration	|
|	     	| 	Should return status code 401, not admin user on admin route - Integration	|
|	     	| 	Should return status code 401, user differs from one in the route - Integration	|
|	FR35 (getTransactionsByGroup)	| 	Should return status code 200 (admin route) - Unit	|
|	     	| 	Should return status code 200 (user route) - Unit	|
|	     	| 	Should return status code 400, group not in the db (admin route) - Unit	|
|	     	| 	Should return status code 400, group not in the db (user route) - Unit	|
|	     	| 	Should return status code 401, user is not admin (admin route) - Unit	|
|	     	| 	Should return status code 401, user not in the group (user route) - Unit	|
|	     	| 	Should return status code 200 (admin route) - Integration	|
|	     	| 	Should return status code 200 (user route) - Integration	|
|	     	| 	Should return status code 400, group not in the db (admin route) - Integration	|
|	     	| 	Should return status code 400, group not in the db (user route) - Integration	|
|	     	| 	Should return status code 401, user not in the group - Integration	|
|	     	| 	Should return status code 401, user is not an admin - Integration	|
|	FR36 (getTransactionsByGroupByCategory)	| 	Should return status code 200 (admin route) - Unit	|
|	     	| 	Should return status code 200 (user route) - Unit	|
|	     	| 	Should return status code 400, group not in the db (admin route) - Unit	|
|	     	| 	Should return status code 400, group not in the db (user route) - Unit	|
|	     	| 	Should return status code 400, category not in the db (admin route) - Unit	|
|	     	| 	Should return status code 400, category not in the db (user route) - Unit	|
|	     	| 	Should return status code 401, user is not an admin (admin route) - Unit	|
|	     	| 	Should return status code 401, user not in the group (user route) - Unit	|
|	     	| 	Should return status code 200 (admin route) - Integration	|
|	     	| 	Should return status code 200 (user route) - Integration	|
|	     	| 	Should return status code 400, group not in the db (admin route) - Integration	|
|	     	| 	Should return status code 400, group not in the db (user route) - Integration	|
|	     	| 	Should return status code 400, category not in the db (admin route) - Integration	|
|	     	| 	Should return status code 400, category not in the db (user route) - Integration	|
|	     	| 	Should return status code 401, user not in the group - Integration	|
|	     	| 	Should return status code 401, user is not an admin - Integration	|
|	FR37 (deleteTransaction)	| 	Should return status code 200 - Unit	|
|	     	| 	Should return status code 400, missing body parameters - Unit	|
|	     	| 	Should return status code 400, empty id - Unit	|
|	     	| 	Should return status code 400, user not in the db - Unit	|
|	     	| 	Should return status code 400, transaction not in the db - Unit	|
|	     	| 	Should return status code 400, transaction belong to a different user - Unit	|
|	     	| 	Should return status code 401, user is not the same as the route - Unit	|
|	     	| 	Should return status code 200 - Integration	|
|	     	| 	Should return status code 400, missing body parameters - Integration	|
|	     	| 	Should return status code 400, empty id - Integration	|
|	     	| 	Should return status code 400, user not in the db - Integration	|
|	     	| 	Should return status code 400, transaction not in the db - Integration	|
|	     	| 	Should return status code 400, transaction of a different user - Integration	|
|	     	| 	Should return status code 400, user mismatch - Integration	|
|	FR38 (deleteTransactions)	| 	Should return status code 200 - Unit	|
|	     	| 	Should return status code 400, missing body attribute - Unit	|
|	     	| 	Should return status code 400, one empty string - Unit	|
|	     	| 	Should return status code 400, transaction not in the db - Unit	|
|	     	| 	Should return status code 401, user is not an admin - Unit	|
|	     	| 	Should return status code 200 - Integration	|
|	     	| 	Should return status code 400, missing body - Integration	|
|	     	| 	Should return status code 400, empty string in ids - Integration	|
|	     	| 	Should return status code 400, transaction not in the db - Integration	|
|	     	| 	Should return status code 401, user is not an admin - Integration	|
|	FR15 (getUsers)	| 	should return empty list if there are no users - Unit	|
|	     	| 	should retrieve list of all users - Unit	|
|	     	| 	(status 200) should return empty list if there are no users - Unit	|
|	     	| 	(status 200) should retrieve list of all users - Unit	|
|	     	| 	[ADMIN](status: 200) should retrieve list of the only one user - Integration	|
|	     	| 	[ADMIN](status: 200) no user in the system, returned empty list - Integration	|
|	     	| 	[ADMIN](status: 200) should retrieve list of all users - Integration	|
|	     	| 	[REGULAR](status: 401) authError if im authenticated as regular user - Integration	|
|	FR21 (createGroup)	| 	should return status code 200 - Unit	|
|	     	| 	should return status code 400 for incomplete body req - Unit	|
|	     	| 	should return status code 400 for empty name in req - Unit	|
|	     	| 	should return status code 400 for existing group - Unit	|
|	     	| 	should return status code 400 for existing group - Unit	|
|	     	| 	should return status code 400 if the caller is in a group - Unit	|
|	     	| 	should return status code 400 for email invalid format - Unit	|
|	     	| 	should return status code 400 for empty email string - Unit	|
|	     	| 	should return status code 400 for duplicated memeber emails - Unit	|
|	     	| 	should return status code 401 for unauthenticated user - Unit	|
|	     	| 	status 200 and data object correctly computed - Integration	|
|	     	| 	status 400 for incorrect body - Integration	|
|	     	| 	status 400 for empty group name - Integration	|
|	     	| 	status 400 for already present group - Integration	|
|	     	| 	status 400 for already used/do not exist emails in a group - Integration	|
|	     	| 	status 400 for invalid email format - Integration	|
|	     	| 	status 400 for empty member emails with and without blank spaces - Integration	|
|	     	| 	status 401 for unauthenticated user - Integration	|
|	FR16 (getUser)	| 	(status 200) should retrieve another user if i have auth - Unit	|
|	     	| 	(status 400) user not found, should retreive an error - Unit	|
|	     	| 	(status 401) no auth - Unit	|
|	     	| 	[ADMIN](status: 200) should retrieve himself - Integration	|
|	     	| 	[ADMIN](status: 200) should retrieve another user - Integration	|
|	     	| 	[REGULAR](status: 200) should retrieve himself - Integration	|
|	     	| 	[REGULAR](status: 401) should not retrieve other user - Integration	|
|	     	| 	[ADMIN](status: 400) user not found - Integration	|
|	FR22 (getGroups)	| 	should return status 200 - Unit	|
|	     	| 	should return status 401 for call by a unauthorized user - Unit	|
|	     	| 	should return status 200 for a call by auth admin - Integration	|
|	     	| 	should return status 401 for a call by non admin user - Integration	|
|	FR23 (getGroup)	| 	(status 200) should return all the group information - Unit	|
|	     	| 	(400) group not in the database - Unit	|
|	     	| 	(401) group doesnt have auth  - Unit	|
|	     	| 	[REGULAR](status: 200) should retrieve group of given user in it - Integration	|
|	     	| 	[REGULAR](status: 401) should retrieve error cause im not in the group - Integration	|
|	     	| 	[ADMIN](status: 200) should retrieve group where im not in - Integration	|
|	     	| 	[ADMIN](status: 400) should retrieve error if group doesnt exist - Integration	|
|	     	| 	[REGUALAR](status: 400) should retrieve error if group doesnt exist - Integration	|
|	FR24 (addToGroup)	| 	(status 200)[REGULAR] should return all added user - Unit	|
|	     	| 	(400) request body does not contain all the necessary attributes - Unit	|
|	     	| 	(400) group name passed as a route parameter does not represent a group in the database - Unit	|
|	     	| 	(400) if all the provided emails represent users that are already in a group - Unit	|
|	     	| 	(400) if all the provided emails represent users that do not exist in the database - Unit	|
|	     	| 	(400) at least one of the member emails is an empty string - Unit	|
|	     	| 	(401) if called by an authenticated user who is not part of the group (authType = Group) - Unit	|
|	     	| 	(401) if called by an authenticated user who is not an admin (authType = Admin) - Unit	|
|	     	| 	[REGULAR](status: 200) should retrieve group of given user in it - Integration	|
|	     	| 	[ADMIN](status: 200) should retrieve group of given user not in it - Integration	|
|	     	| 	[REGULAR](status: 400) the request body does not contain all the necessary attributes - Integration	|
|	     	| 	[REGULAR](status: 400) the request body does not contain all the necessary attributes - Integration	|
|	     	| 	[REGULAR](status: 400) the group name passed as a route parameter does not represent a group in the database - Integration	|
|	     	| 	[REGULAR](status: 400) all the provided emails represent users that are already in a group  - Integration	|
|	     	| 	[REGULAR](status: 400) all the provided emails represent users do not exist in the database  - Integration	|
|	     	| 	[REGULAR](status: 400) at least one of the member emails is not in a valid email format  - Integration	|
|	     	| 	[REGULAR](status: 400) at least one of the member emails is an empty string  - Integration	|
|	     	| 	[REGULAR](status: 401) called by an authenticated user who is not part of the group (authType = Group) - Integration	|
|	     	| 	[REGULAR](status: 401) called by an authenticated user who is not part of the group (authType = Admin) - Integration	|
|	FR26 (removeFromGroup)	| 	(status 200)[REGULAR] should return group without removed users - Unit	|
|	     	| 	(status 200)[ADMIN] should return group without removed users - Unit	|
|	     	| 	(400) request body does not contain all the necessary attributes - Unit	|
|	     	| 	(400) group name passed as a route parameter does not represent a group in the database - Unit	|
|	     	| 	(400) all the provided emails represent users that do not exist in the database - Unit	|
|	     	| 	(400) at least one of the emails is not in a valid email format - Unit	|
|	     	| 	(400) at least one of the emails is an empty string - Unit	|
|	     	| 	(400) the group contains only one member before deleting any user - Unit	|
|	     	| 	(401) called by an authenticated user who is not part of the group (authType = Group) - Unit	|
|	     	| 	(401) called by an authenticated user who is not admin (authType = Admin) - Unit	|
|	     	| 	[REGULAR](status: 200) should retrieve group of given user in it - Integration	|
|	     	| 	[ADMIN](status: 200) should retrieve group of given user not in it - Integration	|
|	     	| 	[REGULAR](status: 400) the request body does not contain all the necessary attributes - Integration	|
|	     	| 	[REGULAR](status: 400) the group name passed as a route parameter does not represent a group in the database - Integration	|
|	     	| 	[REGULAR](status: 400) all the provided emails represent users that do not belong to the group - Integration	|
|	     	| 	[REGULAR](status: 400) all the provided emails represent users do not exist in the database  - Integration	|
|	     	| 	[REGULAR](status: 400) at least one of the member emails is not in a valid email format  - Integration	|
|	     	| 	[REGULAR](status: 400) at least one of the member emails is an empty string - Integration	|
|	     	| 	[REGULAR](status: 400) if the group contains only one member before deleting any user - Integration	|
|	     	| 	(status: 401) called by an authenticated user who is not part of the group (authType = Group) - Integration	|
|	     	| 	(status: 401) called by an authenticated user who is not part of the group (authType = Admin) - Integration	|
|	     	| 	(status 200) should delete one user (no transaction, no group)  - Integration	|
|	     	| 	(status 200) should delete one user and group - Integration	|
|	     	| 	(status 200) should delete one user with one transaction - Integration	|
|	     	| 	should return status 400 for a call with wrong body property - Integration	|
|	     	| 	Returns a 400 error if the email passed in the request body is an empty string - Integration	|
|	     	| 	Returns a 400 error if the email passed in the request body is not in correct email format - Integration	|
|	     	| 	Returns a 400 error if the email passed in the request body does not represent a user in the database - Integration	|
|	     	| 	Returns a 400 error if the email passed in the request body does not represent a user in the database - Integration	|
|	FR17 (deleteUser)	| 	(status: 200) deletion of user and its group and transactions - Unit	|
|	     	| 	should return status 400 for body without necessary attributes - Unit	|
|	     	| 	Returns a 400 error if the email passed in the request body is an empty string - Unit	|
|	     	| 	Returns a 400 error if the email passed in the request body is not in correct email format - Unit	|
|	     	| 	Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin) - Unit	|
|	FR28 (deleteGroup)	| 	should return status 200 for successful deletion - Unit	|
|	     	| 	should return status 400 for body without necessary attributes - Unit	|
|	     	| 	should return status 400 empty string name in the body - Unit	|
|	     	| 	should return status 400 for a group that is not in the database - Unit	|
|	     	| 	should return status 401 when called by a user that is not an admin - Unit	|
|	     	| 	should return status 200 for a sequence of deletion - Integration	|
|	     	| 	should return status 400 for a call with wrong body property - Integration	|
|	     	| 	should return status 400 for a call with empty stirng body(with spaces) - Integration	|
|	     	| 	should return status 400 for a call with body that does not represent a group in db - Integration	|
|	     	| 	should return status 401 for non admin call - Integration	|



## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage 






