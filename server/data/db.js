import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialUsers, initialWorkflows, initialRequests, initialNotifications } from './initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, 'store.json');

class DatabaseStore {
  constructor() {
    this.data = {
      users: [],
      workflows: [],
      requests: [],
      notifications: [],
      systemSettings: {
        slaCriticalHours: 4,
        slaHighHours: 24,
        slaMediumHours: 48,
        slaLowHours: 72,
        currency: "INR",
        companyName: "Acme Enterprise Corp",
        enableAutoEscalation: true
      }
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure critical arrays exist
        if (!this.data.users || this.data.users.length === 0) this.data.users = [...initialUsers];
        if (!this.data.workflows || this.data.workflows.length === 0) this.data.workflows = [...initialWorkflows];
        if (!this.data.requests || this.data.requests.length === 0) this.data.requests = [...initialRequests];
        if (!this.data.notifications) this.data.notifications = [...initialNotifications];
      } else {
        this.resetToDefaults();
      }
    } catch (err) {
      console.error("Failed to load store, resetting to initial data:", err);
      this.resetToDefaults();
    }
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error("Error persisting store to disk:", err);
    }
  }

  resetToDefaults() {
    this.data = {
      users: JSON.parse(JSON.stringify(initialUsers)),
      workflows: JSON.parse(JSON.stringify(initialWorkflows)),
      requests: JSON.parse(JSON.stringify(initialRequests)),
      notifications: JSON.parse(JSON.stringify(initialNotifications)),
      systemSettings: {
        slaCriticalHours: 4,
        slaHighHours: 24,
        slaMediumHours: 48,
        slaLowHours: 72,
        currency: "INR",
        companyName: "Acme Enterprise Corp",
        enableAutoEscalation: true
      }
    };
    this.save();
  }

  // Users
  getUsers() { return this.data.users; }
  getUserById(id) { return this.data.users.find(u => u.id === id); }
  getUserByRole(role) { return this.data.users.find(u => u.role === role); }
  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // Workflows
  getWorkflows() { return this.data.workflows; }
  getWorkflowById(id) { return this.data.workflows.find(w => w.id === id); }
  saveWorkflow(workflow) {
    const idx = this.data.workflows.findIndex(w => w.id === workflow.id);
    if (idx !== -1) {
      this.data.workflows[idx] = { ...workflow, updatedAt: new Date().toISOString() };
    } else {
      this.data.workflows.push({ ...workflow, createdAt: new Date().toISOString() });
    }
    this.save();
    return workflow;
  }
  deleteWorkflow(id) {
    this.data.workflows = this.data.workflows.filter(w => w.id !== id);
    this.save();
    return true;
  }

  // Requests
  getRequests() { return this.data.requests; }
  getRequestById(id) { return this.data.requests.find(r => r.id === id); }
  createRequest(request) {
    this.data.requests.unshift(request);
    this.save();
    return request;
  }
  updateRequest(id, updates) {
    const idx = this.data.requests.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.requests[idx] = { ...this.data.requests[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.requests[idx];
    }
    return null;
  }
  deleteRequest(id) {
    this.data.requests = this.data.requests.filter(r => r.id !== id);
    this.save();
    return true;
  }

  // Notifications
  getNotifications(userId = null) {
    if (userId) {
      return this.data.notifications.filter(n => n.userId === userId);
    }
    return this.data.notifications;
  }
  addNotification(notification) {
    this.data.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      ...notification
    });
    this.save();
  }
  markNotificationRead(id) {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
    }
    return notif;
  }
  markAllNotificationsRead(userId) {
    this.data.notifications.forEach(n => {
      if (!userId || n.userId === userId) {
        n.isRead = true;
      }
    });
    this.save();
  }

  // Settings
  getSettings() { return this.data.systemSettings; }
  updateSettings(settings) {
    this.data.systemSettings = { ...this.data.systemSettings, ...settings };
    this.save();
    return this.data.systemSettings;
  }
}

export const db = new DatabaseStore();
