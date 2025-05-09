const {
  createUser,
  authenticateUser,
  getUser,
  updateUser,
  deleteUser,
  getUserSettings,
  saveUserSettings,
  getUserStats
} = require('../controllers/userController');

const User = require('../models/userModel');
const Esemény = require('../models/esemenyModel');
const Résztvevő = require('../models/resztvevoModel');
const Helyszin = require('../models/helyszinModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

jest.mock('../models/userModel');
jest.mock('../models/esemenyModel');
jest.mock('../models/resztvevoModel');
jest.mock('../models/helyszinModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('sequelize', () => {
  const actualSequelize = jest.requireActual('sequelize');
  return {
    ...actualSequelize,
    Op: {
      ne: Symbol('ne'),
      notIn: Symbol('notIn'),
      or: Symbol('or'),
      like: Symbol('like')
    }
  };
});

describe('userController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

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

    jwt.verify.mockReturnValue({ userId: 1 });

    bcrypt.hash.mockResolvedValue('hashedPassword123');
    bcrypt.compare.mockResolvedValue(true);
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        birthDate: '1990-01-01'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        birthDate: '1990-01-01',
        profilePicture: 'https://media.istockphoto.com/id/526947869/vector/man-silhouette-profile-picture.jpg?s=612x612&w=0&k=20&c=5I7Vgx_U6UPJe9U2sA2_8JFF4grkP7bNmDnsLXTYlSc='
      };

      User.create.mockResolvedValue(mockUser);

      await createUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'hashedPassword123',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          birthDate: '1990-01-01'
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User created successfully!',
          user: mockUser
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        email: 'test@example.com',
      };

      await createUser(req, res);

      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Missing required fields!'
        })
      );
    });

    it('should validate email format', async () => {
      req.body = {
        email: 'invalid-email',
        password: 'Password123!',
        username: 'testuser'
      };

      await createUser(req, res);

      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Érvénytelen email formátum!'
        })
      );
    });

    it('should validate password complexity', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'simple',
        username: 'testuser'
      };

      await createUser(req, res);

      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'A jelszó 10-25 karakter hosszú lehet!'
        })
      );
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate a user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword123'
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('token123');

      await authenticateUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'test@example.com' }
        })
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashedPassword123');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          email: 'test@example.com',
          name: 'testuser'
        }),
        'secretkey',
        { expiresIn: '1h' }
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful!',
          token: 'token123',
          user: expect.objectContaining({
            id: 1,
            email: 'test@example.com',
            username: 'testuser'
          })
        })
      );
    });

    it('should return 401 if user not found', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      User.findOne.mockResolvedValue(null);

      await authenticateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid email or password!'
        })
      );
    });

    it('should return 401 if password is incorrect', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword123'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await authenticateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid email or password!'
        })
      );
    });
  });

  describe('getUser', () => {
    it('should return user by ID', async () => {
      req.params.id = 1;
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        profilePicture: 'profile.jpg',
        profileBackground: 'background.jpg',
        customBackground: null
      };

      User.findByPk.mockResolvedValue(mockUser);

      await getUser(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 999;
      User.findByPk.mockResolvedValue(null);

      await getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found!'
        })
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      req.params.id = 1;
      req.body = {
        firstName: 'Updated',
        lastName: 'User',
        phone: '+36201234567'
      };

      User.update.mockResolvedValue([1]);

      await updateUser(req, res);

      expect(User.update).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Updated',
          lastName: 'User',
          phone: '+36201234567'
        }),
        expect.objectContaining({
          where: { id: 1 }
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User updated successfully!'
        })
      );
    });

    it('should hash password if included in update', async () => {
      req.params.id = 1;
      req.body = {
        password: 'NewPassword123!'
      };

      User.update.mockResolvedValue([1]);

      await updateUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 10);
      expect(User.update).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashedPassword123'
        }),
        expect.objectContaining({
          where: { id: 1 }
        })
      );
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 999;
      User.update.mockResolvedValue([0]);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found!'
        })
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and related data successfully', async () => {
      req.params.id = 1;

      const mockEvents = [
        { id: 1, userId: 1 },
        { id: 2, userId: 1 }
      ];

      const mockLocations = [
        { Id: 1, userId: 1 },
        { Id: 2, userId: 1 }
      ];

      const mockEventsUsingLocations = [];
      
      Esemény.findAll.mockResolvedValueOnce(mockEvents);
      Helyszin.findAll.mockResolvedValue(mockLocations);
      Esemény.findAll.mockResolvedValueOnce(mockEventsUsingLocations);
      Résztvevő.destroy.mockResolvedValue(true);
      Esemény.destroy.mockResolvedValue(true);
      Helyszin.destroy.mockResolvedValue(true);
      User.destroy.mockResolvedValue(1);

      await deleteUser(req, res);

      expect(Esemény.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 }
        })
      );
      expect(Résztvevő.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            eseményId: [1, 2]
          }
        })
      );
      expect(Esemény.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 }
        })
      );
      expect(Résztvevő.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 }
        })
      );
      expect(Helyszin.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 }
        })
      );
      expect(User.destroy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 }
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User and related data deleted successfully!'
        })
      );
    });

    it('should return 403 if trying to delete another user', async () => {
      req.params.id = 2;

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Nincs jogosultságod más felhasználó törlésére!'
        })
      );
    });
  });

  describe('getUserSettings', () => {
    it('should return user settings', async () => {
      req.params.id = 1;      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        birthDate: '1990-01-01',
        phone: '+36201234567',
        profilePicture: 'profile.jpg',
        profileBackground: 'background.jpg',
        customBackground: null,
        level: 'intermediate',
        bio: 'Test bio',
        notificationSettings: {
          emailNotifications: true,
          eventReminders: true
        }
      };

      User.findByPk.mockResolvedValue(mockUser);

      await getUserSettings(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          birthDate: '1990-01-01',
          phone: '+36201234567',
          profilePicture: 'profile.jpg',
          profileBackground: 'background.jpg',
          customBackground: null,
          level: 'intermediate',
          bio: 'Test bio',
          notificationSettings: {
            emailNotifications: true,
            eventReminders: true
          }
        })
      );
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 999;
      User.findByPk.mockResolvedValue(null);

      await getUserSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found!'
        })
      );
    });

    it('should return 403 if trying to access another user\'s settings', async () => {
      req.params.id = 2; 

      await getUserSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You can only access your own settings!'
        })
      );
    });
  });

  describe('saveUserSettings', () => {
    it('should save user settings successfully', async () => {
      req.params.id = 1;
      req.body = {
        firstName: 'Updated',
        lastName: 'User',
        phone: '+36201234567',
        level: 'advanced',
        bio: 'Updated bio',
        notificationSettings: {
          emailNotifications: false,
          eventReminders: true
        }
      };

      const mockUser = {
        id: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      User.findByPk.mockResolvedValue(mockUser);

      await saveUserSettings(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Updated',
          lastName: 'User',
          phone: '+36201234567',
          level: 'advanced',
          bio: 'Updated bio',
          notificationSettings: {
            emailNotifications: false,
            eventReminders: true
          }
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User settings saved successfully!'
        })
      );
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 999;
      User.findByPk.mockResolvedValue(null);

      await saveUserSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found!'
        })
      );
    });

    it('should return 403 if trying to update another user\'s settings', async () => {
      req.params.id = 2; 

      await saveUserSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You can only update your own settings!'
        })
      );
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      req.params.id = 1;

      const mockUser = {
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        profilePicture: 'profile.jpg'
      };
      
      const mockOrganizedCount = 5;

      const mockParticipatedCount = 10;

      const mockLocationsCount = 3;
      
      User.findByPk.mockResolvedValue(mockUser);
      Résztvevő.count.mockResolvedValueOnce(mockOrganizedCount); 
      Résztvevő.count.mockResolvedValueOnce(mockParticipatedCount); 
      Helyszin.count.mockResolvedValue(mockLocationsCount);

      await getUserStats(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(Résztvevő.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 1,
            szerep: 'szervező'
          }
        })
      );
      expect(Résztvevő.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 1,
            szerep: 'játékos',
            státusz: 'elfogadva'
          }
        })
      );
      expect(Helyszin.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 }
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            id: 1,
            username: 'testuser'
          }),
          stats: expect.objectContaining({
            organizedEvents: 5,
            participatedEvents: 10,
            createdLocations: 3
          })
        })
      );
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 999;
      User.findByPk.mockResolvedValue(null);

      await getUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found!'
        })
      );
    });
  });
});

