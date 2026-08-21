import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

// Get current mock users for login / role switcher
router.get('/users', (req, res) => {
  const users = db.getUsers();
  res.json({ success: true, users });
});

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password, userId } = req.body;
  const users = db.getUsers();

  let user = null;
  if (userId) {
    user = users.find(u => u.id === userId);
  } else if (email) {
    user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // Fallback to first user (Alex) if not found or demo login
  if (!user) {
    user = users[0];
  }

  res.json({
    success: true,
    user,
    token: `demo_token_${user.id}_${Date.now()}`
  });
});

// Get user profile
router.get('/me', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_alex';
  const user = db.getUserById(userId) || db.getUsers()[0];
  res.json({ success: true, user });
});

export default router;
