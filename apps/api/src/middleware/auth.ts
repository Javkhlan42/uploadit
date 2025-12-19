import { Request, Response, NextFunction } from 'express';

// Extended Express Request with user property
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to check if user has required role(s)
 * Usage: app.get('/api/admin/users', requireRole(['admin']), (req, res) => {...})
 */
export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user exists in request (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required' 
      });
    }

    // Check if user has one of the required roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
}

/**
 * Middleware to parse and validate session token
 * In production, this would verify JWT or session token
 */
export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header' 
    });
  }

  const token = authHeader.substring(7);
  
  try {
    // In production, verify JWT token here
    // For now, we'll assume the token contains user info
    // Example: decode JWT and extract user info
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user'
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid token' 
    });
  }
}

/**
 * Admin-only middleware (convenience wrapper)
 */
export const requireAdmin = requireRole(['admin']);

/**
 * CSRF protection middleware
 * NextAuth handles CSRF for auth routes, but we can add it for API routes
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Only check CSRF for state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'];
    
    if (!csrfToken) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'CSRF token missing' 
      });
    }
    
    // In production, validate CSRF token here
    // For now, just check if it exists
  }
  
  next();
}
