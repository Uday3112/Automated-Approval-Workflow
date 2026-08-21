import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

// Get settings
router.get('/', (req, res) => {
  res.json({ success: true, settings: db.getSettings() });
});

// Update settings
router.put('/', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, message: 'Settings updated successfully', settings: updated });
});

// Reset database to initial clean seed
router.post('/reset', (req, res) => {
  db.resetToDefaults();
  res.json({ success: true, message: 'System database reset to initial enterprise demo state.' });
});

export default router;
