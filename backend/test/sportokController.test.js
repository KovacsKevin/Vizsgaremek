const {
  createSportok,
  getAllSportok,
  getSportokById,
  updateSportok,
  deleteSportok
} = require('../controllers/sportokController');

const Sportok = require('../models/sportokModel');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../models/sportokModel');
jest.mock('jsonwebtoken');

describe('sportokController', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      params: {},
      headers: {
        authorization: 'Bearer token123'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock JWT verify
    jwt.verify.mockReturnValue({ userId: 1 });
  });

  describe('createSportok', () => {
    it('should create a new sport successfully', async () => {
      // Setup
      req.body = {
        Nev: 'Test Sport',
        Leiras: 'Test Description'
      };

      const mockSport = {
        id: 1,
        ...req.body,
        userId: 1
      };

      Sportok.create.mockResolvedValue(mockSport);

      // Execute
      await createSportok(req, res);

      // Assert
      expect(Sportok.create).toHaveBeenCalledWith(
        expect.objectContaining({
          Nev: 'Test Sport',
          Leiras: 'Test Description',
          userId: 1
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Sport created successfully!',
          sportok: mockSport
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      // Setup - missing required fields
      req.body = {
        Nev: 'Test Sport'
        // Missing Leiras
      };

      // Execute
      await createSportok(req, res);

      // Assert
      expect(Sportok.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Missing required fields for creating sport!'
        })
      );
    });

    it('should return 401 if no token is provided', async () => {
      // Setup
      req.headers.authorization = undefined;

      // Execute
      await createSportok(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication token is required!'
        })
      );
    });
  });

  describe('getAllSportok', () => {
    it('should return all sports', async () => {
      // Setup
      const mockSports = [
        { id: 1, Nev: 'Sport 1', Leiras: 'Description 1', userId: 1 },
        { id: 2, Nev: 'Sport 2', Leiras: 'Description 2', userId: 2 }
      ];

      Sportok.findAll.mockResolvedValue(mockSports);

      // Execute
      await getAllSportok(req, res);

      // Assert
      expect(Sportok.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ sportok: mockSports });
    });

    it('should return 404 if no sports found', async () => {
      // Setup
      Sportok.findAll.mockResolvedValue([]);

      // Execute
      await getAllSportok(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No sports found.'
        })
      );
    });
  });

  describe('getSportokById', () => {
    it('should return a sport by ID', async () => {
      // Setup
      req.params.id = 1;
      const mockSport = { id: 1, Nev: 'Test Sport', Leiras: 'Test Description', userId: 1 };

      Sportok.findByPk.mockResolvedValue(mockSport);

      // Execute
      await getSportokById(req, res);

      // Assert
      expect(Sportok.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ sportok: mockSport });
    });

    it('should return 404 if sport not found', async () => {
      // Setup
      req.params.id = 999;
      Sportok.findByPk.mockResolvedValue(null);

      // Execute
      await getSportokById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Sport not found!'
        })
      );
    });
  });

  describe('updateSportok', () => {
    it('should update a sport successfully', async () => {
      // Setup
      req.params.id = 1;
      req.body = {
        Nev: 'Updated Sport',
        Leiras: 'Updated Description'
      };

      const mockSport = {
        id: 1,
        Nev: 'Test Sport',
        Leiras: 'Test Description',
        userId: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      Sportok.findByPk.mockResolvedValue(mockSport);

      // Execute
      await updateSportok(req, res);

      // Assert
      expect(Sportok.findByPk).toHaveBeenCalledWith(1);
      expect(mockSport.update).toHaveBeenCalledWith(
        expect.objectContaining({
          Nev: 'Updated Sport',
          Leiras: 'Updated Description'
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Sport updated successfully!'
        })
      );
    });

    it('should return 403 if user is not the owner', async () => {
      // Setup
      req.params.id = 1;
      const mockSport = {
        id: 1,
        Nev: 'Test Sport',
        Leiras: 'Test Description',
        userId: 2 // Different user
      };

      Sportok.findByPk.mockResolvedValue(mockSport);

      // Execute
      await updateSportok(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You can only update your own sports!'
        })
      );
    });

    it('should return 404 if sport not found', async () => {
      // Setup
      req.params.id = 999;
      Sportok.findByPk.mockResolvedValue(null);

      // Execute
      await updateSportok(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Sport not found!'
        })
      );
    });
  });

  describe('deleteSportok', () => {
    it('should delete a sport successfully', async () => {
      // Setup
      req.params.id = 1;
      const mockSport = {
        id: 1,
        Nev: 'Test Sport',
        Leiras: 'Test Description',
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      Sportok.findByPk.mockResolvedValue(mockSport);

      // Execute
      await deleteSportok(req, res);

      // Assert
      expect(Sportok.findByPk).toHaveBeenCalledWith(1);
      expect(mockSport.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Sport deleted successfully!'
        })
      );
    });

    it('should return 403 if user is not the owner', async () => {
      // Setup
      req.params.id = 1;
      const mockSport = {
        id: 1,
        Nev: 'Test Sport',
        Leiras: 'Test Description',
        userId: 2 // Different user
      };

      Sportok.findByPk.mockResolvedValue(mockSport);

      // Execute
      await deleteSportok(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You can only delete your own sports!'
        })
      );
    });

    it('should return 404 if sport not found', async () => {
      // Setup
      req.params.id = 999;
      Sportok.findByPk.mockResolvedValue(null);

      // Execute
      await deleteSportok(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Sport not found!'
        })
      );
    });
  });
});
