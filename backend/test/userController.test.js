// Mock the dependencies first, before requiring the controller
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("sequelize");

// Mock the models
jest.mock("../models/userModel", () => {
  const mockUserModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    // Add the associate function to prevent the error
    associate: jest.fn()
  };
  return mockUserModel;
});

jest.mock("../models/esemenyModel", () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  destroy: jest.fn()
}));

jest.mock("../models/resztvevoModel", () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  destroy: jest.fn()
}));

jest.mock("../models/helyszinModel", () => ({
  findAll: jest.fn(),
  destroy: jest.fn()
}));

// Now require the controller after the mocks are set up
const { 
  createUser, 
  authenticateUser, 
  getUser, 
  updateUser, 
  deleteUser,
  getUserSettings,
  saveUserSettings,
  getUserStats,
  listAllUsers,
  searchUsers
} = require("../controllers/userController");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Esemény = require("../models/esemenyModel");
const Résztvevő = require("../models/resztvevoModel");
const Helyszin = require("../models/helyszinModel");
const { Op } = require("sequelize");

describe("User Controller", () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      headers: {},
      user: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });
  
  describe("createUser", () => {
    it("should create a user successfully", async () => {
      // Arrange
      req.body = {
        email: "test@example.com",
        password: "Test1234!@#$",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        birthDate: "1990-01-01"
      };
      
      bcrypt.hash.mockResolvedValue("hashedPassword");
      User.create.mockResolvedValue({
        id: 1,
        ...req.body,
        password: "hashedPassword"
      });
      
      // Act
      await createUser(req, res);
      
      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith("Test1234!@#$", 10);
      expect(User.create).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "hashedPassword",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        birthDate: "1990-01-01",
        phone: undefined,
        profilePicture: expect.any(String)
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully!",
        user: expect.any(Object)
      });
    });
    
    it("should return error for missing required fields", async () => {
      // Arrange
      req.body = {
        email: "test@example.com",
        // Missing password and username
      };
      
      // Act
      await createUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Missing required fields!"
      });
    });
    
    it("should validate email format", async () => {
      // Arrange
      req.body = {
        email: "invalid-email",
        password: "Test1234!@#$",
        username: "testuser"
      };
      
      // Act
      await createUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Érvénytelen email formátum!"
      });
    });
    
    it("should validate password length", async () => {
      // Arrange
      req.body = {
        email: "test@example.com",
        password: "short",
        username: "testuser"
      };
      
      // Act
      await createUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "A jelszó 10-25 karakter hosszú lehet!"
      });
    });
    
    it("should validate password complexity", async () => {
      // Arrange
      req.body = {
        email: "test@example.com",
        password: "passwordwithoutcomplexity",
        username: "testuser"
      };
      
      // Act
      await createUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "A jelszónak tartalmaznia kell kisbetűt, nagybetűt, számot és speciális karaktert!"
      });
    });
  });
  
  describe("authenticateUser", () => {
    it("should authenticate user successfully", async () => {
      // Arrange
      req.body = {
        email: "test@example.com",
        password: "Test1234!@#$"
      };
      
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        password: "hashedPassword",
        firstName: "Test",
        lastName: "User"
      };
      
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("token123");
      
      // Act
      await authenticateUser(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
      expect(bcrypt.compare).toHaveBeenCalledWith("Test1234!@#$", "hashedPassword");
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: 1,
          email: "test@example.com",
          name: "testuser"
        },
        "secretkey",
        { expiresIn: "1h" }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful!",
        token: "token123",
        user: {
          id: 1,
          email: "test@example.com",
          username: "testuser",
          firstName: "Test",
          lastName: "User"
        }
      });
    });
    
    it("should return error for invalid credentials", async () => {
      // Arrange
      req.body = {
        email: "test@example.com",
        password: "wrongpassword"
      };
      
      User.findOne.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashedPassword"
      });
      
      bcrypt.compare.mockResolvedValue(false);
      
      // Act
      await authenticateUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid email or password!"
      });
    });
  });
  
  describe("getUser", () => {
    it("should get user by ID", async () => {
      // Arrange
      req.params = { id: 1 };
      
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        profilePicture: "profile.jpg",
        profileBackground: "background.jpg",
        customBackground: null
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      
      // Act
      await getUser(req, res);
      
      // Assert
      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: {
          exclude: ["password"],
          include: ["profileBackground", "customBackground", "profilePicture"]
        }
      });
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
    
    it("should return error if user not found", async () => {
      // Arrange
      req.params = { id: 999 };
      User.findByPk.mockResolvedValue(null);
      
      // Act
      await getUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found!"
      });
    });
  });
  
  describe("updateUser", () => {
    it("should update user successfully", async () => {
      // Arrange
      req.params = { id: 1 };
      req.body = {
        firstName: "Updated",
        lastName: "User"
      };
      
      User.update.mockResolvedValue([1]);
      
      // Act
      await updateUser(req, res);
      
      // Assert
      expect(User.update).toHaveBeenCalledWith(
        {
          firstName: "Updated",
          lastName: "User"
        },
        { where: { id: 1 } }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "User updated successfully!"
      });
    });
    
    it("should hash password if included in update", async () => {
      // Arrange
      req.params = { id: 1 };
      req.body = {
        password: "NewPassword123!@#"
      };
      
      bcrypt.hash.mockResolvedValue("newHashedPassword");
      User.update.mockResolvedValue([1]);
      
      // Act
      await updateUser(req, res);
      
      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword123!@#", 10);
      expect(User.update).toHaveBeenCalledWith(
        { password: "newHashedPassword" },
        { where: { id: 1 } }
      );
    });
  });
  
  describe("deleteUser", () => {
    it("should delete user and related data", async () => {
      // Arrange
      req.params = { id: 1 };
      req.user = { userId: 1 };
      
      const mockEvents = [{ id: 101 }, { id: 102 }];
      const mockLocations = [{ Id: 201 }, { Id: 202 }];
      
      Esemény.findAll.mockResolvedValue(mockEvents);
      Helyszin.findAll.mockResolvedValue(mockLocations);
      Esemény.findAll.mockResolvedValueOnce(mockEvents).mockResolvedValueOnce([]);
      Résztvevő.destroy.mockResolvedValue(1);
      Esemény.destroy.mockResolvedValue(2);
      Helyszin.destroy.mockResolvedValue(2);
      User.destroy.mockResolvedValue(1);
      
      // Act
      await deleteUser(req, res);
      
      // Assert
      expect(Résztvevő.destroy).toHaveBeenCalledWith({
        where: { eseményId: [101, 102] }
      });
      expect(Esemény.destroy).toHaveBeenCalledWith({
        where: { userId: 1 }
      });
      expect(Résztvevő.destroy).toHaveBeenCalledWith({
        where: { userId: 1 }
      });
      expect(User.destroy).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "User and related data deleted successfully!",
        deletedEvents: 2,
        deletedLocations: 2
      });
    });
    
    it("should not allow deleting other users", async () => {
      // Arrange
      req.params = { id: 2 };
      req.user = { userId: 1 };
      
      // Act
      await deleteUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nincs jogosultságod más felhasználó törlésére!"
      });
    });
  });
  
  describe("getUserSettings", () => {
    it("should get user settings", async () => {
      // Arrange
      req.params = { id: 1 };
      req.user = { userId: 1 };
      
      const mockUser = {
        id: 1,
        profileBackground: "blue",
        customBackground: "custom.jpg",
        profilePicture: "profile.jpg"
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      
      // Act
      await getUserSettings(req, res);
      
      // Assert
      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: ['id', 'profileBackground', 'customBackground', 'profilePicture']
      });
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
    
    it("should not allow accessing other users' settings", async () => {
      // Arrange
      req.params = { id: 2 };
      req.user = { userId: 1 };
      
      // Act
      await getUserSettings(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized to access these settings"
      });
    });
  });
  
  describe("saveUserSettings", () => {
    it("should save user settings", async () => {
      // Arrange
      req.params = { id: 1 };
      req.user = { userId: 1 };
      req.body = {
        profileBackground: "red",
        profilePicture: "data:image/jpeg;base64,..."
      };
      
      User.findByPk.mockResolvedValue({
        id: 1,
        profileBackground: "blue",
        customBackground: null,
        profilePicture: "old-profile.jpg"
      });
      
      User.update.mockResolvedValue([1]);
      
      const updatedUser = {
        id: 1,
        profileBackground: "red",
        customBackground: null,
        profilePicture: "data:image/jpeg;base64,..."
      };
      
      User.findByPk.mockResolvedValueOnce({}).mockResolvedValueOnce(updatedUser);
      
      // Act
      await saveUserSettings(req, res);
      
      // Assert
      expect(User.update).toHaveBeenCalledWith(
        {
          profileBackground: "red",
          profilePicture: "data:image/jpeg;base64,..."
        },
        { where: { id: 1 } }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "User settings updated successfully",
        settings: updatedUser
      });
    });
    
    it("should reject large profile pictures", async () => {
      // Arrange
      req.params = { id: 1 };
      req.user = { userId: 1 };
      
      // Create a large base64 string (over 1MB)
      const largeBase64 = "data:image/jpeg;base64," + "A".repeat(1000001);
      
      req.body = {
        profilePicture: largeBase64
      };
      
      // Act
      await saveUserSettings(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "A profilkép túl nagy méretű. Kérjük, használjon kisebb képet (max 1MB)."
      });
    });
    
    it("should not allow modifying other users' settings", async () => {
      // Arrange
      req.params = { id: 2 };
      req.user = { userId: 1 };
      req.body = {
        profileBackground: "red"
      };
      
      // Act
      await saveUserSettings(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized to modify these settings"
      });
    });
  });
  
  
  
  describe("listAllUsers", () => {
    it("should list all users except the requesting user", async () => {
      // Arrange
      req.user = { userId: 1 };
      
      const mockUsers = [
        { id: 2, username: "user2", profilePicture: "pic2.jpg" },
        { id: 3, username: "user3", profilePicture: "pic3.jpg" }
      ];
      
      User.findAll.mockResolvedValue(mockUsers);
      
      // Act
      await listAllUsers(req, res);
      
      // Assert
      expect(User.findAll).toHaveBeenCalledWith({
        where: {
          id: { [Op.ne]: 1 }
        },
        attributes: ['id', 'username', 'profilePicture']
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        users: [
          { id: 2, username: "user2", profilePicture: "pic2.jpg" },
          { id: 3, username: "user3", profilePicture: "pic3.jpg" }
        ]
      });
    });
  });
  
  describe("searchUsers", () => {
    it("should search users by query", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.query = {
        query: "test",
        limit: "5",
        page: "1"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      const mockUsers = {
        rows: [
          { 
            id: 2, 
            username: "testuser", 
            firstName: "Test", 
            lastName: "User", 
            email: "test@example.com", 
            profilePicture: "pic.jpg",
            birthDate: "1990-01-01"
          }
        ],
        count: 1
      };
      
      User.findAndCountAll.mockResolvedValue(mockUsers);
      
      // Act
      await searchUsers(req, res);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith("token123", "secretkey");
      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: expect.any(Object),
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate'],
        limit: 5,
        offset: 0,
        order: [['username', 'ASC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        users: [
          {
            id: 2,
            name: "testuser",
            username: "testuser",
            email: "test@example.com",
            profilePicture: "pic.jpg",
            age: expect.any(Number) // Age will vary based on current date
          }
        ],
        total: 1,
        page: 1,
        totalPages: 1,
        limit: 5
      });
    });
    
    it("should filter users by age range", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.query = {
        query: "test",
        minAge: "20",
        maxAge: "30"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      const mockUsers = {
        rows: [
          { 
            id: 2, 
            username: "young", 
            birthDate: "2000-01-01", // 23-24 years old
            profilePicture: "pic1.jpg" 
          },
          { 
            id: 3, 
            username: "old", 
            birthDate: "1980-01-01", // 43-44 years old
            profilePicture: "pic2.jpg" 
          }
        ],
        count: 2
      };
      
      User.findAndCountAll.mockResolvedValue(mockUsers);
      
      // Act
      await searchUsers(req, res);
      
      // Assert
      // Only the young user should be in the results
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].users.length).toBe(1);
      expect(res.json.mock.calls[0][0].users[0].id).toBe(2);
    });
    
    it("should require a search query of at least 2 characters", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.query = {
        query: "a" // Too short
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      // Act
      await searchUsers(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Search query must be at least 2 characters long"
      });
    });
    
    it("should exclude users already participating in an event", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.query = {
        query: "test",
        excludeEvent: "101"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      // Mock participants of the event
      Résztvevő.findAll.mockResolvedValue([
        { userId: 2 },
        { userId: 3 }
      ]);
      
      const mockUsers = {
        rows: [
          { id: 4, username: "test4", profilePicture: "pic4.jpg", birthDate: null },
          { id: 5, username: "test5", profilePicture: "pic5.jpg", birthDate: null }
        ],
        count: 2
      };
      
      User.findAndCountAll.mockResolvedValue(mockUsers);
      
      // Act
      await searchUsers(req, res);
      
      // Assert
      expect(Résztvevő.findAll).toHaveBeenCalledWith({
        where: { eseményId: "101" },
        attributes: ['userId']
      });
      
      // Check that the excluded users are not in the query
      expect(User.findAndCountAll.mock.calls[0][0].where.id).toEqual({
        [Op.notIn]: [1, 2, 3] // Current user + participants
      });
    });
  });
});