import request from 'supertest';
import { app } from '../app';
import { Group, User } from '../models/User.js';
import {getUsers, 
  getUser, 
  createGroup, 
  getGroups, 
  getGroup,
  addToGroup,
  removeFromGroup,
  deleteGroup, 
  deleteUser
  } from '../controllers/users';
import { verifyAuth, verifyEmail } from '../controllers/utils';
import jwt, { verify } from 'jsonwebtoken'
import { compare } from 'bcryptjs';
import { transactions } from '../models/model';

/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js")
jest.mock("../models/model.js");
jest.mock("../controllers/utils.js");
jest.mock("jsonwebtoken")


jest.mock("../controllers/utils.js");
/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  jest.clearAllMocks();
  //additional `mockClear()` must be placed here
});

jest.mock('../controllers/utils.js', () => ({
  verifyAuth: jest.fn(),
  verifyEmail: jest.fn()
}))



/* OLD (INCORRECT) VERSION
describe("getUsers", () => {
  test("should return empty list if there are no users", async () => {
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    jest.spyOn(User, "find").mockImplementation(() => [])
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  test("should retrieve list of all users", async () => {
    const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }, { username: 'test2', email: 'test2@example.com', password: 'hashedPassword2' }]
    jest.spyOn(User, "find").mockImplementation(() => retrievedUsers)
    const response = await request(app)
      .get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toEqual(retrievedUsers)
  })
})*/

describe("getUsers", () => {
  test("(status 200) should return empty list if there are no users", async () => {
    const mockReq = {
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    jest.spyOn(User, "find").mockResolvedValue([])
    await getUsers(mockReq, mockRes)
    expect(User.find).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: [], refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })

  test("(status 200) should retrieve list of all users", async () => {
    const mockReq = {}
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }

    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
  
    const retrievedUsers = [{username: "Mario", email: "mario.red@email.com", role: "Regular"}, {username: "Luigi", email: "luigi.red@email.com", role: "Regular"}, {username: "admin", email: "admin@email.com", role: "Regular"} ]
    
    jest.spyOn(User, "find").mockResolvedValue(retrievedUsers) //Quando viene chiamato find su User viene simulata la risposta di un valore dato ovvero il retrievedUsers
    await getUsers(mockReq, mockRes)
    
    expect(User.find).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: retrievedUsers, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })
})

describe("createGroup", () => { 

  test("should return status code 200", async () => {
    const mockReq = {
      body: {name: "Family", memberEmails: ["mario.red@email.com", "luigi.red@email.com","francesco@email.com"]},
      cookies: { accessToken: "some", refreshToken: "some" }
  }
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    locals: {
      refreshedTokenMessage: "expired token"
    }
  }
  
  verifyAuth.mockImplementation(() => {
    return { authorized: true, cause: "Authorized" }
  });
  verifyEmail.mockReturnValue(true);
  const existingGroup = false;
  const inAGroup = false;
  const calleeUser = {_id: 123456};
  const user1 = {_id: 1};
  const user2 = {_id: 2};
  const decodedAccessToken = {email: "io@email.com"}  

  jest.spyOn(jwt, "verify").mockReturnValue(decodedAccessToken); 

  Group.findOne.mockResolvedValueOnce(existingGroup);
  Group.findOne.mockResolvedValueOnce(inAGroup);

  User.findOne.mockResolvedValueOnce(calleeUser);

 
  User.findOne.mockResolvedValueOnce(user1);
  Group.findOne.mockResolvedValueOnce(inAGroup);

  
  User.findOne.mockResolvedValueOnce(user2);
  Group.findOne.mockResolvedValueOnce(inAGroup);
  
  
  User.findOne.mockResolvedValueOnce(null);
      

  await createGroup(mockReq, mockRes);                       
  expect(mockRes.status).toHaveBeenCalledWith(200)
  expect(mockRes.json).toHaveBeenCalledWith({data: {group: {name: "Family", 
                                              members: [{email: "io@email.com"},
                                              {email: "mario.red@email.com"}, 
                                              {email: "luigi.red@email.com"}]}, 
                                              membersNotFound: [{email: "francesco@email.com"}],
                                               alreadyInGroup: []},
                                               refreshedTokenMessage: "expired token"});

  });

  test("should return status code 400 for incomplete body req", async () => {
    const mockReq = {
      body: {other: "Family", memberEmails: ["mario.red@email.com", "luigi.red@email.com","francesco@email.com"]},
      cookies: { accessToken: "some", refreshToken: "some" }
  }
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    locals: {
      refreshedTokenMessage: "expired token"
    }
  }
  
  verifyAuth.mockImplementation(() => {
    return { authorized: true, cause: "Authorized" }
  });
  verifyEmail.mockReturnValue(true);
  const existingGroup = false;
  const inAGroup = false;
  const calleeUser = {_id: 123456};
  const user1 = {_id: 1};
  const user2 = {_id: 2};
  const decodedAccessToken = {email: "io@email.com"}  

  jest.spyOn(jwt, "verify").mockReturnValue(decodedAccessToken); 
      

  await createGroup(mockReq, mockRes);                       
  expect(mockRes.status).toHaveBeenCalledWith(400)
  expect(mockRes.json).toHaveBeenCalledWith({error: "Missing parameters"});
  });

  test("should return status code 400 for empty name in req", async () => {
    const mockReq = {
      body: {name: "   ", memberEmails: ["mario.red@email.com", "luigi.red@email.com","francesco@email.com"]},
      cookies: { accessToken: "some", refreshToken: "some" }
  }
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    locals: {
      refreshedTokenMessage: "expired token"
    }
  }
  
  verifyAuth.mockImplementation(() => {
    return { authorized: true, cause: "Authorized" }
  });
  verifyEmail.mockReturnValue(true);
  const existingGroup = false;
  const inAGroup = false;
  const calleeUser = {_id: 123456};
  const user1 = {_id: 1};
  const user2 = {_id: 2};
  const decodedAccessToken = {email: "io@email.com"}  

  jest.spyOn(jwt, "verify").mockReturnValue(decodedAccessToken); 
      

  await createGroup(mockReq, mockRes);                       
  expect(mockRes.status).toHaveBeenCalledWith(400)
  expect(mockRes.json).toHaveBeenCalledWith({error: "Missing parameters"});
  });

  test("should return status code 400 for existing group", async () => {
    const mockReq = {
      body: {name: "Fun", memberEmails: ["mario.red@email.com", "luigi.red@email.com","francesco@email.com"]},
      cookies: { accessToken: "some", refreshToken: "some" }
  }
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    locals: {
      refreshedTokenMessage: "expired token"
    }
  }
  
  verifyAuth.mockImplementation(() => {
    return { authorized: true, cause: "Authorized" }
  });
  verifyEmail.mockReturnValue(true);
  const existingGroup = true;
  const inAGroup = false;
  const calleeUser = {_id: 123456};
  const user1 = {_id: 1};
  const user2 = {_id: 2};
  const decodedAccessToken = {email: "io@email.com"}  

  jest.spyOn(jwt, "verify").mockReturnValue(decodedAccessToken); 
      
  Group.findOne.mockResolvedValueOnce(existingGroup);
  await createGroup(mockReq, mockRes);                       
  expect(mockRes.status).toHaveBeenCalledWith(400)
  expect(mockRes.json).toHaveBeenCalledWith({ error: "already existing group with the same name" });
  });

  test("should return status code 400 for existing group", async () => {
    const mockReq = {
      body: {name: "Fun", memberEmails: ["mario.red@email.com", "luigi.red@email.com","francesco@email.com"]},
      cookies: { accessToken: "some", refreshToken: "some" }
  }
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    locals: {
      refreshedTokenMessage: "expired token"
    }
  }
  
  verifyAuth.mockImplementation(() => {
    return { authorized: true, cause: "Authorized" }
  });
  verifyEmail.mockReturnValue(true);
  const existingGroup = false;
  const inAGroup = true;
  const calleeUser = {_id: 123456};
  const user1 = {_id: 1};
  const user2 = {_id: 2};
  const decodedAccessToken = {email: "io@email.com"}  

  jest.spyOn(jwt, "verify").mockReturnValue(decodedAccessToken); 
      
  Group.findOne.mockResolvedValueOnce(existingGroup);
  Group.findOne.mockResolvedValueOnce(false);

  User.findOne.mockResolvedValueOnce(calleeUser);

 
  User.findOne.mockResolvedValueOnce(user1);
  Group.findOne.mockResolvedValueOnce(inAGroup);

  
  User.findOne.mockResolvedValueOnce(user2);
  Group.findOne.mockResolvedValueOnce(inAGroup);
  
  
  User.findOne.mockResolvedValueOnce(null);

  await createGroup(mockReq, mockRes);                       
  expect(mockRes.status).toHaveBeenCalledWith(400)
  expect(mockRes.json).toHaveBeenCalledWith({ error: "all the `memberEmails` either do not exist or are already in a group" });
  });

  test("should return status code 400 if the caller is in a group", async () => {
    const mockReq = {
      body: {name: "Fun", memberEmails: ["mario.red@email.com", "luigi.red@email.com","francesco@email.com"]},
      cookies: { accessToken: "some", refreshToken: "some" }
  }
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    locals: {
      refreshedTokenMessage: "expired token"
    }
  }
  
  verifyAuth.mockImplementation(() => {
    return { authorized: true, cause: "Authorized" }
  });
  verifyEmail.mockReturnValue(true);
  const existingGroup = false;
  const inAGroup = true;
  const calleeUser = {_id: 123456};
  const user1 = {_id: 1};
  const user2 = {_id: 2};
  const decodedAccessToken = {email: "io@email.com"}  

  jest.spyOn(jwt, "verify").mockReturnValue(decodedAccessToken); 
      
  Group.findOne.mockResolvedValueOnce(existingGroup);
  Group.findOne.mockResolvedValueOnce(inAGroup);

  await createGroup(mockReq, mockRes);                       
  expect(mockRes.status).toHaveBeenCalledWith(400)
  expect(mockRes.json).toHaveBeenCalledWith({ error: "You are already part of a group!"});
})

test("should return status code 400 for email invalid format", async () => {
  const mockReq = {
    body: {name: "Fun", memberEmails: ["mario.red@email.com", "luigi.red@email.com","francesco@email.com"]},
    cookies: { accessToken: "some", refreshToken: "some" }
}
const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  locals: {
    refreshedTokenMessage: "expired token"
  }
}

verifyAuth.mockImplementation(() => {
  return { authorized: true, cause: "Authorized" }
});
verifyEmail.mockReturnValue(false);
const existingGroup = false;
const inAGroup = true;
const calleeUser = {_id: 123456};
const user1 = {_id: 1};
const user2 = {_id: 2};
const decodedAccessToken = {email: "io@email.com"}  

jest.spyOn(jwt, "verify").mockReturnValue(decodedAccessToken); 
    
Group.findOne.mockResolvedValueOnce(existingGroup);
Group.findOne.mockResolvedValueOnce(false);

User.findOne.mockResolvedValueOnce(calleeUser);

await createGroup(mockReq, mockRes);                       
expect(mockRes.status).toHaveBeenCalledWith(400)
expect(mockRes.json).toHaveBeenCalledWith({error: "Something's wrong with memberemails"});
})

test("should return status code 400 for empty email string", async () => {
  const mockReq = {
    body: {name: "Fun", memberEmails: ["     ", "luigi.red@email.com","francesco@email.com"]},
    cookies: { accessToken: "some", refreshToken: "some" }
}
const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  locals: {
    refreshedTokenMessage: "expired token"
  }
}

verifyAuth.mockImplementation(() => {
  return { authorized: true, cause: "Authorized" }
});
verifyEmail.mockReturnValue(true);
const existingGroup = false;
const inAGroup = true;
const calleeUser = {_id: 123456};
const user1 = {_id: 1};
const user2 = {_id: 2};
const decodedAccessToken = {email: "io@email.com"}  

jest.spyOn(jwt, "verify").mockReturnValue(decodedAccessToken); 

await createGroup(mockReq, mockRes);                       
expect(mockRes.status).toHaveBeenCalledWith(400)
expect(mockRes.json).toHaveBeenCalledWith({error: "Missing parameters"});
})

test("should return status code 400 for duplicated memeber emails", async () => {
  const mockReq = {
    body: {name: "Fun", memberEmails: ["luigi.red@email.com", "luigi.red@email.com","francesco@email.com"]},
    cookies: { accessToken: "some", refreshToken: "some" }
}
const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  locals: {
    refreshedTokenMessage: "expired token"
  }
}

verifyAuth.mockImplementation(() => {
  return { authorized: true, cause: "Authorized" }
});
verifyEmail.mockReturnValue(true);
const existingGroup = false;
const inAGroup = true;
const calleeUser = {_id: 123456};
const user1 = {_id: 1};
const user2 = {_id: 2};
const decodedAccessToken = {email: "io@email.com"}  

jest.spyOn(jwt, "verify").mockReturnValue(decodedAccessToken); 

await createGroup(mockReq, mockRes);                       
expect(mockRes.status).toHaveBeenCalledWith(400)
expect(mockRes.json).toHaveBeenCalledWith({error: "MemberEmails contains duplicates"});
})

test("should return status code 401 for unauthenticated user", async () => {
  const mockReq = {
    body: {name: "Fun", memberEmails: ["luigi.red@email.com", "luigi.red@email.com","francesco@email.com"]},
    cookies: { accessToken: "some", refreshToken: "some" }
}
const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  locals: {
    refreshedTokenMessage: "expired token"
  }
}

verifyAuth.mockImplementation(() => {
  return { authorized: false, cause: "Unuthorized" }
});

const existingGroup = false;
const inAGroup = true;
const calleeUser = {_id: 123456};
const user1 = {_id: 1};
const user2 = {_id: 2};
const decodedAccessToken = {email: "io@email.com"}  

await createGroup(mockReq, mockRes);                       
expect(mockRes.status).toHaveBeenCalledWith(401)
expect(mockRes.json).toHaveBeenCalledWith({error: "Unuthorized"});
})



})

describe("getUser", () => { 
  test("(status 200) should retrieve another user if i have auth", async () => {
    const mockReq = {
      params: {
        username: "Mario"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }

    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
  
    const retrievedUsers = {username: mockReq.params.username, email: "mario.red@email.com", role: "Regular"}
    
    jest.spyOn(User, "findOne").mockResolvedValue(retrievedUsers) //Quando viene chiamato find su User viene simulata la risposta di un valore dato ovvero il retrievedUsers
    
    await getUser(mockReq, mockRes)
    
    expect(User.findOne).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: retrievedUsers, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })

  test("(status 400) user not found, should retreive an error", async () => {
    const mockReq = {
      params: {
        username: "Mario"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }

    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
  
    
    jest.spyOn(User, "findOne").mockResolvedValue(undefined) //Quando viene chiamato find su User viene simulata la risposta di un valore dato ovvero il retrievedUsers
    
    await getUser(mockReq, mockRes)
    
    expect(User.findOne).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error:"User not found"})
  })

  test("(status 401) no auth", async () => {
    const mockReq = {
      params: {
        username: "Mario"
      }
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }

    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" })
    const retrievedUsers = {username: mockReq.params.username, email: "mario.red@email.com", role: "Regular"}
    
    jest.spyOn(User, "findOne").mockResolvedValue(retrievedUsers) //Quando viene chiamato find su User viene simulata la risposta di un valore dato ovvero il retrievedUsers
    
    await getUser(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error:"Unauthorized"})
  })
  


})

describe("getGroups", () => {
  
  test("should return status 200", async () => {
    const mockReq = {
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
  
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "Authorized" }
    });
    const groups = [{"name": "Family", "members": [{"email": "io@gmail.com", "user": 1}, {"email": "tu@gmail.com", "user": 2}]}];
    const result = {data: [{"name": "Family", "members": 
                            [{"email": "io@gmail.com"}, 
                            {"email": "tu@gmail.com"}]}], 
                            refreshedTokenMessage: "expired token"};
    jest.spyOn(Group, "find").mockResolvedValue(groups);

    await getGroups(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(result);
  })

  test("should return status 401 for call by a unauthorized user", async () => {
    const mockReq = {
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }

    verifyAuth.mockImplementation(() => {
      return { authorized: false, cause: "Unauthorized" }
    });
    const groups = [{"name": "Family", "members": [{"email": "io@gmail.com", "user": 1}, {"email": "tu@gmail.com", "user": 2}]}];
    const result = {data: [{"name": "Family", "members": 
                            [{"email": "io@gmail.com"}, 
                            {"email": "tu@gmail.com"}]}], 
                            refreshedTokenMessage: "expired token"};
    jest.spyOn(Group, "find").mockResolvedValue(groups);

    await getGroups(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({error: "Unauthorized"})
  })
})

describe("getGroup", () => { 

  test("(status 200) should return all the group information", async () => {
    const mockReq = {
      params: { 
        name: "Family"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
    const resolvedValue = {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}

    jest.spyOn(Group, "findOne").mockResolvedValue(resolvedValue)
    await getGroup(mockReq, mockRes)
    expect(Group.findOne).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: {group: resolvedValue}, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })

  test("(400) group not in the database", async () => {
    const mockReq = {
      params: { 
        name: "Family"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
    const resolvedValue = undefined; 

    jest.spyOn(Group, "findOne").mockResolvedValue(resolvedValue)
    await getGroup(mockReq, mockRes)
    expect(Group.findOne).toHaveBeenCalled(resolvedValue)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Group not found"})
  })

  test("(401) group doesn't have auth ", async () => {
    const mockReq = {
      params: { 
        name: "Family"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" })
    const resolvedValue = {name: "Family", members: [{email: "mario.red@email.com"}, {email: "luigi.red@email.com"}]}

    jest.spyOn(Group, "findOne").mockResolvedValue(resolvedValue)
    await getGroup(mockReq, mockRes)
    expect(Group.findOne).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(401)
    
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized"})
  })

})

describe("addToGroup", () => {
  const exampleUserRefToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjY0NzhhNTg2MzdlZmM0YWZmMmVlNWVlMyIsInVzZXJuYW1lIjoidGVzdGVyIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU2MzExMjIsImV4cCI6MTY4NjIzNTkyMn0.XhUwuKINOEQHtYE1hOCPv-a5TR_NIB4l-R9AdRnL024";
  const exampleUserAccToken= exampleUserRefToken;

  test("(status 200)[REGULAR] should return all added user", async () => {
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["luigi.red@email.com", "pietro.blue@email.com"]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}

    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}, {email: "luigi.red@email.com"}, {email: "pietro.blue@email.com"}]}, membersNotFound: [], alreadyInGroup: []} 

    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })
    verifyEmail.mockReturnValue({ verified: true, cause: "Verified" })
    User.findOne.mockResolvedValueOnce({email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"}) //OK
    Group.findOne.mockResolvedValueOnce(undefined) //OK
    Group.updateOne.mockResolvedValueOnce({modifiedCount: 1}) 
    User.findOne.mockResolvedValueOnce({email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}) //OK
    Group.findOne.mockResolvedValueOnce(undefined) //OK
    Group.updateOne.mockResolvedValueOnce({modifiedCount: 2}) 
    
   

    const response = await addToGroup(mockReq, mockRes)

    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: resolvedValue, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })

  
  test("(400) request body does not contain all the necessary attributes", async () => {
    Group.findOne.mockClear()

    const mockReq = {
      params: { 
        name: "Family"},
      body: {},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(400) group name passed as a route parameter does not represent a group in the database", async () => {
    Group.findOne.mockClear()
    const mockReq = {
      params: { 
        name: "GroupNotInDB"},
      body: {},
      url:"api/groups/GroupNotInDB/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(null)
    

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(400) if all the provided emails represent users that are already in a group", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com"]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(400) if all the provided emails represent users that do not exist in the database", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["emailIncorrectFormat"]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(400) at least one of the member emails is an empty string", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com", " "]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(401) if called by an authenticated user who is not part of the group (authType = Group)", async () => {
    const exampleNewUserRefToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9uZVRlc3RAdGVzdC5jb20iLCJpZCI6IjY0N2Q4NDc1NjJlMmVmODk1MzdlY2MzOCIsInVzZXJuYW1lIjoib25lVGVzdCIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1OTQ3NTIyLCJleHAiOjE2ODY1NTIzMjJ9.0dD5GNJNUjAQn9oidvLs1DWOmiGZQ-r5eMy5NoWHoqY"
    const exampleNewUserAccToken = exampleNewUserRefToken
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com", " "]},
      url:"api/groups/Family/add",
      cookies: { accessToken:exampleNewUserAccToken, refreshToken:exampleNewUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("(401) if called by an authenticated user who is not an admin (authType = Admin)", async () => {
    const exampleNewUserRefToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9uZVRlc3RAdGVzdC5jb20iLCJpZCI6IjY0N2Q4NDc1NjJlMmVmODk1MzdlY2MzOCIsInVzZXJuYW1lIjoib25lVGVzdCIsInJvbGUiOiJSZWd1bGFyIiwiaWF0IjoxNjg1OTQ3NTIyLCJleHAiOjE2ODY1NTIzMjJ9.0dD5GNJNUjAQn9oidvLs1DWOmiGZQ-r5eMy5NoWHoqY"
    const exampleNewUserAccToken = exampleNewUserRefToken
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com", " "]},
      url:"api/groups/Family/insert",
      cookies: { accessToken:exampleNewUserAccToken, refreshToken:exampleNewUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    Group.findOne.mockResolvedValueOnce(actualGroup)
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" })

    await addToGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })


})

describe("removeFromGroup", () => { 

  const exampleUserRefToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpZCI6IjY0NzhhNTg2MzdlZmM0YWZmMmVlNWVlMyIsInVzZXJuYW1lIjoidGVzdGVyIiwicm9sZSI6IlJlZ3VsYXIiLCJpYXQiOjE2ODU2MzExMjIsImV4cCI6MTY4NjIzNTkyMn0.XhUwuKINOEQHtYE1hOCPv-a5TR_NIB4l-R9AdRnL024";
  const exampleUserAccToken= exampleUserRefToken;

  test("(status 200)[REGULAR] should return group without removed users", async () => {
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["luigi.red@email.com", "pietro.blue@email.com"]},
      url:"api/groups/Family/remove",
      cookies: { accessToken:exampleUserAccToken, refreshToken:exampleUserRefToken } //test@test.com user cookies 
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"},{email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"},{email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}]}
    
    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}]}, membersNotFound: [], notInGroup: []}

    Group.findOne.mockResolvedValueOnce(actualGroup) //OK
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" }) //OK
    verifyEmail.mockReturnValue({ verified: true, cause: "Verified" })
    User.findOne.mockResolvedValueOnce({email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"}) //OK   
    Group.updateOne.mockResolvedValueOnce(true) //OK
    User.findOne.mockResolvedValueOnce({email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}) 
    Group.updateOne.mockResolvedValueOnce(true)
    
   

    const response = await removeFromGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: resolvedValue, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })

  test("(status 200)[ADMIN] should return group without removed users", async () => {
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["luigi.red@email.com", "pietro.blue@email.com"]},
      url:"api/groups/Family/pull",
     
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"},{email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"},{email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}]}
    
    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}]}, membersNotFound: [], notInGroup: []}

    Group.findOne.mockResolvedValueOnce(actualGroup) //OK
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" }) //OK
    verifyEmail.mockReturnValue({ verified: true, cause: "Verified" })
    User.findOne.mockResolvedValueOnce({email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"}) //OK   
    Group.updateOne.mockResolvedValueOnce(true) //OK
    User.findOne.mockResolvedValueOnce({email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}) 
    Group.updateOne.mockResolvedValueOnce(true)
    
   

    const response = await removeFromGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: resolvedValue, refreshedTokenMessage: mockRes.locals.refreshedTokenMessage})
  })

  test("(400) request body does not contain all the necessary attributes", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {},
      url:"api/groups/Family/remove",
     
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"},{email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"},{email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}]}
    
    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}]}, membersNotFound: [], notInGroup: []}

    Group.findOne.mockResolvedValueOnce(actualGroup) //OK
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" }) //OK
       
   

    const response = await removeFromGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))
    
  })

  test("(400) group name passed as a route parameter does not represent a group in the database", async () => {
    
    const mockReq = {
      params: { 
        name: "GroupNotInDB"},
      body: {},
      url:"api/groups/Family/remove",
     
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"},{email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"},{email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}]}
    
    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}]}, membersNotFound: [], notInGroup: []}

    Group.findOne.mockResolvedValueOnce(actualGroup) 
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" }) //OK
       
   

    const response = await removeFromGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))
    
  })

  test("(400) all the provided emails represent users that do not exist in the database", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["notExisting@test.com"]},
      url:"api/groups/Family/remove",
     
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"},{email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"},{email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}]}
    
    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}]}, membersNotFound: [], notInGroup: []}

    Group.findOne.mockResolvedValueOnce(actualGroup) 
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" }) //OK
       
   

    const response = await removeFromGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))
    
  })
  
  test("(400) at least one of the emails is not in a valid email format", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["notExisting"]},
      url:"api/groups/Family/remove",
     
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"},{email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"},{email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}]}
    
    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}]}, membersNotFound: [], notInGroup: []}

    Group.findOne.mockResolvedValueOnce(actualGroup) 
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" }) //OK
       
   

    const response = await removeFromGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))
    
  })

  test("(400) at least one of the emails is an empty string", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: [" "]},
      url:"api/groups/Family/remove",
     
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"},{email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"},{email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}]}
    
    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}]}, membersNotFound: [], notInGroup: []}

    Group.findOne.mockResolvedValueOnce(actualGroup) 
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" }) //OK
       
   

    const response = await removeFromGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))
    
  })

  test("(400) the group contains only one member before deleting any user", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com"]},
      url:"api/groups/Family/remove",
     
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"}]}
    
    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}]}, membersNotFound: [], notInGroup: []}

    Group.findOne.mockResolvedValueOnce(actualGroup) 
    verifyAuth.mockReturnValue({ authorized: true, cause: "Authorized" }) //OK
       
   

    const response = await removeFromGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))
    
  })

  test("(401) called by an authenticated user who is not part of the group (authType = Group)", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com"]},
      url:"api/groups/Family/remove",
     
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"},{email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"},{email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}]}
    
    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}]}, membersNotFound: [], notInGroup: []}

    Group.findOne.mockResolvedValueOnce(actualGroup) 
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" }) //OK
       
   

    const response = await removeFromGroup(mockReq, mockRes)
    
    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))
    
  })

  test("(401) called by an authenticated user who is not admin (authType = Admin)", async () => {
    
    const mockReq = {
      params: { 
        name: "Family"},
      body: {emails: ["test@test.com"]},
      url:"api/groups/Family/pull",
     
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    //Acutal group
    const actualGroup = {name: "Family", members: [{email: "test@test.com", user: "6478a58637efc4aff2ee5ee3"},{email: "luigi.red@email.com", _id: "647edb912de5a0e0e1702caf"},{email: "pietro.blue@email.com", _id:"647edba4b9ae4baa5e292dec"}]}
    
    //Final group with add of luigi and mario 
    const resolvedValue = {group: {name: "Family", members: [{email: "test@test.com"}]}, membersNotFound: [], notInGroup: []}

    Group.findOne.mockResolvedValueOnce(actualGroup) 
    verifyAuth.mockReturnValue({ authorized: false, cause: "Unauthorized" }) //OK
       
   

    const response = await removeFromGroup(mockReq, mockRes)
    //console.log(response)
    
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))
    
  })
})

describe("deleteUser", () => { 
  test("(status: 200) deletion of user and its group and transactions", async () => {
    const mockReq = {
      body: {email: "luigi.red@email.com"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "authorized" }
    });
    const resolvedUser = {
      username: "luigi", 
      email: "luigi.red@email.com", 
      password: "pass123",
      role: "Regular"
    }; 
    const resolvedGroup = {name: "groupName", members: [{email: "luigi.red@email.com"}]}
        
    jest.spyOn(User, "findOne").mockResolvedValueOnce(resolvedUser);
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(resolvedGroup);
    jest.spyOn(Group, "deleteOne").mockResolvedValueOnce(resolvedGroup);
    jest.spyOn(transactions, "deleteMany").mockResolvedValue({deletedCount: 1});
    jest.spyOn(User, "remove").mockResolvedValueOnce(resolvedUser);
    await deleteUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: {deletedTransactions: 1, deletedFromGroup: true}, 
    refreshedTokenMessage: "expired token"}); 

  })

  test("should return status 400 for body without necessary attributes", async () => {
    const mockReq = {
      body: {}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "authorized" }
    });
    const resolvedUser = {
      username: "luigi", 
      email: "luigi.red@email.com", 
      password: "pass123",
      role: "Regular"
    }; 
    

    await deleteUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "The body doesn't contain the necessary attributes."})

  })

  test("Returns a 400 error if the email passed in the request body is an empty string", async () => {
    const mockReq = {
      body: {email: " "}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "authorized" }
    });
    const resolvedUser = {
      username: "luigi", 
      email: "luigi.red@email.com", 
      password: "pass123",
      role: "Regular"
    }; 
    
    
    await deleteUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })

  test("Returns a 400 error if the email passed in the request body is not in correct email format", async () => {
    const mockReq = {
      body: {email: "luigi.red"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "authorized" }
    });
    verifyEmail.mockImplementation(() => {return false})
    
    
    await deleteUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })
  test("Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)", async () => {
    const mockReq = {
      body: {email: "luigi.red"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    verifyAuth.mockImplementation(() => {
      return { authorized: false, cause: "unauthorized" }
    });
    const resolvedUser = {
      username: "luigi", 
      email: "luigi.red@email.com", 
      password: "pass123",
      role: "Regular"
    }; 
    
    
    await deleteUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
  }))

  })
 


})

describe("deleteGroup", () => { 

  test("should return status 200 for successful deletion", async () => {
    const mockReq = {
      body: {name: "Family"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "authorized" }
    });

    const resolved = {name: "Some"};
    jest.spyOn(Group, "findOne").mockResolvedValueOnce(resolved);
    jest.spyOn(Group, "findOneAndDelete").mockResolvedValueOnce(resolved);

    await deleteGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({data: {message: "The group has been deleted!"}, 
    refreshedTokenMessage: "expired token"})

  })

  test("should return status 400 for body without necessary attributes", async () => {
    const mockReq = {
      body: {other: "Family"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "authorized" }
    });

    Group.findOne.mockResolvedValue({name: "Family"});
    Group.findOneAndDelete.mockResolvedValueOnce({name: "Family"});

    await deleteGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "Missing the name of the group"})

  })

  test("should return status 400 empty string name in the body", async () => {
    const mockReq = {
      body: {name: "    "}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "authorized" }
    });

    Group.findOne.mockResolvedValue({name: "Family"});
    Group.findOneAndDelete.mockResolvedValueOnce({name: "Family"});

    await deleteGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({error: "Missing the name of the group"})

  })

  test("should return status 400 for a group that is not in the database", async () => {
    const mockReq = {
      body: {name: "Family"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    verifyAuth.mockImplementation(() => {
      return { authorized: true, cause: "authorized" }
    });

    jest.spyOn(Group, "findOne").mockResolvedValueOnce(null);

    await deleteGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({ error: "The group does not exist!" })

  })

  test("should return status 401 when called by a user that is not an admin", async () => {
    const mockReq = {
      body: {name: "Family"}
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    
    verifyAuth.mockImplementation(() => {
      return { authorized: false, cause: "unauthorized" }
    });

    Group.findOne.mockResolvedValue({name: "Family"});
    Group.findOneAndDelete.mockResolvedValueOnce({name: "Family"});

    await deleteGroup(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({error: "unauthorized"})

  })

})