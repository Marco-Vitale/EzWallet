import request from 'supertest';
import { app } from '../app';
import { Group, User } from '../models/User.js';
import {getUsers, getUser, createGroup, getGroups, deleteGroup} from '../controllers/users';
import { verifyAuth, verifyEmail } from '../controllers/utils';
import jwt from 'jsonwebtoken'
import { compare } from 'bcryptjs';

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

/*describe("getUsers", () => {
  test("should return empty list if there are no users", async () => {
    const mockReq = {
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {
        refreshedTokenMessage: "expired token"
      }
    }
    jest.spyOn(User, "find").mockResolvedValue([])
    await getUsers(mockReq, mockRes)
    expect(User.find).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith({ data: [], message: mockRes.locals.refreshedTokenMessage})
  })

  test("should retrieve list of all users", async () => {
    const mockReq = {}
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }, { username: 'test2', email: 'test2@example.com', password: 'hashedPassword2' }]
    jest.spyOn(User, "find").mockResolvedValue(retrievedUsers) //Quando viene chiamato find su User viene simulata la risposta di un valore dato ovvero il retrievedUsers
    await getUsers(mockReq, mockRes)
    expect(User.find).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(retrievedUsers)
  })
})*/

describe("getUser", () => {
  test('Dummy test, change it', () => {
    expect(true).toBe(true);
  });
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

describe("getGroup", () => { })

describe("addToGroup", () => { })

describe("removeFromGroup", () => { })

describe("deleteUser", () => { })

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