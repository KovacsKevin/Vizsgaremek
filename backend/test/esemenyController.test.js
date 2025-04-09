const jwt = require("jsonwebtoken");
const { 
  createSportok, 
  getAllSportok, 
  getSportokById, 
  updateSportok, 
  deleteSportok 
} = require("../controllers/sportokController");
const Sportok = require("../models/sportokModel");

// Mock the dependencies
jest.mock("jsonwebtoken");
jest.mock("../models/sportokModel");

describe("Sportok Controller", () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset jwt.verify to a default implementation
    jwt.verify.mockReset();
    jwt.verify.mockImplementation(() => ({ userId: 1 }));
  });
  
  describe("createSportok", () => {
    it("should create a sport successfully", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.body = {
        Nev: "Futball",
        Leiras: "Labdarúgás, 11 fős csapatsport"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      const mockCreatedSport = {
        id: 1,
        Nev: "Futball",
        Leiras: "Labdarúgás, 11 fős csapatsport",
        userId: 1
      };
      
      Sportok.create.mockResolvedValue(mockCreatedSport);
      
      // Act
      await createSportok(req, res);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith("token123", "secretkey");
      expect(Sportok.create).toHaveBeenCalledWith({
        Nev: "Futball",
        Leiras: "Labdarúgás, 11 fős csapatsport",
        userId: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Sport created successfully!",
        sportok: mockCreatedSport
      });
    });
    
    it("should return error for missing required fields", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.body = {
        Nev: "Futball"
        // Missing Leiras
      };
      
      // Act
      await createSportok(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Missing required fields for creating sport!"
      });
    });
    
    it("should require authentication token", async () => {
      // Arrange
      req.headers = {}; // No token
      
      req.body = {
        Nev: "Futball",
        Leiras: "Labdarúgás, 11 fős csapatsport"
      };
      
      // Act
      await createSportok(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication token is required!"
      });
    });
    
    it("should handle server errors", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.body = {
        Nev: "Futball",
        Leiras: "Labdarúgás, 11 fős csapatsport"
      };
      
      const error = new Error("Database error");
      Sportok.create.mockRejectedValue(error);
      
      // Act
      await createSportok(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating sport",
        error: error
      });
    });
  });
  
  describe("getAllSportok", () => {
    it("should get all sports successfully", async () => {
      // Arrange
      const mockSports = [
        { id: 1, Nev: "Futball", Leiras: "Labdarúgás" },
        { id: 2, Nev: "Kosárlabda", Leiras: "Kosárlabdázás" }
      ];
      
      Sportok.findAll.mockResolvedValue(mockSports);
      
      // Act
      await getAllSportok(req, res);
      
      // Assert
      expect(Sportok.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ sportok: mockSports });
    });
    
    it("should return 404 if no sports found", async () => {
      // Arrange
      Sportok.findAll.mockResolvedValue([]);
      
      // Act
      await getAllSportok(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No sports found."
      });
    });
    
    it("should handle server errors", async () => {
      // Arrange
      const error = new Error("Database error");
      Sportok.findAll.mockRejectedValue(error);
      
      // Act
      await getAllSportok(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching sports",
        error: error
      });
    });
  });
  
  describe("getSportokById", () => {
    it("should get a sport by ID successfully", async () => {
      // Arrange
      req.params = { id: 1 };
      
      const mockSport = {
        id: 1,
        Nev: "Futball",
        Leiras: "Labdarúgás"
      };
      
      Sportok.findByPk.mockResolvedValue(mockSport);
      
      // Act
      await getSportokById(req, res);
      
      // Assert
      expect(Sportok.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ sportok: mockSport });
    });
    
    it("should return 404 if sport not found", async () => {
      // Arrange
      req.params = { id: 999 };
      
      Sportok.findByPk.mockResolvedValue(null);
      
      // Act
      await getSportokById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Sport not found!"
      });
    });
    
    it("should handle server errors", async () => {
      // Arrange
      req.params = { id: 1 };
      
      const error = new Error("Database error");
      Sportok.findByPk.mockRejectedValue(error);
      
      // Act
      await getSportokById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching sport",
        error: error
      });
    });
  });
  
  describe("updateSportok", () => {
    it("should update a sport successfully", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer token123"
      };
      req.body = {
        Nev: "Futball - frissítve",
        Leiras: "Labdarúgás, frissített leírás"
      };
      
      const mockSport = {
        id: 1,
        Nev: "Futball",
        Leiras: "Labdarúgás",
        userId: 1,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Sportok.findByPk.mockResolvedValue(mockSport);
      
      // Act
      await updateSportok(req, res);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith("token123", "secretkey");
      expect(Sportok.findByPk).toHaveBeenCalledWith(1);
      expect(mockSport.update).toHaveBeenCalledWith({
        Nev: "Futball - frissítve",
        Leiras: "Labdarúgás, frissített leírás"
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Sport updated successfully!",
        sportok: mockSport
      });
    });
    
    it("should return 404 if sport not found", async () => {
      // Arrange
      req.params = { id: 999 };
      req.headers = {
        authorization: "Bearer token123"
      };
      req.body = {
        Nev: "Futball - frissítve"
      };
      
      Sportok.findByPk.mockResolvedValue(null);
      
      // Act
      await updateSportok(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Sport not found!"
      });
    });
    
    it("should not allow updating sports created by other users", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer token123"
      };
      req.body = {
        Nev: "Futball - frissítve"
      };
      
      jwt.verify.mockReturnValue({ userId: 2 }); // Different user
      
      const mockSport = {
        id: 1,
        Nev: "Futball",
        Leiras: "Labdarúgás",
        userId: 1 // Created by user 1
      };
      
      Sportok.findByPk.mockResolvedValue(mockSport);
      
      // Act
      await updateSportok(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You can only update your own sports!"
      });
    });
    
    it("should require authentication token", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {}; // No token
      req.body = {
        Nev: "Futball - frissítve"
      };
      
      // Act
      await updateSportok(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication token is required!"
      });
    });
    
    it("should handle server errors", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer token123"
      };
      req.body = {
        Nev: "Futball - frissítve"
      };
      
      const error = new Error("Database error");
      Sportok.findByPk.mockRejectedValue(error);
      
      // Act
      await updateSportok(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error updating sport",
        error: error
      });
    });
  });
  
  describe("deleteSportok", () => {
    it("should delete a sport successfully", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer token123"
      };
      
      const mockSport = {
        id: 1,
        Nev: "Futball",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Sportok.findByPk.mockResolvedValue(mockSport);
      
      // Act
      await deleteSportok(req, res);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith("token123", "secretkey");
      expect(Sportok.findByPk).toHaveBeenCalledWith(1);
      expect(mockSport.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Sport deleted successfully!"
      });
    });
    
    it("should return 404 if sport not found", async () => {
      // Arrange
      req.params = { id: 999 };
      req.headers = {
        authorization: "Bearer token123"
      };
      
      Sportok.findByPk.mockResolvedValue(null);
      
      // Act
      await deleteSportok(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Sport not found!"
      });
    });
    
    it("should not allow deleting sports created by other users", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer token123"
      };
      
      jwt.verify.mockReturnValue({ userId: 2 }); // Different user
      
      const mockSport = {
        id: 1,
        Nev: "Futball",
        userId: 1 // Created by user 1
      };
      
      Sportok.findByPk.mockResolvedValue(mockSport);
      
      // Act
      await deleteSportok(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You can only delete your own sports!"
      });
    });
    
    it("should require authentication token", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {}; // No token
      
            // Act
            await deleteSportok(req, res);
      
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
              message: "Authentication token is required!"
            });
          });
          
          it("should handle server errors", async () => {
            // Arrange
            req.params = { id: 1 };
            req.headers = {
              authorization: "Bearer token123"
            };
            
            const error = new Error("Database error");
            Sportok.findByPk.mockRejectedValue(error);
            
            // Act
            await deleteSportok(req, res);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
              message: "Error deleting sport",
              error: error
            });
          });
        });
        
        describe("JWT verification errors", () => {
          it("should handle invalid tokens in createSportok", async () => {
            // Arrange
            req.headers = {
              authorization: "Bearer invalidtoken"
            };
            
            req.body = {
              Nev: "Futball",
              Leiras: "Labdarúgás"
            };
            
            // This is the key part - mock jwt.verify to throw an error
            const error = new Error("Invalid token");
            jwt.verify.mockImplementation(() => {
              throw error;
            });
            
            // Act
            await createSportok(req, res);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
              message: "Error creating sport",
              error: error
            });
          });
          
          it("should handle invalid tokens in updateSportok", async () => {
            // Arrange
            req.params = { id: 1 };
            req.headers = {
              authorization: "Bearer invalidtoken"
            };
            
            req.body = {
              Nev: "Futball - frissítve"
            };
            
            // Mock jwt.verify to throw an error
            const error = new Error("Invalid token");
            jwt.verify.mockImplementation(() => {
              throw error;
            });
            
            // Act
            await updateSportok(req, res);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
              message: "Error updating sport",
              error: error
            });
          });
          
          it("should handle invalid tokens in deleteSportok", async () => {
            // Arrange
            req.params = { id: 1 };
            req.headers = {
              authorization: "Bearer invalidtoken"
            };
            
            // Mock jwt.verify to throw an error
            const error = new Error("Invalid token");
            jwt.verify.mockImplementation(() => {
              throw error;
            });
            
            // Act
            await deleteSportok(req, res);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
              message: "Error deleting sport",
              error: error
            });
          });
        });
        
        describe("Edge cases", () => {
          it("should handle malformed authorization header", async () => {
            // Arrange
            req.headers = {
              authorization: "Malformed" // Not in the format "Bearer token"
            };
            
            req.body = {
              Nev: "Futball",
              Leiras: "Labdarúgás"
            };
            
            // Act
            await createSportok(req, res);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
              message: "Authentication token is required!"
            });
          });
          
          it("should handle empty sport name in create request", async () => {
            // Arrange
            req.headers = {
              authorization: "Bearer token123"
            };
            
            req.body = {
              Nev: "", // Empty name
              Leiras: "Labdarúgás"
            };
            
            // Act
            await createSportok(req, res);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
              message: "Missing required fields for creating sport!"
            });
          });
          
          it("should handle empty sport description in create request", async () => {
            // Arrange
            req.headers = {
              authorization: "Bearer token123"
            };
            
            req.body = {
              Nev: "Futball",
              Leiras: "" // Empty description
            };
            
            // Act
            await createSportok(req, res);
            
            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
              message: "Missing required fields for creating sport!"
            });
          });
        });
        
        describe("Integration scenarios", () => {
          it("should handle the complete flow of creating, updating, and deleting a sport", async () => {
            // This is a more complex test that simulates a full lifecycle
            
            // Setup
            const userId = 1;
            const sportId = 1;
            const token = "token123";
            
            jwt.verify.mockReturnValue({ userId });
            
            // 1. Create a sport
            req.headers = {
              authorization: `Bearer ${token}`
            };
            
            req.body = {
              Nev: "Futball",
              Leiras: "Labdarúgás, 11 fős csapatsport"
            };
            
            const createdSport = {
              id: sportId,
              Nev: "Futball",
              Leiras: "Labdarúgás, 11 fős csapatsport",
              userId
            };
            
            Sportok.create.mockResolvedValue(createdSport);
            
            await createSportok(req, res);
            
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
              message: "Sport created successfully!",
              sportok: createdSport
            });
            
            // Reset mocks for next call
            res.status.mockClear();
            res.json.mockClear();
            
            // 2. Update the sport
            req.params = { id: sportId };
            req.body = {
              Nev: "Futball - frissítve",
              Leiras: "Labdarúgás, frissített leírás"
            };
            
            const sportToUpdate = {
              id: sportId,
              Nev: "Futball",
              Leiras: "Labdarúgás, 11 fős csapatsport",
              userId,
              update: jest.fn().mockResolvedValue(true)
            };
            
            Sportok.findByPk.mockResolvedValue(sportToUpdate);
            
            await updateSportok(req, res);
            
            expect(sportToUpdate.update).toHaveBeenCalledWith({
              Nev: "Futball - frissítve",
              Leiras: "Labdarúgás, frissített leírás"
            });
            expect(res.status).toHaveBeenCalledWith(200);
            
            // Reset mocks for next call
            res.status.mockClear();
            res.json.mockClear();
            
            // 3. Delete the sport
            const sportToDelete = {
              id: sportId,
              Nev: "Futball - frissítve",
              Leiras: "Labdarúgás, frissített leírás",
              userId,
              destroy: jest.fn().mockResolvedValue(true)
            };
            
            Sportok.findByPk.mockResolvedValue(sportToDelete);
            
            await deleteSportok(req, res);
            
            expect(sportToDelete.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
              message: "Sport deleted successfully!"
            });
          });
        });
        
        // Clean up after all tests
        afterAll(() => {
          jest.restoreAllMocks();
        });
      });
      
