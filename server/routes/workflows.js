import express from 'express';
import { db } from '../data/db.js';
import { WorkflowEngine } from '../engine/workflowEngine.js';

const router = express.Router();

// Get all workflows
router.get('/', (req, res) => {
  const workflows = db.getWorkflows();
  res.json({ success: true, count: workflows.length, workflows });
});

// Get workflow by ID
router.get('/:id', (req, res) => {
  const workflow = db.getWorkflowById(req.params.id);
  if (!workflow) {
    return res.status(404).json({ success: false, message: 'Workflow not found' });
  }
  res.json({ success: true, workflow });
});

// Create or update workflow
router.post('/', (req, res) => {
  const {
    id,
    name,
    description,
    requestType,
    minAmount = 0,
    maxAmount = 999999999,
    departments = ['All'],
    priorities = ['All'],
    steps = [],
    isActive = true
  } = req.body;

  if (!name || !requestType || !steps || steps.length === 0) {
    return res.status(400).json({ success: false, message: 'Workflow name, request type, and at least 1 approval step are required.' });
  }

  const workflowId = id || `wf_${requestType.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

  const formattedSteps = steps.map((s, idx) => ({
    stepOrder: idx + 1,
    role: s.role || 'manager',
    title: s.title || `${(s.role || 'manager').replace('_', ' ').toUpperCase()} Approval`,
    slaHours: Number(s.slaHours) || 24,
    autoEscalate: s.autoEscalate !== false
  }));

  const workflowObj = {
    id: workflowId,
    name,
    description: description || '',
    requestType,
    minAmount: Number(minAmount) || 0,
    maxAmount: Number(maxAmount) || 999999999,
    departments: Array.isArray(departments) ? departments : [departments],
    priorities: Array.isArray(priorities) ? priorities : [priorities],
    steps: formattedSteps,
    isActive: Boolean(isActive)
  };

  const saved = db.saveWorkflow(workflowObj);

  res.json({
    success: true,
    message: id ? 'Workflow updated successfully' : 'Workflow created successfully',
    workflow: saved
  });
});

// Delete workflow
router.delete('/:id', (req, res) => {
  const deleted = db.deleteWorkflow(req.params.id);
  res.json({ success: true, message: 'Workflow rule removed.' });
});

// Test workflow rule sandbox
router.post('/test-rule', (req, res) => {
  const { requestType, amount, department, priority, role } = req.body;
  const result = WorkflowEngine.resolveApprovalPath({
    requestType: requestType || 'Purchase',
    amount: Number(amount) || 0,
    department: department || 'Engineering',
    priority: priority || 'Medium',
    userRole: role || 'employee'
  });

  res.json({
    success: true,
    simulationInput: { requestType, amount, department, priority },
    result
  });
});

export default router;
