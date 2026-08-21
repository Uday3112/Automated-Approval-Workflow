import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';
import workflowRoutes from './routes/workflows.js';
import userRoutes from './routes/users.js';
import analyticsRoutes from './routes/analytics.js';
import notificationRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import { WorkflowEngine } from './engine/workflowEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Automated Approval Workflow API'
  });
});

// Periodic SLA breach watchdog (runs every 60 seconds)
setInterval(() => {
  try {
    const breaches = WorkflowEngine.checkAndProcessSlaBreaches();
    if (breaches > 0) {
      console.log(`[SLA Watchdog] Auto-escalated ${breaches} delayed requests.`);
    }
  } catch (err) {
    console.error('[SLA Watchdog Error]:', err);
  }
}, 60000);

app.listen(PORT, () => {
  console.log(`🚀 Automated Approval Workflow Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints ready at http://localhost:${PORT}/api`);
});
