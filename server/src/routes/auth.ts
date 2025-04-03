import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// Simple login endpoint
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // For testing purposes, just check hardcoded credentials
    // In a real app, you would check against a database and use proper password hashing
    if (username === 'admin' && password === 'password123') {
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: 1,
            username: 'admin',
            role: 'admin'
          },
          token: 'sample-jwt-token' // In a real app, generate a JWT token
        }
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Logout endpoint
router.post('/auth/logout', (req: Request, res: Response) => {
  // In a real app, you might invalidate tokens or clear sessions
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router; 