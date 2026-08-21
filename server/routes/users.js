import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  const users = db.getUsers();
  res.json({ success: true, count: users.length, users });
});

// Update user details or role
router.put('/:id', (req, res) => {
  const updated = db.updateUser(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, message: 'User updated', user: updated });
});

// Create new user (Admin)
router.post('/', (req, res) => {
  const { name, email, role = 'employee', department = 'Engineering', title = 'Team Member' } = req.body;
  const newId = `usr_${Date.now().toString(36)}`;
  const newUser = {
    id: newId,
    name,
    email,
    role,
    department,
    title,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    phone: "+91 98765 00000",
    managerId: "usr_sarah"
  };
  db.data.users.push(newUser);
  db.save();
  res.status(201).json({ success: true, user: newUser });
});

export default router;
