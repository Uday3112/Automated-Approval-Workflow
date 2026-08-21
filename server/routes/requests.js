import express from 'express';
import { db } from '../data/db.js';
import { WorkflowEngine } from '../engine/workflowEngine.js';

const router = express.Router();

// 1. Get list of requests with query filters & role-based scoping
router.get('/', (req, res) => {
  WorkflowEngine.checkAndProcessSlaBreaches();

  const currentUserId = req.headers['x-user-id'] || 'usr_alex';
  const currentUser = db.getUserById(currentUserId) || db.getUsers()[0];
  const { status, type, priority, scope, search } = req.query;

  let requests = db.getRequests();

  // Role-based scoping
  if (scope === 'my_requests') {
    requests = requests.filter(r => r.createdBy === currentUser.id);
  } else if (scope === 'pending_approval') {
    // Show requests that are pending the current user's role or where user is manager/head/finance/admin
    requests = requests.filter(r => {
      if (r.status === 'Approved' || r.status === 'Rejected' || r.status === 'Draft') return false;

      const currentStep = r.steps && r.steps[r.currentStepIndex];
      if (!currentStep) return false;

      // Match by user role
      if (currentUser.role === 'admin') return true;
      if (currentUser.role === currentStep.role) return true;

      // Department head also sees escalated/delayed in their department
      if (currentUser.role === 'department_head' && r.department === currentUser.department) return true;

      // Finance sees all purchase/expense with pending finance status
      if (currentUser.role === 'finance' && (r.requestType === 'Purchase' || r.requestType === 'Expense' || r.requestType === 'Discount')) {
        return r.steps.some(s => s.role === 'finance' && (s.status === 'Pending' || s.status === 'Escalated'));
      }

      return false;
    });
  }

  // Filter by status
  if (status && status !== 'All') {
    if (status === 'Pending') {
      requests = requests.filter(r => r.status.includes('Pending') || r.status === 'Submitted');
    } else if (status === 'Delayed') {
      requests = requests.filter(r => r.isDelayed || r.isEscalated || r.status === 'Escalated');
    } else {
      requests = requests.filter(r => r.status === status);
    }
  }

  // Filter by type
  if (type && type !== 'All') {
    requests = requests.filter(r => r.requestType === type);
  }

  // Filter by priority
  if (priority && priority !== 'All') {
    requests = requests.filter(r => r.priority === priority);
  }

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    requests = requests.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.creatorName.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.requestType.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: requests.length,
    requests
  });
});

// 2. Preview workflow path dynamically for form
router.post('/preview-path', (req, res) => {
  const { requestType, amount, department, priority, role } = req.body;
  const pathResult = WorkflowEngine.resolveApprovalPath({
    requestType: requestType || 'Purchase',
    amount: amount || 0,
    department: department || 'Engineering',
    priority: priority || 'Medium',
    userRole: role || 'employee'
  });

  res.json({
    success: true,
    ...pathResult
  });
});

// 3. Get single request details
router.get('/:id', (req, res) => {
  WorkflowEngine.checkAndProcessSlaBreaches();
  const request = db.getRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  res.json({ success: true, request });
});

// 4. Create new request
router.post('/', (req, res) => {
  const currentUserId = req.headers['x-user-id'] || 'usr_alex';
  const currentUser = db.getUserById(currentUserId) || db.getUsers()[0];

  const {
    title,
    requestType,
    amount,
    currency = 'INR',
    department,
    priority,
    description,
    justification,
    customFields = {},
    documents = []
  } = req.body;

  if (!title || !requestType) {
    return res.status(400).json({ success: false, message: 'Title and Request Type are required.' });
  }

  // Resolve dynamic approval path
  const pathResult = WorkflowEngine.resolveApprovalPath({
    requestType,
    amount: Number(amount) || 0,
    department: department || currentUser.department,
    priority: priority || 'Medium',
    userRole: currentUser.role
  });

  const now = new Date();
  const reqNumber = Math.floor(1000 + Math.random() * 9000);
  const newId = `REQ-2026-${reqNumber}`;

  const newRequest = {
    id: newId,
    title,
    requestType,
    amount: Number(amount) || 0,
    currency,
    department: department || currentUser.department,
    priority: priority || 'Medium',
    description: description || '',
    justification: justification || '',
    customFields,
    createdBy: currentUser.id,
    creatorName: currentUser.name,
    creatorEmail: currentUser.email,
    creatorDepartment: currentUser.department,
    status: pathResult.initialStatus,
    currentStepIndex: 0,
    matchedWorkflowName: pathResult.matchedWorkflowName,
    steps: pathResult.steps,
    documents: documents.length > 0 ? documents : [
      {
        id: `doc_${Date.now()}`,
        name: `${requestType}_Specification_${newId}.pdf`,
        size: '1.2 MB',
        type: 'application/pdf',
        uploadedAt: now.toISOString()
      }
    ],
    auditLogs: [
      {
        id: `log_${Date.now()}_1`,
        action: 'Submitted',
        actor: currentUser.name,
        timestamp: now.toISOString(),
        details: `Request created with ${pathResult.steps.length}-stage workflow: ${pathResult.matchedWorkflowName}.`
      }
    ],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    slaTotalHours: pathResult.slaTotalHours,
    slaExpiresAt: pathResult.steps[0]?.slaDeadline || new Date(now.getTime() + 24 * 3600000).toISOString(),
    isEscalated: false,
    isDelayed: false
  };

  db.createRequest(newRequest);

  // Send notification to first stage approver role
  const firstRole = pathResult.steps[0]?.role;
  const targetApprover = db.getUsers().find(u => u.role === firstRole && (firstRole !== 'manager' || u.id === currentUser.managerId)) || db.getUserByRole(firstRole);

  if (targetApprover) {
    db.addNotification({
      userId: targetApprover.id,
      title: `Action Required: New ${requestType} Request`,
      message: `${currentUser.name} submitted '${title}' (${newId}) awaiting your approval.`,
      type: 'approval_needed',
      requestId: newId
    });
  }

  res.status(201).json({
    success: true,
    message: 'Request submitted successfully',
    request: newRequest
  });
});

// 5. Approve step
router.post('/:id/approve', (req, res) => {
  const currentUserId = req.headers['x-user-id'] || 'usr_sarah';
  const currentUser = db.getUserById(currentUserId) || db.getUsers()[1];
  const { comment = '' } = req.body;

  const request = db.getRequestById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  const now = new Date();
  const currentStep = request.steps[request.currentStepIndex];

  if (!currentStep) {
    return res.status(400).json({ success: false, message: 'No active approval step found.' });
  }

  // Mark current step as Approved
  currentStep.status = 'Approved';
  currentStep.actorId = currentUser.id;
  currentStep.actorName = currentUser.name;
  currentStep.actedAt = now.toISOString();
  currentStep.comment = comment || 'Approved as per enterprise policy guidelines.';

  // Add audit log
  request.auditLogs.push({
    id: `log_${Date.now()}`,
    action: 'Approved',
    actor: `${currentUser.name} (${currentUser.title})`,
    timestamp: now.toISOString(),
    details: `Step ${currentStep.stepOrder} (${currentStep.title}) Approved. Comment: "${currentStep.comment}"`
  });

  // Check if there are further steps
  if (request.currentStepIndex < request.steps.length - 1) {
    request.currentStepIndex += 1;
    const nextStep = request.steps[request.currentStepIndex];
    request.status = WorkflowEngine.getStatusForStepRole(nextStep.role);
    request.isDelayed = false;
    request.isEscalated = false;

    // Update SLA deadline for next step starting from now
    const nextSlaHours = nextStep.slaHours || WorkflowEngine.getSlaHours(request.priority);
    nextStep.slaDeadline = new Date(now.getTime() + nextSlaHours * 3600000).toISOString();
    request.slaExpiresAt = nextStep.slaDeadline;

    // Notify next approver
    const nextApprover = db.getUserByRole(nextStep.role);
    if (nextApprover) {
      db.addNotification({
        userId: nextApprover.id,
        title: `Pending Approval: ${request.id}`,
        message: `Step ${nextStep.stepOrder} (${nextStep.title}) for '${request.title}' is now assigned to you.`,
        type: 'approval_needed',
        requestId: request.id
      });
    }
  } else {
    // Final complete approval!
    request.status = 'Approved';
    request.isDelayed = false;
    request.isEscalated = false;

    request.auditLogs.push({
      id: `log_${Date.now()}_final`,
      action: 'Completed',
      actor: 'System Engine',
      timestamp: now.toISOString(),
      details: `All ${request.steps.length} approval stages fulfilled. Request marked as Final Approved.`
    });

    // Notify creator
    db.addNotification({
      userId: request.createdBy,
      title: `Request Approved! 🎉`,
      message: `Your request '${request.title}' (${request.id}) has been fully approved.`,
      type: 'request_approved',
      requestId: request.id
    });
  }

  request.updatedAt = now.toISOString();
  db.updateRequest(request.id, request);

  res.json({ success: true, message: 'Approval recorded successfully', request });
});

// 6. Reject step
router.post('/:id/reject', (req, res) => {
  const currentUserId = req.headers['x-user-id'] || 'usr_sarah';
  const currentUser = db.getUserById(currentUserId) || db.getUsers()[1];
  const { reason = 'Request does not meet compliance/budget requirements.' } = req.body;

  const request = db.getRequestById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  const now = new Date();
  const currentStep = request.steps[request.currentStepIndex];

  if (currentStep) {
    currentStep.status = 'Rejected';
    currentStep.actorId = currentUser.id;
    currentStep.actorName = currentUser.name;
    currentStep.actedAt = now.toISOString();
    currentStep.comment = reason;
  }

  request.status = 'Rejected';
  request.isDelayed = false;
  request.isEscalated = false;

  request.auditLogs.push({
    id: `log_${Date.now()}`,
    action: 'Rejected',
    actor: `${currentUser.name} (${currentUser.title})`,
    timestamp: now.toISOString(),
    details: `Request Rejected at Step ${currentStep?.stepOrder || 1}. Reason: "${reason}"`
  });

  // Notify creator
  db.addNotification({
    userId: request.createdBy,
    title: `Request Rejected`,
    message: `Your request '${request.title}' (${request.id}) was rejected by ${currentUser.name}. Reason: ${reason}`,
    type: 'request_rejected',
    requestId: request.id
  });

  request.updatedAt = now.toISOString();
  db.updateRequest(request.id, request);

  res.json({ success: true, message: 'Request rejected', request });
});

// 7. Request More Information
router.post('/:id/request-info', (req, res) => {
  const currentUserId = req.headers['x-user-id'] || 'usr_sarah';
  const currentUser = db.getUserById(currentUserId) || db.getUsers()[1];
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ success: false, message: 'Clarification query / question is required.' });
  }

  const request = db.getRequestById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  const now = new Date();
  const currentStep = request.steps[request.currentStepIndex];

  if (currentStep) {
    currentStep.status = 'More Information Required';
    currentStep.comment = question;
  }

  request.status = 'More Information Required';

  request.auditLogs.push({
    id: `log_${Date.now()}`,
    action: 'More Information Required',
    actor: `${currentUser.name} (${currentUser.title})`,
    timestamp: now.toISOString(),
    details: `Clarification requested: "${question}"`
  });

  // Notify creator
  db.addNotification({
    userId: request.createdBy,
    title: `Information Requested for ${request.id}`,
    message: `${currentUser.name} asked: "${question}" on '${request.title}'. Please provide details to resume approval.`,
    type: 'info_requested',
    requestId: request.id
  });

  request.updatedAt = now.toISOString();
  db.updateRequest(request.id, request);

  res.json({ success: true, message: 'Information requested from employee', request });
});

// 8. Respond to Information Request (Employee)
router.post('/:id/respond-info', (req, res) => {
  const currentUserId = req.headers['x-user-id'] || 'usr_alex';
  const currentUser = db.getUserById(currentUserId) || db.getUsers()[0];
  const { response, documents = [] } = req.body;

  const request = db.getRequestById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  const now = new Date();
  const currentStep = request.steps[request.currentStepIndex];

  if (currentStep) {
    currentStep.status = 'Pending';
  }

  request.status = WorkflowEngine.getStatusForStepRole(currentStep?.role || 'manager');

  if (documents && documents.length > 0) {
    request.documents = [...request.documents, ...documents];
  }

  request.auditLogs.push({
    id: `log_${Date.now()}`,
    action: 'Information Provided',
    actor: `${currentUser.name} (Employee)`,
    timestamp: now.toISOString(),
    details: `Employee responded: "${response}". Attached ${documents.length} additional documents.`
  });

  // Notify approver
  const approverRole = currentStep?.role || 'manager';
  const approver = db.getUserByRole(approverRole);
  if (approver) {
    db.addNotification({
      userId: approver.id,
      title: `Information Provided: ${request.id}`,
      message: `${currentUser.name} provided the requested details for '${request.title}'.`,
      type: 'info_provided',
      requestId: request.id
    });
  }

  request.updatedAt = now.toISOString();
  db.updateRequest(request.id, request);

  res.json({ success: true, message: 'Information submitted and workflow resumed', request });
});

// 9. Manual Simulation: Trigger Instant SLA Breach & Escalation for Demo
router.post('/:id/simulate-sla-breach', (req, res) => {
  const request = db.getRequestById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  const now = new Date();
  const currentStep = request.steps[request.currentStepIndex];

  if (!currentStep) {
    return res.status(400).json({ success: false, message: 'No active step to escalate.' });
  }

  request.isDelayed = true;
  request.isEscalated = true;
  request.status = 'Escalated';
  currentStep.status = 'Escalated';
  currentStep.comment = `[SIMULATED SLA BREACH]: SLA deadline of ${currentStep.slaHours || 4}h reached. Auto-escalated to higher authority.`;

  request.auditLogs.push({
    id: `log_esc_${Date.now()}`,
    action: 'SLA Breached & Escalated',
    actor: 'System Escalation Engine',
    timestamp: now.toISOString(),
    details: `Simulated SLA timeout triggered. Request priority ${request.priority} escalated to Executive Management.`
  });

  db.addNotification({
    userId: 'usr_david', // Admin
    title: `🚨 Urgent Escalation: ${request.id}`,
    message: `Request '${request.title}' (₹${(request.amount || 0).toLocaleString()}) has breached SLA and requires management override.`,
    type: 'sla_breach',
    requestId: request.id
  });

  request.updatedAt = now.toISOString();
  db.updateRequest(request.id, request);

  res.json({ success: true, message: 'SLA breach & escalation simulated successfully', request });
});

export default router;
