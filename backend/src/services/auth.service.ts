import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken(user.id);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    companyId: string;
    phone?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, 'User already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      include: { company: true },
    });

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const isValidPassword = await comparePassword(currentPassword, user.password);

    if (!isValidPassword) {
      throw new AppError(401, 'Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // TODO: Generate reset token and send email
    // For now, just return success
    const resetToken = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async refreshAccessToken(refreshToken: string) {
    const tokenData = await verifyRefreshToken(refreshToken);

    if (!tokenData) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      include: { company: true },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'User not found or inactive');
    }

    const newToken = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    return {
      token: newToken,
    };
  }

  async logout(refreshToken: string) {
    await revokeRefreshToken(refreshToken);
    return { message: 'Logged out successfully' };
  }
}


