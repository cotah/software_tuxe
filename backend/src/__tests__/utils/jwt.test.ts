import { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import prisma from '../../utils/prisma';

// Mock Prisma
jest.mock('../../utils/prisma', () => ({
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

describe('JWT Utils', () => {
  const mockPayload = {
    userId: 'user-123',
    companyId: 'company-123',
    role: 'ADMIN' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.companyId).toBe(mockPayload.companyId);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate and store refresh token', async () => {
      const mockCreate = prisma.refreshToken.create as jest.Mock;
      mockCreate.mockResolvedValue({
        token: 'refresh-token-123',
        userId: 'user-123',
        expiresAt: new Date(),
      });

      const token = await generateRefreshToken('user-123');
      expect(token).toBeDefined();
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
        }),
      });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', async () => {
      const mockFindUnique = prisma.refreshToken.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValue({
        token: 'refresh-token-123',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 86400000), // Future date
        revoked: false,
        user: { id: 'user-123' },
      });

      const result = await verifyRefreshToken('refresh-token-123');
      expect(result).toEqual({ userId: 'user-123' });
    });

    it('should return null for expired token', async () => {
      const mockFindUnique = prisma.refreshToken.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValue({
        token: 'refresh-token-123',
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 86400000), // Past date
        revoked: false,
        user: { id: 'user-123' },
      });

      const result = await verifyRefreshToken('refresh-token-123');
      expect(result).toBeNull();
    });

    it('should return null for revoked token', async () => {
      const mockFindUnique = prisma.refreshToken.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValue({
        token: 'refresh-token-123',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 86400000),
        revoked: true,
        user: { id: 'user-123' },
      });

      const result = await verifyRefreshToken('refresh-token-123');
      expect(result).toBeNull();
    });
  });
});

