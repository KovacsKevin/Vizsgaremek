const jwt = require("jsonwebtoken");
const { 
  createHelyszin, 
  getAllHelyszin, 
  getHelyszinById, 
  updateHelyszin, 
  deleteHelyszin,
  getMyOwnHelyszin
} = require("../controllers/helyszinController");
const Helyszin = require("../models/helyszinModel");

// Mock the dependencies
jest.mock("jsonwebtoken");
jest.mock("../models/helyszinModel");

// Suppress console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("Helyszin Controller", () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      headers: {},
      user: {}
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
  
  describe("createHelyszin", () => {
    it("should create a location successfully", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.body = {
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: true,
        Oltozo: true,
        Parkolas: "Ingyenes",
        Leiras: "Modern sportpálya a belvárosban",
        Berles: false
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      Helyszin.create.mockResolvedValue({
        id: 1,
        ...req.body,
        userId: 1
      });
      
      // Act
      await createHelyszin(req, res);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith("token123", "secretkey");
      expect(Helyszin.create).toHaveBeenCalledWith({
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: true,
        Oltozo: true,
        Parkolas: "Ingyenes",
        Leiras: "Modern sportpálya a belvárosban",
        Berles: false,
        userId: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Location created successfully!",
        helyszin: expect.any(Object)
      });
    });
    
    it("should set default values for optional fields", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.body = {
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Parkolas: "Ingyenes"
        // Missing optional fields: Fedett, Oltozo, Leiras, Berles
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      const createdHelyszin = {
        id: 1,
        ...req.body,
        Fedett: false,
        Oltozo: false,
        Leiras: "",
        Berles: false,
        userId: 1
      };
      
      Helyszin.create.mockResolvedValue(createdHelyszin);
      
      // Act
      await createHelyszin(req, res);
      
      // Assert
      expect(Helyszin.create).toHaveBeenCalledWith({
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: false,
        Oltozo: false,
        Parkolas: "Ingyenes",
        Leiras: "",
        Berles: false,
        userId: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
    
    it("should return error for missing required fields", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.body = {
        Nev: "Sportpálya",
        Cim: "Példa utca 1."
        // Missing required fields: Telepules, Iranyitoszam, Parkolas
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      // Act
      await createHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Missing required fields for creating location!"
      });
    });
    
    it("should require authentication token", async () => {
      // Arrange
      req.headers = {}; // No token
      
      req.body = {
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Parkolas: "Ingyenes"
      };
      
      // Act
      await createHelyszin(req, res);
      
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
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Parkolas: "Ingyenes"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      const error = new Error("Database error");
      Helyszin.create.mockRejectedValue(error);
      
      // Act
      await createHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating location",
        error: error
      });
    });
  });
  
  describe("getAllHelyszin", () => {
    it("should get all locations successfully", async () => {
      // Arrange
      const mockLocations = [
        { id: 1, Nev: "Sportpálya 1", Telepules: "Budapest" },
        { id: 2, Nev: "Sportpálya 2", Telepules: "Debrecen" }
      ];
      
      Helyszin.findAll.mockResolvedValue(mockLocations);
      
      // Act
      await getAllHelyszin(req, res);
      
      // Assert
      expect(Helyszin.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ helyszinek: mockLocations });
    });
    
    it("should return 404 if no locations found", async () => {
      // Arrange
      Helyszin.findAll.mockResolvedValue([]);
      
      // Act
      await getAllHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No locations found."
      });
    });
    
    it("should handle server errors", async () => {
      // Arrange
      const error = new Error("Database error");
      Helyszin.findAll.mockRejectedValue(error);
      
      // Act
      await getAllHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching locations",
        error: error
      });
    });
  });
  
  describe("getHelyszinById", () => {
    it("should get a location by ID successfully", async () => {
      // Arrange
      req.params = { id: 1 };
      
      const mockLocation = {
        id: 1,
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest"
      };
      
      Helyszin.findByPk.mockResolvedValue(mockLocation);
      
      // Act
      await getHelyszinById(req, res);
      
      // Assert
      expect(Helyszin.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ helyszin: mockLocation });
    });
    
    it("should return 404 if location not found", async () => {
      // Arrange
      req.params = { id: 999 };
      
      Helyszin.findByPk.mockResolvedValue(null);
      
      // Act
      await getHelyszinById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Location not found!"
      });
    });
    
    it("should return 400 if ID is missing", async () => {
      // Arrange
      req.params = {}; // No ID
      
      // Act
      await getHelyszinById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Location ID is required!"
      });
    });
    
    it("should handle server errors", async () => {
      // Arrange
      req.params = { id: 1 };
      
      const error = new Error("Database error");
      Helyszin.findByPk.mockRejectedValue(error);
      
      // Act
      await getHelyszinById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching location",
        error: error.message
      });
    });
  });
  
  describe("updateHelyszin", () => {
    it("should update a location successfully", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer token123"
      };
      req.body = {
        Nev: "Sportpálya - frissítve",
        Cim: "Új cím",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: "true",
        Oltozo: "true",
        Parkolas: "Fizetős",
        Leiras: "Frissített leírás",
        Berles: "true"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      const mockLocation = {
        id: 1,
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: false,
        Oltozo: false,
        Parkolas: "Ingyenes",
        Leiras: "Eredeti leírás",
        Berles: false,
        userId: 1,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Helyszin.findByPk.mockResolvedValue(mockLocation);
      
      // Act
      await updateHelyszin(req, res);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith("token123", "secretkey");
      expect(Helyszin.findByPk).toHaveBeenCalledWith(1);
      expect(mockLocation.update).toHaveBeenCalledWith({
        Nev: "Sportpálya - frissítve",
        Cim: "Új cím",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: true,
        Oltozo: true,
        Parkolas: "Fizetős",
        Leiras: "Frissített leírás",
        Berles: true
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Location updated successfully!",
        helyszin: mockLocation,
        updatedLocation: mockLocation
      });
    });
    
    it("should handle boolean conversion correctly", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer token123"
      };
      req.body = {
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: "false", // String "false"
        Oltozo: false,   // Boolean false
        Parkolas: "Ingyenes",
        Leiras: "",
        Berles: "true"   // String "true"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      const mockLocation = {
        id: 1,
        userId: 1,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Helyszin.findByPk.mockResolvedValue(mockLocation);
      
      // Act
      await updateHelyszin(req, res);
      
      // Assert
      expect(mockLocation.update).toHaveBeenCalledWith({
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: false,  // Should be converted to boolean false
        Oltozo: false,  // Should remain boolean false
        Parkolas: "Ingyenes",
        Leiras: "",     // Empty string
        Berles: true    // Should be converted to boolean true
      });
    });
    
    it("should return 404 if location not found", async () => {
      // Arrange
      req.params = { id: 999 };
      req.headers = {
        authorization: "Bearer token123"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      Helyszin.findByPk.mockResolvedValue(null);
      
      // Act
      await updateHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Location not found!"
      });
    });
    
    it("should not allow updating locations created by other users", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer token123"
      };
      req.body = {
        Nev: "Sportpálya - frissítve"
      };
      
      jwt.verify.mockReturnValue({ userId: 2 }); // Different user
      
      const mockLocation = {
        id: 1,
        Nev: "Sportpálya",
        userId: 1 // Created by user 1
      };
      
      Helyszin.findByPk.mockResolvedValue(mockLocation);
      
      // Act
      await updateHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You can only update your own locations!"
      });
    });
    
    it("should require authentication token", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {}; // No token
      req.body = {
        Nev: "Sportpálya - frissítve"
      };
      
      // Act
      await updateHelyszin(req, res);
      
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
        Nev: "Sportpálya - frissítve"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      const error = new Error("Database error");
      Helyszin.findByPk.mockRejectedValue(error);
      
      // Act
      await updateHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error updating location",
        error: error
      });
    });
  });
  
  describe("deleteHelyszin", () => {
    it("should delete a location successfully", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer token123"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      const mockLocation = {
        id: 1,
        Nev: "Sportpálya",
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Helyszin.findByPk.mockResolvedValue(mockLocation);
      
      // Act
      await deleteHelyszin(req, res);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith("token123", "secretkey");
      expect(Helyszin.findByPk).toHaveBeenCalledWith(1);
      expect(mockLocation.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Location deleted successfully!"
      });
    });
    
    it("should return 404 if location not found", async () => {
      // Arrange
      req.params = { id: 999 };
      req.headers = {
        authorization: "Bearer token123"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      Helyszin.findByPk.mockResolvedValue(null);
      
      // Act
      await deleteHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Location not found!"
      });
    });
    
    it("should not allow deleting locations created by other users", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer token123"
      };
      
      jwt.verify.mockReturnValue({ userId: 2 }); // Different user
      
      const mockLocation = {
        id: 1,
        Nev: "Sportpálya",
        userId: 1 // Created by user 1
      };
      
      Helyszin.findByPk.mockResolvedValue(mockLocation);
      
      // Act
      await deleteHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You can only delete your own locations!"
      });
    });
    
    it("should require authentication token", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {}; // No token
      
      // Act
      await deleteHelyszin(req, res);
      
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
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      const error = new Error("Database error");
      Helyszin.findByPk.mockRejectedValue(error);
      
      // Act
      await deleteHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error deleting location",
        error: error
      });
    });
  });
  
  describe("getMyOwnHelyszin", () => {
    it("should get user's own locations successfully", async () => {
      // Arrange
      req.user = { userId: 1 };
      
      const mockLocations = [
        { id: 1, Nev: "Sportpálya 1", userId: 1 },
        { id: 2, Nev: "Sportpálya 2", userId: 1 }
      ];
      
      Helyszin.findAll.mockResolvedValue(mockLocations);
      
      // Act
      await getMyOwnHelyszin(req, res);
      
      // Assert
      expect(Helyszin.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1
        }
      });
      expect(res.json).toHaveBeenCalledWith({ locations: mockLocations });
    });
    
    it("should return 404 if user has no locations", async () => {
      // Arrange
      req.user = { userId: 1 };
      
      Helyszin.findAll.mockResolvedValue([]);
      
      // Act
      await getMyOwnHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Előszőr hozzon létre egy helyszínt a +-gomb segítségével!"
      });
    });
    
    it("should return 400 if user ID is missing", async () => {
      // Arrange
      req.user = {}; // No userId
      
      // Act
      await getMyOwnHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User ID is missing in the request."
      });
    });
    
    it("should handle server errors", async () => {
      // Arrange
      req.user = { userId: 1 };
      
      const error = new Error("Database error");
      Helyszin.findAll.mockRejectedValue(error);
      
      // Act
      await getMyOwnHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching locations",
        error: error
      });
    });
  });
  
  describe("JWT verification errors", () => {
    it("should handle invalid tokens in createHelyszin", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer invalidtoken"
      };
      
      req.body = {
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Parkolas: "Ingyenes"
      };
      
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });
      
      // Act
      await createHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating location",
        error: expect.any(Error)
      });
    });
    
    it("should handle invalid tokens in updateHelyszin", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer invalidtoken"
      };
      
      req.body = {
        Nev: "Sportpálya - frissítve"
      };
      
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });
      
      // Act
      await updateHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error updating location",
        error: expect.any(Error)
      });
    });
    
    it("should handle invalid tokens in deleteHelyszin", async () => {
      // Arrange
      req.params = { id: 1 };
      req.headers = {
        authorization: "Bearer invalidtoken"
      };
      
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });
      
      // Act
      await deleteHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error deleting location",
        error: expect.any(Error)
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
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Parkolas: "Ingyenes"
      };
      
      // Act
      await createHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication token is required!"
      });
    });
    
    it("should handle empty location name in create request", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.body = {
        Nev: "", // Empty name
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Parkolas: "Ingyenes"
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      // Act
      await createHelyszin(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Missing required fields for creating location!"
      });
    });
    
    it("should set default empty string for Leiras if not provided", async () => {
      // Arrange
      req.headers = {
        authorization: "Bearer token123"
      };
      
      req.body = {
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Parkolas: "Ingyenes"
        // No Leiras provided
      };
      
      jwt.verify.mockReturnValue({ userId: 1 });
      
      const createdHelyszin = {
        id: 1,
        ...req.body,
        Fedett: false,
        Oltozo: false,
        Leiras: "", // Should be set to empty string
        Berles: false,
        userId: 1
      };
      
      Helyszin.create.mockResolvedValue(createdHelyszin);
      
      // Act
      await createHelyszin(req, res);
      
      // Assert
      expect(Helyszin.create).toHaveBeenCalledWith(expect.objectContaining({
        Leiras: "" // Default empty string
      }));
    });
  });
  
  
  
  describe("Integration scenarios", () => {
    it("should handle the complete flow of creating, updating, and deleting a location", async () => {
      // This is a more complex test that simulates a full lifecycle
      
      // Setup
      const userId = 1;
      const locationId = 1;
      const token = "token123";
      
      jwt.verify.mockReturnValue({ userId });
      
      // 1. Create a location
      req.headers = {
        authorization: `Bearer ${token}`
      };
      
      req.body = {
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: true,
        Oltozo: true,
        Parkolas: "Ingyenes",
        Leiras: "Modern sportpálya a belvárosban",
        Berles: false
      };
      
      const createdLocation = {
        id: locationId,
        ...req.body,
        userId
      };
      
      Helyszin.create.mockResolvedValue(createdLocation);
      
      await createHelyszin(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Location created successfully!",
        helyszin: createdLocation
      });
      
      // Reset mocks for next call
      res.status.mockClear();
      res.json.mockClear();
      
      // 2. Update the location
      req.params = { id: locationId };
      req.body = {
        Nev: "Sportpálya - frissítve",
        Cim: "Új cím",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: false,
        Oltozo: true,
        Parkolas: "Fizetős",
        Leiras: "Frissített leírás",
        Berles: true
      };
      
      const locationToUpdate = {
        id: locationId,
        Nev: "Sportpálya",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: true,
        Oltozo: true,
        Parkolas: "Ingyenes",
        Leiras: "Modern sportpálya a belvárosban",
        Berles: false,
        userId,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Helyszin.findByPk.mockResolvedValue(locationToUpdate);
      
      await updateHelyszin(req, res);
      
      expect(locationToUpdate.update).toHaveBeenCalledWith({
        Nev: "Sportpálya - frissítve",
        Cim: "Új cím",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: false,
        Oltozo: true,
        Parkolas: "Fizetős",
        Leiras: "Frissített leírás",
        Berles: true
      });
      expect(res.status).toHaveBeenCalledWith(200);
      
      // Reset mocks for next call
      res.status.mockClear();
      res.json.mockClear();
      
      // 3. Delete the location
      const locationToDelete = {
        id: locationId,
        Nev: "Sportpálya - frissítve",
        Cim: "Új cím",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Fedett: false,
        Oltozo: true,
        Parkolas: "Fizetős",
        Leiras: "Frissített leírás",
        Berles: true,
        userId,
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Helyszin.findByPk.mockResolvedValue(locationToDelete);
      
      await deleteHelyszin(req, res);
      
      expect(locationToDelete.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Location deleted successfully!"
      });
    });
    
    it("should handle fetching user's own locations after creating them", async () => {
      // Setup
      const userId = 1;
      const token = "token123";
      
      jwt.verify.mockReturnValue({ userId });
      
      // 1. Create a location
      req.headers = {
        authorization: `Bearer ${token}`
      };
      
      req.body = {
        Nev: "Sportpálya 1",
        Cim: "Példa utca 1.",
        Telepules: "Budapest",
        Iranyitoszam: "1111",
        Parkolas: "Ingyenes"
      };
      
      const createdLocation1 = {
        id: 1,
        ...req.body,
        userId
      };
      
      Helyszin.create.mockResolvedValue(createdLocation1);
      
      await createHelyszin(req, res);
      
      // Reset mocks for next call
      res.status.mockClear();
      res.json.mockClear();
      
      // 2. Create another location
      req.body = {
        Nev: "Sportpálya 2",
        Cim: "Példa utca 2.",
        Telepules: "Debrecen",
        Iranyitoszam: "4025",
        Parkolas: "Fizetős"
      };
      
      const createdLocation2 = {
        id: 2,
        ...req.body,
        userId
      };
      
      Helyszin.create.mockResolvedValue(createdLocation2);
      
      await createHelyszin(req, res);
      
      // Reset mocks for next call
      res.status.mockClear();
      res.json.mockClear();
      
      // 3. Fetch user's own locations
      req.user = { userId };
      
      const userLocations = [createdLocation1, createdLocation2];
      
      Helyszin.findAll.mockResolvedValue(userLocations);
      
      await getMyOwnHelyszin(req, res);
      
      expect(Helyszin.findAll).toHaveBeenCalledWith({
        where: {
          userId
        }
      });
      expect(res.json).toHaveBeenCalledWith({ locations: userLocations });
    });
  });
});


