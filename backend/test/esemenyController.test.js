const {
  createEsemeny,
  getEsemenyById,
  getAllEsemeny,
  updateEsemeny,
  deleteEsemeny,
  getEventParticipants,
  leaveEsemeny,
  joinEsemeny,
  approveParticipant,
  rejectParticipant,
  getEsemenyekByTelepulesAndSportNev,
  getOrganizedEvents,
  getParticipatedEvents,
  inviteUserToEvent,
  acceptInvitation,
  rejectInvitation,
  checkParticipation,
  removeParticipant,
  getEsemenyekFilteredByUserAge,
  getPendingEvents,
  cancelPendingRequest
} = require('./esemenyController');
const User = require('../models/userModel');
const Helyszin = require('../models/helyszinModel');
const Esemény = require('../models/esemenyModel');
const Sportok = require('../models/sportokModel');
const Résztvevő = require('../models/resztvevoModel');
const sequelize = require('../config/db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { scheduleEventDeletion } = require('../utils/eventScheduler');

// Mock dependencies
jest.mock('../models/userModel');
jest.mock('../models/helyszinModel');
jest.mock('../models/esemenyModel');
jest.mock('../models/sportokModel');
jest.mock('../models/resztvevoModel');
jest.mock('../config/db');
jest.mock('jsonwebtoken');
jest.mock('multer');
jest.mock('fs');
jest.mock('path');
jest.mock('../utils/eventScheduler');

describe('esemenyController', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request and response objects
    req = {
      params: {},
      body: {},
      headers: {
        authorization: 'Bearer test-token'
      },
      file: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Mock JWT verification
    jwt.verify.mockReturnValue({ userId: 1 });
    
    // Mock transaction
    sequelize.transaction.mockImplementation(async (callback) => {
      return await callback({ transaction: 'mock-transaction' });
    });
    
    // Mock multer upload
    const mockUpload = jest.fn().mockImplementation((req, res, callback) => callback());
    multer.mockReturnValue({
      single: jest.fn().mockReturnValue(mockUpload)
    });

    // Mock fs functions
    fs.existsSync = jest.fn().mockReturnValue(false);
    fs.mkdirSync = jest.fn();
    fs.unlinkSync = jest.fn();

    // Mock path functions
    path.join = jest.fn().mockReturnValue('/mock/path');
    path.extname = jest.fn().mockReturnValue('.jpg');

    // Mock scheduleEventDeletion
    scheduleEventDeletion.mockImplementation(() => {});

    // Mock sequelize operators
    sequelize.literal = jest.fn().mockReturnValue('LITERAL');
    sequelize.fn = jest.fn().mockReturnValue('COUNT');
    sequelize.col = jest.fn().mockReturnValue('id');
    
    // Mock Op object
    const Op = {
      gt: Symbol('gt'),
      lt: Symbol('lt'),
      lte: Symbol('lte'),
      gte: Symbol('gte'),
      ne: Symbol('ne'),
      in: Symbol('in'),
      notIn: Symbol('notIn'),
      like: Symbol('like'),
      or: Symbol('or')
    };
    
    // Add Op to sequelize mock
    sequelize.Op = Op;
  });
  
  describe('createEsemeny', () => {
    it('should create a new event and add creator as participant', async () => {
      // Setup
      req.body = {
        helyszinId: 1,
        sportId: 1,
        kezdoIdo: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        zaroIdo: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        szint: 'kezdő',
        minimumEletkor: 18,
        maximumEletkor: 60,
        maximumLetszam: 10
      };
      
      const mockEvent = {
        id: 1,
        ...req.body,
        userId: 1
      };
      
      const mockParticipant = {
        id: 1,
        eseményId: 1,
        userId: 1,
        szerep: 'szervező',
        státusz: 'elfogadva',
        csatlakozásDátuma: new Date()
      };
      
      Esemény.create.mockResolvedValue(mockEvent);
      Résztvevő.create.mockResolvedValue(mockParticipant);
      
      // Execute
      await createEsemeny(req, res);
      
      // Assert
      expect(Esemény.create).toHaveBeenCalledWith(
        expect.objectContaining({
          helyszinId: 1,
          sportId: 1,
          userId: 1
        }),
        expect.any(Object)
      );
      
      expect(Résztvevő.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eseményId: 1,
          userId: 1,
          szerep: 'szervező',
          státusz: 'elfogadva'
        }),
        expect.any(Object)
      );
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Event created successfully!"
        })
      );
    });
    
    it('should return error if required fields are missing', async () => {
      // Setup - missing required fields
      req.body = {
        helyszinId: 1,
        // Missing other required fields
      };
      
      // Execute
      await createEsemeny(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Missing required fields for creating event!"
        })
      );
    });
  });
  
  describe('getEsemenyById', () => {
    it('should return event by ID', async () => {
      // Setup
      req.params.id = 1;
      
      const mockEvent = {
        id: 1,
        helyszinId: 1,
        sportId: 1,
        kezdoIdo: new Date(),
        zaroIdo: new Date(),
        szint: 'kezdő',
        minimumEletkor: 18,
        maximumEletkor: 60,
        maximumLetszam: 10,
        userId: 1
      };
      
      Esemény.findByPk.mockResolvedValue(mockEvent);
      
      // Execute
      await getEsemenyById(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ esemeny: mockEvent });
    });
    
    it('should return 404 if event not found', async () => {
      // Setup
      req.params.id = 999;
      Esemény.findByPk.mockResolvedValue(null);
      
      // Execute
      await getEsemenyById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Event not found!"
        })
      );
    });
  });
  
  describe('getAllEsemeny', () => {
    it('should return all active events', async () => {
      // Setup
      const mockEvents = [
        {
          id: 1,
          helyszinId: 1,
          sportId: 1,
          kezdoIdo: new Date(),
          zaroIdo: new Date(Date.now() + 86400000), // Tomorrow
          szint: 'kezdő',
          userId: 1
        },
        {
          id: 2,
          helyszinId: 2,
          sportId: 2,
          kezdoIdo: new Date(),
          zaroIdo: new Date(Date.now() + 172800000), // Day after tomorrow
          szint: 'haladó',
          userId: 2
        }
      ];
      
      Esemény.findAll.mockResolvedValue(mockEvents);
      
      // Execute
      await getAllEsemeny(req, res);
      
      // Assert
      expect(Esemény.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ events: mockEvents });
    });
    
    it('should return 404 if no events found', async () => {
      // Setup
      Esemény.findAll.mockResolvedValue([]);
      
      // Execute
      await getAllEsemeny(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No events found."
        })
      );
    });
  });
  
  describe('updateEsemeny', () => {
    it('should update an event if user is organizer', async () => {
      // Setup
      req.params.id = 1;
      req.body = {
        helyszinId: 1,
        sportId: 1,
        kezdoIdo: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        zaroIdo: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        szint: 'haladó',
        minimumEletkor: 20,
        maximumEletkor: 50,
        maximumLetszam: 15,
        leiras: 'Updated description'
      };
      
      const mockEvent = {
        id: 1,
        helyszinId: 1,
        sportId: 1,
        kezdoIdo: new Date(),
        zaroIdo: new Date(),
        szint: 'kezdő',
        minimumEletkor: 18,
        maximumEletkor: 60,
        maximumLetszam: 10,
        userId: 1,
        update: jest.fn().mockResolvedValue(true)
      };
      
      const mockUpdatedEvent = {
        ...mockEvent,
        ...req.body
      };
      
      Esemény.findByPk.mockResolvedValueOnce(mockEvent).mockResolvedValueOnce(mockUpdatedEvent);
      
      Résztvevő.findOne.mockResolvedValue({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      // Execute
      await updateEsemeny(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 1,
            szerep: 'szervező'
          }
        })
      );
      expect(mockEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          szint: 'haladó',
          minimumEletkor: 20,
          maximumEletkor: 50,
          maximumLetszam: 15,
          leiras: 'Updated description'
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should return 403 if user is not organizer', async () => {
      // Setup
      req.params.id = 1;
      req.body = {
        helyszinId: 1,
        sportId: 1,
        kezdoIdo: new Date(Date.now() + 86400000).toISOString(),
        zaroIdo: new Date(Date.now() + 172800000).toISOString(),
        szint: 'haladó',
        minimumEletkor: 20,
        maximumEletkor: 50,
        maximumLetszam: 15
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1,
        kezdoIdo: new Date(),
        zaroIdo: new Date(),
        userId: 2 // Different user
      });
      
      Résztvevő.findOne.mockResolvedValue(null); // User is not organizer
      
      // Execute
      await updateEsemeny(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "You can only edit events where you are the organizer!"
        })
      );
    });
  });
  
  describe('deleteEsemeny', () => {
    it('should delete an event if user is organizer', async () => {
      // Setup
      req.params.id = 1;
      
      const mockEvent = {
        id: 1,
        helyszinId: 1,
        sportId: 1,
        userId: 1,
        imageUrl: null,
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Esemény.findByPk.mockResolvedValue(mockEvent);
      
      Résztvevő.findOne.mockResolvedValue({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      Résztvevő.destroy.mockResolvedValue(true);
      
      // Execute
      await deleteEsemeny(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 1,
            szerep: 'szervező'
          }
        })
      );
      expect(Résztvevő.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1
          }
        })
      );
      expect(mockEvent.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Event deleted successfully!"
        })
      );
    });
    
    it('should return 403 if user is not organizer', async () => {
      // Setup
      req.params.id = 1;
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1,
        userId: 2 // Different user
      });
      
      Résztvevő.findOne.mockResolvedValue(null); // User is not organizer
      
      // Execute
      await deleteEsemeny(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "You can only delete events where you are the organizer!"
        })
      );
    });
  });
  
  describe('getEventParticipants', () => {
    it('should return all participants for an event', async () => {
      // Setup
      req.params.id = 1;
      
      const mockEvent = {
        id: 1,
        maximumLetszam: 10
      };
      
      const mockParticipants = [
        {
          userId: 1,
          szerep: 'szervező',
          csatlakozásDátuma: new Date(),
          User: {
            id: 1,
            username: 'organizer',
            email: 'organizer@example.com',
            profilePicture: 'profile1.jpg',
            birthDate: '1990-01-01'
          }
        },
        {
          userId: 2,
          szerep: 'játékos',
          csatlakozásDátuma: new Date(),
          User: {
            id: 2,
            username: 'player1',
            email: 'player1@example.com',
            profilePicture: 'profile2.jpg',
            birthDate: '1995-05-05'
          }
        }
      ];
      
      Esemény.findByPk.mockResolvedValue(mockEvent);
      Résztvevő.findAll.mockResolvedValue(mockParticipants);
      
      // Execute
      await getEventParticipants(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            státusz: 'elfogadva'
          }
        })
      );
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          participants: expect.any(Array),
          count: 2,
          maxParticipants: 10
        })
      );
    });
    
    it('should return 404 if event not found', async () => {
      // Setup
      req.params.id = 999;
      Esemény.findByPk.mockResolvedValue(null);
      
      // Execute
      await getEventParticipants(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Event not found!"
        })
      );
    });
  });
  
  describe('leaveEsemeny', () => {
    it('should allow a player to leave an event', async () => {
      // Setup
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      const mockParticipant = {
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValue(mockParticipant);
      
      // Execute
      await leaveEsemeny(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 1
          }
        })
      );
      expect(mockParticipant.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "You have successfully left the event!"
        })
      );
    });
    
    it('should not allow organizers to leave an event', async () => {
      // Setup
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      Résztvevő.findOne.mockResolvedValue({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      // Execute
      await leaveEsemeny(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Only players can leave an event. Organizers must delete the event instead."
        })
      );
    });
  });
  
  describe('joinEsemeny', () => {
    beforeEach(() => {
      // Add user to request object
      req.user = { userId: 1 };
    });
    
    it('should create a pending join request', async () => {
      // Setup
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1,
        maximumLetszam: 10
      });
      
      Résztvevő.findOne.mockResolvedValue(null); // User is not a participant yet
      
      const mockNewParticipant = {
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        státusz: 'függőben',
        csatlakozásDátuma: new Date()
      };
      
      Résztvevő.create.mockResolvedValue(mockNewParticipant);
      
      User.findByPk.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      });
      
      // Execute
      await joinEsemeny(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { eseményId: 1, userId: 1 }
        })
      );
      expect(Résztvevő.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eseményId: 1,
          userId: 1,
          szerep: 'játékos',
          státusz: 'függőben'
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Csatlakozási kérelem elküldve"
        })
      );
    });
    
    it('should return error if user is already a participant', async () => {
      // Setup
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      Résztvevő.findOne.mockResolvedValue({
        eseményId: 1,
        userId: 1,
        státusz: 'elfogadva'
      });
      
      // Execute
      await joinEsemeny(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "A felhasználó már résztvevője az eseménynek"
        })
      );
    });
  });
  
  describe('approveParticipant', () => {
    beforeEach(() => {
      // Add user to request object
      req.user = { userId: 1 };
    });
    
    it('should approve a pending participant', async () => {
      // Setup
      req.body = {
        eseményId: 1,
        userId: 2 // Participant to approve
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1,
        maximumLetszam: 10
      });
      
      // Current user is organizer
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      // Participant to approve
      const mockPendingParticipant = {
        eseményId: 1,
        userId: 2,
        szerep: 'játékos',
        státusz: 'függőben',
        csatlakozásDátuma: new Date(),
        update: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValueOnce(mockPendingParticipant);
      
      // Current participant count
      Résztvevő.count.mockResolvedValue(5); // 5 < maximumLetszam (10)
      
      User.findByPk.mockResolvedValue({
        id: 2,
        username: 'player',
        email: 'player@example.com',
        birthDate: '1990-01-01'
      });
      
      // Execute
      await approveParticipant(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 1,
            szerep: 'szervező'
          }
        })
      );
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 2,
            státusz: 'függőben'
          }
        })
      );
      expect(mockPendingParticipant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          státusz: 'elfogadva'
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Participant approved successfully!"
        })
      );
    });
    
    it('should not approve if event is full', async () => {
      // Setup
      req.body = {
        eseményId: 1,
        userId: 2 // Participant to approve
      };
      
      const mockEvent = {
        id: 1,
        helyszinId: 1,
        sportId: 1,
        maximumLetszam: 10
      };
      
      Esemény.findByPk.mockResolvedValue(mockEvent);
      
      // Current user is organizer
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      // Participant to approve
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 2,
        szerep: 'játékos',
        státusz: 'függőben'
      });
      
      // Current participant count equals maximum
      Résztvevő.count.mockResolvedValue(10); // 10 = maximumLetszam (10)
      
      // Execute
      await approveParticipant(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Cannot approve participant: maximum number of participants reached!"
        })
      );
    });
  });
  
  describe('rejectParticipant', () => {
    beforeEach(() => {
      // Add user to request object
      req.user = { userId: 1 };
    });
    
    it('should reject a pending participant', async () => {
      // Setup
      req.body = {
        eseményId: 1,
        userId: 2 // Participant to reject
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      // Current user is organizer
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      // Participant to reject
      const mockPendingParticipant = {
        eseményId: 1,
        userId: 2,
        szerep: 'játékos',
        státusz: 'függőben',
        update: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValueOnce(mockPendingParticipant);
      
      // Execute
      await rejectParticipant(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 1,
            szerep: 'szervező'
          }
        })
      );
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 2,
            státusz: 'függőben'
          }
        })
      );
      expect(mockPendingParticipant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          státusz: 'elutasítva'
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Participant rejected successfully!"
        })
      );
    });
  });
  
  describe('getEsemenyekByTelepulesAndSportNev', () => {
    it('should return events filtered by city and sport', async () => {
      // Setup
      req.params = {
        telepules: 'Budapest',
        sportNev: 'Futball'
      };
      
      const mockEvents = [
        {
          id: 1,
          helyszinId: 1,
          sportId: 1,
          kezdoIdo: new Date(),
          zaroIdo: new Date(Date.now() + 86400000), // Tomorrow
          Helyszin: {
            Id: 1,
            Nev: 'Sport Center',
            Telepules: 'Budapest'
          },
          Sportok: {
            Id: 1,
            Nev: 'Futball',
            KepUrl: 'football.jpg'
          }
        }
      ];
      
      Esemény.findAll.mockResolvedValue(mockEvents);
      
      // Execute
      await getEsemenyekByTelepulesAndSportNev(req, res);
      
      // Assert
      expect(Esemény.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            expect.objectContaining({
              model: Helyszin,
              where: { Telepules: 'Budapest' }
            }),
            expect.objectContaining({
              model: Sportok,
              where: { Nev: 'Futball' }
            })
          ]
        })
      );
      expect(res.json).toHaveBeenCalledWith({ events: mockEvents });
    });
    
    it('should return 404 if no events found', async () => {
      // Setup
      req.params = {
        telepules: 'SmallTown',
        sportNev: 'RareSport'
      };
      
      Esemény.findAll.mockResolvedValue([]);
      
      // Execute
      await getEsemenyekByTelepulesAndSportNev(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No events found for the specified city and sport."
        })
      );
    });
  });
  
  describe('getOrganizedEvents', () => {
    it('should return events where user is organizer', async () => {
      // Setup
      const mockEvents = [
        {
          id: 1,
          helyszinId: 1,
          sportId: 1,
          kezdoIdo: new Date(),
          zaroIdo: new Date(Date.now() + 86400000), // Tomorrow
          Helyszin: {
            Telepules: 'Budapest',
            Nev: 'Sport Center'
          },
          Sportok: {
            Nev: 'Futball',
            KepUrl: 'football.jpg'
          },
          résztvevőkSzáma: 5
        }
      ];
      
      Esemény.findAll.mockResolvedValue(mockEvents);
      
      // Execute
      await getOrganizedEvents(req, res);
      
      // Assert
      expect(Esemény.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            expect.objectContaining({
              model: Résztvevő,
              where: {
                userId: 1,
                szerep: 'szervező'
              }
            })
          ]
        })
      );
      expect(res.json).toHaveBeenCalledWith({ events: mockEvents });
    });
    
    it('should return 404 if no organized events found', async () => {
      // Setup
      Esemény.findAll.mockResolvedValue([]);
      
      // Execute
      await getOrganizedEvents(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Nem találhatók szervezett események."
        })
      );
    });
  });
  
  describe('getParticipatedEvents', () => {
    it('should return events where user is a player', async () => {
      // Setup
      const mockEvents = [
        {
          id: 1,
          helyszinId: 1,
          sportId: 1,
          kezdoIdo: new Date(),
          zaroIdo: new Date(Date.now() + 86400000), // Tomorrow
          Helyszin: {
            Telepules: 'Budapest',
            Nev: 'Sport Center'
          },
          Sportok: {
            Nev: 'Futball',
            KepUrl: 'football.jpg'
          },
          résztvevőkSzáma: 5
        }
      ];
      
      Esemény.findAll.mockResolvedValue(mockEvents);
      
      // Execute
      await getParticipatedEvents(req, res);
      
      // Assert
      expect(Esemény.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            expect.objectContaining({
              model: Résztvevő,
              where: {
                userId: 1,
                szerep: 'játékos',
                státusz: 'elfogadva'
              }
            })
          ]
        })
      );
      expect(res.json).toHaveBeenCalledWith({ events: mockEvents });
    });
    
    it('should return 404 if no participated events found', async () => {
      // Setup
      Esemény.findAll.mockResolvedValue([]);
      
      // Execute
      await getParticipatedEvents(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Nem találhatók események, ahol játékosként veszel részt."
        })
      );
    });
  });
  
  describe('inviteUserToEvent', () => {
    it('should invite a user to an event', async () => {
      // Setup
      req.body = {
        eseményId: 1,
        invitedUserId: 2
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      // Current user is a participant
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        státusz: 'elfogadva'
      });
      
      // Invited user exists
      User.findByPk.mockResolvedValue({
        id: 2,
        username: 'inviteduser'
      });
      
      // Invited user is not already a participant
      Résztvevő.findOne.mockResolvedValueOnce(null);
      
      const mockInvitation = {
        eseményId: 1,
        userId: 2,
        szerep: 'játékos',
        státusz: 'függőben',
        csatlakozásDátuma: new Date()
      };
      
      Résztvevő.create.mockResolvedValue(mockInvitation);
      
      // Execute
      await inviteUserToEvent(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 1,
            státusz: 'elfogadva'
          }
        })
      );
      expect(User.findByPk).toHaveBeenCalledWith(2);
      expect(Résztvevő.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eseményId: 1,
          userId: 2,
          szerep: 'játékos',
          státusz: 'függőben'
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invitation sent successfully!"
        })
      );
    });
    
    it('should return error if user is already a participant', async () => {
      // Setup
      req.body = {
        eseményId: 1,
        invitedUserId: 2
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      // Current user is a participant
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        státusz: 'elfogadva'
      });
      
      // Invited user exists
      User.findByPk.mockResolvedValue({
        id: 2,
        username: 'inviteduser'
      });
      
      // Invited user is already a participant
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 2,
        státusz: 'elfogadva'
      });
      
      // Execute
      await inviteUserToEvent(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User is already a participant in this event!"
        })
      );
    });
  });
  
  describe('acceptInvitation', () => {
    beforeEach(() => {
      // Add user to request object
      req.user = { userId: 1 };
    });
    
    it('should accept an invitation and set status to pending', async () => {
      // Setup
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1,
        maximumLetszam: 10
      });
      
      // User has an invitation
      const mockInvitation = {
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        státusz: 'meghívott',
        update: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValue(mockInvitation);
      
      // Execute
      await acceptInvitation(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 1,
            státusz: 'meghívott'
          }
        })
      );
      expect(mockInvitation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          státusz: 'függőben'
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Csatlakozási kérelem elküldve"
        })
      );
    });
    
    it('should create a new pending request if no invitation exists', async () => {
      // Setup
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1,
        maximumLetszam: 10
      });
      
      // User has no invitation
      Résztvevő.findOne.mockResolvedValue(null);
      
      const mockNewParticipant = {
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        státusz: 'függőben',
        csatlakozásDátuma: new Date()
      };
      
      Résztvevő.create.mockResolvedValue(mockNewParticipant);
      
      // Execute
      await acceptInvitation(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eseményId: 1,
          userId: 1,
          szerep: 'játékos',
          státusz: 'függőben'
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Csatlakozási kérelem elküldve"
        })
      );
    });
  });
  
  describe('rejectInvitation', () => {
    beforeEach(() => {
      // Add user to request object
      req.user = { userId: 1 };
    });
    
    it('should reject an invitation by removing it', async () => {
      // Setup
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      // User has an invitation
      const mockInvitation = {
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        státusz: 'meghívott',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValue(mockInvitation);
      
      // Execute
      await rejectInvitation(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
            expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 1
          }
        })
      );
      expect(mockInvitation.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invitation rejected successfully!"
        })
      );
    });
    
    it('should return 404 if no invitation found', async () => {
      // Setup
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      // User has no invitation
      Résztvevő.findOne.mockResolvedValue(null);
      
      // Execute
      await rejectInvitation(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invitation not found!"
        })
      );
    });
  });
  
  describe('checkParticipation', () => {
    it('should return participation status for a user', async () => {
      // Setup
      req.params.id = 1;
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      // User is a participant
      Résztvevő.findOne.mockResolvedValue({
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        státusz: 'elfogadva'
      });
      
      // Execute
      await checkParticipation(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 1
          }
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        isParticipant: true,
        status: 'elfogadva',
        role: 'játékos'
      });
    });
    
    it('should return false if user is not a participant', async () => {
      // Setup
      req.params.id = 1;
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      // User is not a participant
      Résztvevő.findOne.mockResolvedValue(null);
      
      // Execute
      await checkParticipation(req, res);
      
      // Assert
      expect(res.json).toHaveBeenCalledWith({
        isParticipant: false,
        status: '',
        role: ''
      });
    });
  });
  
  describe('removeParticipant', () => {
    it('should allow an organizer to remove a player', async () => {
      // Setup
      req.body = {
        eseményId: 1,
        userId: 2 // Player to remove
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      // Current user is organizer
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      // Player to remove
      const mockPlayerParticipant = {
        eseményId: 1,
        userId: 2,
        szerep: 'játékos',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValueOnce(mockPlayerParticipant);
      
      // Execute
      await removeParticipant(req, res);
      
      // Assert
      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 1,
            szerep: 'szervező'
          }
        })
      );
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: 1,
            userId: 2
          }
        })
      );
      expect(mockPlayerParticipant.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Participant successfully removed from the event!"
        })
      );
    });
    
    it('should not allow removing an organizer', async () => {
      // Setup
      req.body = {
        eseményId: 1,
        userId: 2 // Organizer to remove
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      // Current user is organizer
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      // Participant to remove is also an organizer
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 2,
        szerep: 'szervező'
      });
      
      // Execute
      await removeParticipant(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Organizers cannot be removed from the event!"
        })
      );
    });
  });
  
  describe('getEsemenyekFilteredByUserAge', () => {
    it('should return events filtered by user age', async () => {
      // Setup
      req.params = {
        telepules: 'Budapest',
        sportNev: 'Futball'
      };
      
      // Mock user with age 30
      User.findByPk.mockResolvedValue({
        id: 1,
        username: 'testuser',
        birthDate: new Date(new Date().getFullYear() - 30, 0, 1) // 30 years old
      });
      
      const mockEvents = [
        {
          id: 1,
          helyszinId: 1,
          sportId: 1,
          kezdoIdo: new Date(),
          zaroIdo: new Date(Date.now() + 86400000), // Tomorrow
          minimumEletkor: 18,
          maximumEletkor: 40,
          Helyszin: {
            Id: 1,
            Nev: 'Sport Center',
            Telepules: 'Budapest'
          },
          Sportok: {
            Id: 1,
            Nev: 'Futball',
            KepUrl: 'football.jpg'
          }
        }
      ];
      
      Esemény.findAll.mockResolvedValue(mockEvents);
      
      // Execute
      await getEsemenyekFilteredByUserAge(req, res);
      
      // Assert
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Esemény.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            minimumEletkor: expect.any(Object),
            maximumEletkor: expect.any(Object),
            zaroIdo: expect.any(Object)
          },
          include: [
            expect.objectContaining({
              model: Helyszin,
              where: { Telepules: 'Budapest' }
            }),
            expect.objectContaining({
              model: Sportok,
              where: { Nev: 'Futball' }
            })
          ]
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          events: mockEvents,
          userAge: 30
        })
      );
    });
    
    it('should return 404 if no events match age criteria', async () => {
      // Setup
      req.params = {
        telepules: 'Budapest',
        sportNev: 'Futball'
      };
      
      // Mock user with age 15
      User.findByPk.mockResolvedValue({
        id: 1,
        username: 'testuser',
        birthDate: new Date(new Date().getFullYear() - 15, 0, 1) // 15 years old
      });
      
      // No events match the age criteria
      Esemény.findAll.mockResolvedValue([]);
      
      // Execute
      await getEsemenyekFilteredByUserAge(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No events found for the specified city, sport, and your age range.",
          userAge: 15
        })
      );
    });
  });
  
  describe('getPendingEvents', () => {
    beforeEach(() => {
      // Add user to request object
      req.user = { userId: 1 };
    });
    
    it('should return pending events for the user', async () => {
      // Setup
      const mockPendingEvents = [
        {
          Esemény: {
            id: 1,
            kezdoIdo: new Date(),
            zaroIdo: new Date(Date.now() + 86400000), // Tomorrow
            szint: 'kezdő',
            minimumEletkor: 18,
            maximumEletkor: 60,
            maximumLetszam: 10,
            Helyszin: {
              Id: 1,
              Nev: 'Sport Center',
              Telepules: 'Budapest'
            },
            Sportok: {
              Id: 1,
              Nev: 'Futball',
              KepUrl: 'football.jpg'
            }
          },
          státusz: 'függőben',
          szerep: 'játékos'
        }
      ];
      
      Résztvevő.findAll.mockResolvedValue(mockPendingEvents);
      
      // Mock participant count
      sequelize.fn = jest.fn().mockReturnValue('COUNT');
      sequelize.col = jest.fn().mockReturnValue('id');
      Résztvevő.findAll.mockResolvedValueOnce([
        {
          eseményId: 1,
          getDataValue: jest.fn().mockReturnValue(5)
        }
      ]);
      
      // Execute
      await getPendingEvents(req, res);
      
      // Assert
      expect(Résztvevő.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 1,
            státusz: 'függőben'
          }
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          events: expect.any(Array)
        })
      );
    });
    
    it('should return 404 if no pending events found', async () => {
      // Setup
      Résztvevő.findAll.mockResolvedValue([]);
      
      // Execute
      await getPendingEvents(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Nincsenek függőben lévő eseményeid."
        })
      );
    });
  });
  
  describe('cancelPendingRequest', () => {
    beforeEach(() => {
      // Add user to request object
      req.user = { userId: 1 };
    });
    
    it('should cancel a pending request', async () => {
      // Setup
      req.body = {
        eseményId: 1
      };
      
      // User has a pending request
      const mockPendingRequest = {
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        státusz: 'függőben',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValue(mockPendingRequest);
      
      // Execute
      await cancelPendingRequest(req, res);
      
      // Assert
      expect(Résztvevő.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 1,
            eseményId: 1,
            státusz: 'függőben'
          }
        })
      );
      expect(mockPendingRequest.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Jelentkezés sikeresen visszavonva"
        })
      );
    });
    
    it('should return 404 if no pending request found', async () => {
      // Setup
      req.body = {
        eseményId: 1
      };
      
      // User has no pending request
      Résztvevő.findOne.mockResolvedValue(null);
      
      // Execute
      await cancelPendingRequest(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Nem található függőben lévő kérelem ehhez az eseményhez"
        })
      );
    });
  });
});



