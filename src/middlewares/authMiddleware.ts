import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET || 'access_secret_fallback';

export interface AuthRequest extends Request {
  user?: { 
    id: number; 
    role: string; 
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as { id: number; role: string };
    
    (req as AuthRequest).user = decoded;
    
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid or expired Access Token' });
  }
};