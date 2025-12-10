import prisma from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const ACCESS_SECRET = process.env.JWT_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret'; 

export class AuthService {
  

  private generateTokens(user: { id: number; role: string }) {

    const accessToken = jwt.sign(
      { id: user.id, role: user.role }, 
      ACCESS_SECRET, 
      { expiresIn: '15m' } 
    ); 


    const refreshToken = jwt.sign(
      { id: user.id, role: user.role }, 
      REFRESH_SECRET, 
      { expiresIn: '30d' } 
    ); 
    
    return { accessToken, refreshToken };
  }

  async register(email: string, password: string, name?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashedPassword, name } });
    
    const tokens = this.generateTokens(user);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }; 
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid password');

    const tokens = this.generateTokens(user);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }; 
  }

  async refresh(oldRefreshToken: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(oldRefreshToken, REFRESH_SECRET);
    } catch (e) {
      throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.refreshToken !== oldRefreshToken) {
        throw new Error('Refresh token is invalid or revoked');
    }

    const newTokens = this.generateTokens(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newTokens.refreshToken }
    });

    return newTokens;
  }
}