const { protect } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Auth Middleware (protect)', () => {
  it('should call next() and attach user object when valid Bearer token is provided', async () => {
    const user = await User.create({
      name: 'Test Middleware User',
      email: 'middleware@example.com',
      password: 'password123',
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user._id.toString()).toBe(user._id.toString());
  });

  it('should return 401 status when no authorization header is supplied', async () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    expect(next).not.toHaveBeenCalled();
  });
});
