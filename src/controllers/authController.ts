
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../db'; 

const authService = new AuthService();

export class AuthController {
  
  private setCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, 
      sameSite: 'strict',
    });
  }
  
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }
      
      const result = await authService.register(email, password, name);
      const { user, accessToken, refreshToken } = result;

      this.setCookie(res, refreshToken); 
      res.status(201).json({ user, accessToken }); 
      
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login(email, password);
      const { user, accessToken, refreshToken } = result;

      this.setCookie(res, refreshToken);
      res.json({ user, accessToken }); 
      
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) throw new Error('No refresh token in cookies');

      const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);
      
      this.setCookie(res, newRefreshToken);
      res.json({ accessToken });
      
    } catch (error: any) {
      res.clearCookie('refreshToken');
      res.status(401).json({ message: error.message });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user data' });
    }
  }
}