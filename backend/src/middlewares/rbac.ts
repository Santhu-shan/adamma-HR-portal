import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'ADMIN' | 'MANAGER' | 'TL' | 'EMPLOYEE';
    permissions: string[];
    managerId?: string;
  };
}

const jwtSecret = process.env.JWT_SECRET || 'super_secret_session_crypto_key';

export const requirePermission = (requiredPermission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          code: 'UNAUTHORIZED', 
          message: 'Missing or malformed authorization header.' 
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, jwtSecret) as any;
      req.user = decoded;

      // Admin role bypasses granular permissions
      if (req.user?.role === 'ADMIN') {
        return next();
      }

      const hasPermission = req.user?.permissions.includes(requiredPermission);
      if (!hasPermission) {
        return res.status(403).json({ 
          code: 'FORBIDDEN', 
          message: 'Security validation failed: Insufficient route permissions.' 
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({ 
        code: 'INVALID_TOKEN', 
        message: 'Session token has expired or is invalid.' 
      });
    }
  };
};
