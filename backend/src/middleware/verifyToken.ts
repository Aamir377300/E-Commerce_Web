import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface CustomRequest extends Request {
  user?: { id: string };
}

function verifyToken(req: CustomRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. Token missing.',
      message: 'Please provide a valid authentication token.'
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET not found in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err.message);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired',
          message: 'Your session has expired. Please login again.' 
        });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          error: 'Invalid token',
          message: 'The provided token is invalid. Please login again.' 
        });
      } else {
        return res.status(403).json({ 
          error: 'Token verification failed',
          message: 'Authentication failed. Please login again.' 
        });
      }
    }

    const payload = decoded as JwtPayload;

    // Check if 'id' exists in the token, which is what your login route creates
    if (!payload.id) {
      console.error('Token payload missing id field:', payload);
      return res.status(403).json({ 
        error: 'Invalid token format',
        message: 'Token is missing required user information.' 
      });
    }

    // Correctly set the user ID from the token payload
    req.user = { id: payload.id as string };
    next();
  });
}

export default verifyToken;
