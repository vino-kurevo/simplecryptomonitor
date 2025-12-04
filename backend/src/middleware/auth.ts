import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing token' });
  }

  const token = authHeader.substring(7);

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }

  req.userId = data.user.id;
  next();
}
