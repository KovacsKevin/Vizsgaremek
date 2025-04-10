const {
  createHelyszin,
  getAllHelyszin,
  getHelyszinById,
  updateHelyszin,
  deleteHelyszin,
  getMyOwnHelyszin
} = require('../controllers/helyszinController');

const Helyszin = require('../models/helyszinModel');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../models/helyszinModel');
jest.mock('jsonwebtoken');

describe('helyszinController', () => {
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
      },
      user: {
        userId: 1
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock JWT verify
    jwt.verify.mockReturnValue({ userId: 1 });
  });

  describe('createHelyszin', () => {
    it('should create a new location successfully', async () => {
      // Setup
      req.body = {
        Nev: 'Test Location',
        Cim: 'Test Address',
        Telepules: 'Test City',
        Iranyitoszam: '1234',
        Parkolas: true,
        Fedett: true,
        Oltozo: false,
        Leiras: 'Test description',
        Berles: false
      };

      const mockHelyszin = {
        id: 1,
        ...req.body,
        userId: 1
      };

      Helyszin.create.mockResolvedValue(mockHelyszin);

      // Execute
      await createHelyszin(req, res);

      // Assert
      expect(Helyszin.create).toHaveBeenCalledWith(
        expect.objectContaining({
          Nev: 'Test Location',
          Cim: 'Test Address',
          Telepules: 'Test City',
          Iranyitoszam: '1234',
          Parkolas: true,
          userId: 1
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Location created successfully!',
          helyszin: mockHelyszin
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      // Setup - missing required fields
      req.body = {
        Nev: 'Test Location',
        // Missing other required fields
      };

      // Execute
      await createHelyszin(req, res);

      // Assert
      expect(Helyszin.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Missing required fields for creating location!'
        })
      );
    });

    it('should return 401 if no token is provided', async () => {
      // Setup
      req.headers.authorization = undefined;

      // Execute
      await createHelyszin(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication token is required!'
        })
      );
    });
  });

  describe('getAllHelyszin', () => {
    it('should return all locations', async () => {
      // Setup
      const mockLocations = [
        { id: 1, Nev: 'Location 1', userId: 1 },
        { id: 2, Nev: 'Location 2', userId: 2 }
      ];

      Helyszin.findAll.mockResolvedValue(mockLocations);

      // Execute
      await getAllHelyszin(req, res);

      // Assert
      expect(Helyszin.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ helyszinek: mockLocations });
    });

    it('should return 404 if no locations found', async () => {
      // Setup
      Helyszin.findAll.mockResolvedValue([]);

      // Execute
      await getAllHelyszin(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No locations found.'
        })
      );
    });
  });

  describe('getHelyszinById', () => {
    it('should return a location by ID', async () => {
      // Setup
      req.params.id = 1;
      const mockLocation = { id: 1, Nev: 'Test Location', userId: 1 };

      Helyszin.findByPk.mockResolvedValue(mockLocation);

      // Execute
      await getHelyszinById(req, res);

      // Assert
      expect(Helyszin.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ helyszin: mockLocation });
    });

    it('should return 404 if location not found', async () => {
      // Setup
      req.params.id = 999;
      Helyszin.findByPk.mockResolvedValue(null);

      // Execute
      await getHelyszinById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Location not found!'
        })
      );
    });
  });

  describe('updateHelyszin', () => {
    it('should update a location successfully', async () => {
      // Setup
      req.params.id = 1;
      req.body = {
        Nev: 'Updated Location',
        Cim: 'Updated Address',
        Telepules: 'Updated City',
        Iranyitoszam: '5678',
        Fedett: 'true',
        Oltozo: 'false',
        Parkolas: true,
        Leiras: 'Updated description',
        Berles: 'true'
      };

      const mockLocation = {
        id: 1,
        Nev: 'Test Location',
        userId: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      Helyszin.findByPk.mockResolvedValue(mockLocation);

      // Execute
      await updateHelyszin(req, res);

      // Assert
      expect(Helyszin.findByPk).toHaveBeenCalledWith(1);
      expect(mockLocation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          Nev: 'Updated Location',
          Fedett: true,
          Oltozo: false,
          Berles: true
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Location updated successfully!'
        })
      );
    });

    it('should return 403 if user is not the owner', async () => {
      // Setup
      req.params.id = 1;
      const mockLocation = {
        id: 1,
        Nev: 'Test Location',
        userId: 2 // Different user
      };

      Helyszin.findByPk.mockResolvedValue(mockLocation);

      // Execute
      await updateHelyszin(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You can only update your own locations!'
        })
      );
    });

    it('should return 404 if location not found', async () => {
      // Setup
      req.params.id = 999;
      Helyszin.findByPk.mockResolvedValue(null);

      // Execute
      await updateHelyszin(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Location not found!'
        })
      );
    });
  });

  describe('deleteHelyszin', () => {
    it('should delete a location successfully', async () => {
      // Setup
      req.params.id = 1;
      const mockLocation = {
        id: 1,
        Nev: 'Test Location',
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      Helyszin.findByPk.mockResolvedValue(mockLocation);

      // Execute
      await deleteHelyszin(req, res);

      // Assert
      expect(Helyszin.findByPk).toHaveBeenCalledWith(1);
      expect(mockLocation.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Location deleted successfully!'
        })
      );
    });

    it('should return 403 if user is not the owner', async () => {
      // Setup
      req.params.id = 1;
      const mockLocation = {
        id: 1,
        Nev: 'Test Location',
        userId: 2 // Different user
      };

      Helyszin.findByPk.mockResolvedValue(mockLocation);

      // Execute
      await deleteHelyszin(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You can only delete your own locations!'
        })
      );
    });

    it('should return 404 if location not found', async () => {
      // Setup
      req.params.id = 999;
      Helyszin.findByPk.mockResolvedValue(null);

      // Execute
      await deleteHelyszin(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Location not found!'
        })
      );
    });
  });

  describe('getMyOwnHelyszin', () => {
    it('should return user\'s own locations', async () => {
      // Setup
      const mockLocations = [
        { id: 1, Nev: 'My Location 1', userId: 1 },
        { id: 2, Nev: 'My Location 2', userId: 1 }
      ];

      Helyszin.findAll.mockResolvedValue(mockLocations);

      // Execute
      await getMyOwnHelyszin(req, res);

      // Assert
      expect(Helyszin.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 1
          }
        })
      );
      expect(res.json).toHaveBeenCalledWith({ locations: mockLocations });
    });

    it('should return 404 if user has no locations', async () => {
      // Setup
      Helyszin.findAll.mockResolvedValue([]);

      // Execute
      await getMyOwnHelyszin(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Előszőr hozzon létre egy helyszínt a +-gomb segítségével!'
        })
      );
    });

    it('should return 400 if userId is missing', async () => {
      // Setup
      req.user = undefined;

      // Execute
      await getMyOwnHelyszin(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID is missing in the request.'
        })
      );
    });
  });
});
