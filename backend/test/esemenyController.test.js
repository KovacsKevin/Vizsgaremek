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
    jest.clearAllMocks();

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
    
    jwt.verify.mockReturnValue({ userId: 1 });
    
    sequelize.transaction.mockImplementation(async (callback) => {
      return await callback({ transaction: 'mock-transaction' });
    });
    
    const mockUpload = jest.fn().mockImplementation((req, res, callback) => callback());
    multer.mockReturnValue({
      single: jest.fn().mockReturnValue(mockUpload)
    });

    fs.existsSync = jest.fn().mockReturnValue(false);
    fs.mkdirSync = jest.fn();
    fs.unlinkSync = jest.fn();

    path.join = jest.fn().mockReturnValue('/mock/path');
    path.extname = jest.fn().mockReturnValue('.jpg');

    scheduleEventDeletion.mockImplementation(() => {});

    sequelize.literal = jest.fn().mockReturnValue('LITERAL');
    sequelize.fn = jest.fn().mockReturnValue('COUNT');
    sequelize.col = jest.fn().mockReturnValue('id');

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

    sequelize.Op = Op;
  });
  
  describe('createEsemeny', () => {
    it('should create a new event and add creator as participant', async () => {
      req.body = {
        helyszinId: 1,
        sportId: 1,
        kezdoIdo: new Date(Date.now() + 86400000).toISOString(),
        zaroIdo: new Date(Date.now() + 172800000).toISOString(), 
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
      
      await createEsemeny(req, res);
      
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
      req.body = {
        helyszinId: 1,
      };
      
      await createEsemeny(req, res);
      
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
      
      await getEsemenyById(req, res);

      expect(Esemény.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ esemeny: mockEvent });
    });
    
    it('should return 404 if event not found', async () => {
      req.params.id = 999;
      Esemény.findByPk.mockResolvedValue(null);
      
      await getEsemenyById(req, res);
      
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
      const mockEvents = [
        {
          id: 1,
          helyszinId: 1,
          sportId: 1,
          kezdoIdo: new Date(),
          zaroIdo: new Date(Date.now() + 86400000), 
          szint: 'kezdő',
          userId: 1
        },
        {
          id: 2,
          helyszinId: 2,
          sportId: 2,
          kezdoIdo: new Date(),
          zaroIdo: new Date(Date.now() + 172800000), 
          szint: 'haladó',
          userId: 2
        }
      ];
      
      Esemény.findAll.mockResolvedValue(mockEvents);

      await getAllEsemeny(req, res);

      expect(Esemény.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ events: mockEvents });
    });
    
    it('should return 404 if no events found', async () => {
      Esemény.findAll.mockResolvedValue([]);
      
      await getAllEsemeny(req, res);
      
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
      req.params.id = 1;
      req.body = {
        helyszinId: 1,
        sportId: 1,
        kezdoIdo: new Date(Date.now() + 86400000).toISOString(),
        zaroIdo: new Date(Date.now() + 172800000).toISOString(), 
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
      
      await updateEsemeny(req, res);
      
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
        userId: 2 
      });
      
      Résztvevő.findOne.mockResolvedValue(null); 

      await updateEsemeny(req, res);
      
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

      await deleteEsemeny(req, res);

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
      req.params.id = 1;
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1,
        userId: 2 
      });
      
      Résztvevő.findOne.mockResolvedValue(null); 

      await deleteEsemeny(req, res);
      
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
      
      await getEventParticipants(req, res);
      
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
      req.params.id = 999;
      Esemény.findByPk.mockResolvedValue(null);

      await getEventParticipants(req, res);
      
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
      
      await leaveEsemeny(req, res);
      
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
      
      await leaveEsemeny(req, res);
    
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
      req.user = { userId: 1 };
    });
    
    it('should create a pending join request', async () => {
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1,
        maximumLetszam: 10
      });
      
      Résztvevő.findOne.mockResolvedValue(null);
      
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
      
      await joinEsemeny(req, res);
      
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

      await joinEsemeny(req, res);
      
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
      req.user = { userId: 1 };
    });
    
    it('should approve a pending participant', async () => {
      req.body = {
        eseményId: 1,
        userId: 2
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1,
        maximumLetszam: 10
      });
      
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      const mockPendingParticipant = {
        eseményId: 1,
        userId: 2,
        szerep: 'játékos',
        státusz: 'függőben',
        csatlakozásDátuma: new Date(),
        update: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValueOnce(mockPendingParticipant);
      
      Résztvevő.count.mockResolvedValue(5); 
      
      User.findByPk.mockResolvedValue({
        id: 2,
        username: 'player',
        email: 'player@example.com',
        birthDate: '1990-01-01'
      });
      
      await approveParticipant(req, res);
      
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
      req.body = {
        eseményId: 1,
        userId: 2 
      };
      
      const mockEvent = {
        id: 1,
        helyszinId: 1,
        sportId: 1,
        maximumLetszam: 10
      };
      
      Esemény.findByPk.mockResolvedValue(mockEvent);
      
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 2,
        szerep: 'játékos',
        státusz: 'függőben'
      });

      Résztvevő.count.mockResolvedValue(10); 

      await approveParticipant(req, res);

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
      req.user = { userId: 1 };
    });
    
    it('should reject a pending participant', async () => {
      req.body = {
        eseményId: 1,
        userId: 2 
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });

      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      const mockPendingParticipant = {
        eseményId: 1,
        userId: 2,
        szerep: 'játékos',
        státusz: 'függőben',
        update: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValueOnce(mockPendingParticipant);

      await rejectParticipant(req, res);

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
          zaroIdo: new Date(Date.now() + 86400000), 
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

      await getEsemenyekByTelepulesAndSportNev(req, res);

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
      req.params = {
        telepules: 'SmallTown',
        sportNev: 'RareSport'
      };
      
      Esemény.findAll.mockResolvedValue([]);

      await getEsemenyekByTelepulesAndSportNev(req, res);

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
      
      await getOrganizedEvents(req, res);

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
      Esemény.findAll.mockResolvedValue([]);
      
      await getOrganizedEvents(req, res);
      
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
      const mockEvents = [
        {
          id: 1,
          helyszinId: 1,
          sportId: 1,
          kezdoIdo: new Date(),
          zaroIdo: new Date(Date.now() + 86400000), 
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

      await getParticipatedEvents(req, res);
      
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
      Esemény.findAll.mockResolvedValue([]);

      await getParticipatedEvents(req, res);

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
      req.body = {
        eseményId: 1,
        invitedUserId: 2
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });

      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        státusz: 'elfogadva'
      });

      User.findByPk.mockResolvedValue({
        id: 2,
        username: 'inviteduser'
      });

      Résztvevő.findOne.mockResolvedValueOnce(null);
      
      const mockInvitation = {
        eseményId: 1,
        userId: 2,
        szerep: 'játékos',
        státusz: 'függőben',
        csatlakozásDátuma: new Date()
      };
      
      Résztvevő.create.mockResolvedValue(mockInvitation);

      await inviteUserToEvent(req, res);

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
      req.body = {
        eseményId: 1,
        invitedUserId: 2
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });

      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        státusz: 'elfogadva'
      });
      
      User.findByPk.mockResolvedValue({
        id: 2,
        username: 'inviteduser'
      });

      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 2,
        státusz: 'elfogadva'
      });
      
      await inviteUserToEvent(req, res);
      
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
      req.user = { userId: 1 };
    });
    
    it('should accept an invitation and set status to pending', async () => {
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1,
        maximumLetszam: 10
      });
      
      const mockInvitation = {
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        státusz: 'meghívott',
        update: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValue(mockInvitation);

      await acceptInvitation(req, res);

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
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1,
        maximumLetszam: 10
      });

      Résztvevő.findOne.mockResolvedValue(null);
      
      const mockNewParticipant = {
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        státusz: 'függőben',
        csatlakozásDátuma: new Date()
      };
      
      Résztvevő.create.mockResolvedValue(mockNewParticipant);

      await acceptInvitation(req, res);

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
      req.user = { userId: 1 };
    });
    
    it('should reject an invitation by removing it', async () => {
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });

      const mockInvitation = {
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        státusz: 'meghívott',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValue(mockInvitation);

      await rejectInvitation(req, res);

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
      req.body = {
        eseményId: 1
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });

      Résztvevő.findOne.mockResolvedValue(null);

      await rejectInvitation(req, res);

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
      req.params.id = 1;
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });

      Résztvevő.findOne.mockResolvedValue({
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        státusz: 'elfogadva'
      });

      await checkParticipation(req, res);

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
      req.params.id = 1;
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      Résztvevő.findOne.mockResolvedValue(null);

      await checkParticipation(req, res);

      expect(res.json).toHaveBeenCalledWith({
        isParticipant: false,
        status: '',
        role: ''
      });
    });
  });
  
  describe('removeParticipant', () => {
    it('should allow an organizer to remove a player', async () => {
      req.body = {
        eseményId: 1,
        userId: 2 
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });
      
      const mockPlayerParticipant = {
        eseményId: 1,
        userId: 2,
        szerep: 'játékos',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValueOnce(mockPlayerParticipant);
      
      await removeParticipant(req, res);
    
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
      req.body = {
        eseményId: 1,
        userId: 2 
      };
      
      Esemény.findByPk.mockResolvedValue({
        id: 1,
        helyszinId: 1,
        sportId: 1
      });
      
      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 1,
        szerep: 'szervező'
      });

      Résztvevő.findOne.mockResolvedValueOnce({
        eseményId: 1,
        userId: 2,
        szerep: 'szervező'
      });

      await removeParticipant(req, res);

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
      req.params = {
        telepules: 'Budapest',
        sportNev: 'Futball'
      };

      User.findByPk.mockResolvedValue({
        id: 1,
        username: 'testuser',
        birthDate: new Date(new Date().getFullYear() - 30, 0, 1) 
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
      
      await getEsemenyekFilteredByUserAge(req, res);
      
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
      req.params = {
        telepules: 'Budapest',
        sportNev: 'Futball'
      };

      User.findByPk.mockResolvedValue({
        id: 1,
        username: 'testuser',
        birthDate: new Date(new Date().getFullYear() - 15, 0, 1) // 15 years old
      });

      Esemény.findAll.mockResolvedValue([]);

      await getEsemenyekFilteredByUserAge(req, res);

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
      req.user = { userId: 1 };
    });
    
    it('should return pending events for the user', async () => {
      const mockPendingEvents = [
        {
          Esemény: {
            id: 1,
            kezdoIdo: new Date(),
            zaroIdo: new Date(Date.now() + 86400000),
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

      sequelize.fn = jest.fn().mockReturnValue('COUNT');
      sequelize.col = jest.fn().mockReturnValue('id');
      Résztvevő.findAll.mockResolvedValueOnce([
        {
          eseményId: 1,
          getDataValue: jest.fn().mockReturnValue(5)
        }
      ]);

      await getPendingEvents(req, res);

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
      Résztvevő.findAll.mockResolvedValue([]);
      
      await getPendingEvents(req, res);
      
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
      req.user = { userId: 1 };
    });
    
    it('should cancel a pending request', async () => {
      req.body = {
        eseményId: 1
      };

      const mockPendingRequest = {
        eseményId: 1,
        userId: 1,
        szerep: 'játékos',
        státusz: 'függőben',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Résztvevő.findOne.mockResolvedValue(mockPendingRequest);

      await cancelPendingRequest(req, res);

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
      req.body = {
        eseményId: 1
      };

      Résztvevő.findOne.mockResolvedValue(null);

      await cancelPendingRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Nem található függőben lévő kérelem ehhez az eseményhez"
        })
      );
    });
  });
});



