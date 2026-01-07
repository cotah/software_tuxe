import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/btrix_test';

// Mock external services
jest.mock('../utils/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
  },
}));

// Global test timeout
jest.setTimeout(10000);

// Keep Jest happy when this file is picked up as a test suite
describe('test setup', () => {
  it('initializes test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});

