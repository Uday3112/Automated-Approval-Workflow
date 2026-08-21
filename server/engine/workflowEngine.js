import { db } from '../data/db.js';

export class WorkflowEngine {
  /**
   * Determine the SLA hours based on priority
   */
  static getSlaHours(priority) {
    const settings = db.getSettings();
    switch (priority?.toLowerCase()) {
      case 'critical':
        return settings.slaCriticalHours || 4;
      case 'high':
        return settings.slaHighHours || 24;
      case 'medium':
        return settings.slaMediumHours || 48;
      case 'low':
      default:
        return settings.slaLowHours || 72;
    }
  }

  /**
   * Match workflows against request parameters and return calculated approval steps
   */
  static resolveApprovalPath({ requestType, amount = 0, department = 'Engineering', priority = 'Medium', userRole = 'employee' }) {
    const numAmount = Number(amount) || 0;
    const workflows = db.getWorkflows().filter(w => w.isActive !== false);

    // 1. Find best matching workflow
    let matchedWorkflow = workflows.find(wf => {
      // Check request type
      if (wf.requestType !== 'All' && wf.requestType !== requestType) return false;

      // Check amount boundaries
      if (wf.minAmount !== undefined && numAmount < wf.minAmount) return false;
      if (wf.maxAmount !== undefined && numAmount > wf.maxAmount) return false;

      // Check department
      if (wf.departments && !wf.departments.includes('All') && !wf.departments.includes(department)) return false;

      // Check priority
      if (wf.priorities && !wf.priorities.includes('All') && !wf.priorities.includes(priority)) return false;

      return true;
    });

    // 2. Fallback logic if no explicit rule matches
    if (!matchedWorkflow) {
      if (requestType === 'Purchase') {
        if (numAmount < 50000) {
          matchedWorkflow = {
            id: 'fallback_p1',
            name: 'Default Purchase Tier 1',
            steps: [{ stepOrder: 1, role: 'manager', title: 'Manager Approval', slaHours: 24 }]
          };
        } else if (numAmount <= 200000) {
          matchedWorkflow = {
            id: 'fallback_p2',
            name: 'Default Purchase Tier 2',
            steps: [
              { stepOrder: 1, role: 'manager', title: 'Manager Approval', slaHours: 24 },
              { stepOrder: 2, role: 'department_head', title: 'Department Head Approval', slaHours: 48 }
            ]
          };
        } else {
          matchedWorkflow = {
            id: 'fallback_p3',
            name: 'Default Purchase Tier 3',
            steps: [
              { stepOrder: 1, role: 'manager', title: 'Manager Assessment', slaHours: 24 },
              { stepOrder: 2, role: 'department_head', title: 'Department Head Verification', slaHours: 24 },
              { stepOrder: 3, role: 'finance', title: 'Finance Budget Audit', slaHours: 24 },
              { stepOrder: 4, role: 'admin', title: 'Admin Authorization', slaHours: 24 }
            ]
          };
        }
      } else if (requestType === 'Expense') {
        if (numAmount < 25000) {
          matchedWorkflow = {
            id: 'fallback_e1',
            name: 'Default Expense Tier 1',
            steps: [{ stepOrder: 1, role: 'manager', title: 'Manager Receipt Verification', slaHours: 24 }]
          };
        } else {
          matchedWorkflow = {
            id: 'fallback_e2',
            name: 'Default Expense Tier 2',
            steps: [
              { stepOrder: 1, role: 'manager', title: 'Manager Validation', slaHours: 24 },
              { stepOrder: 2, role: 'finance', title: 'Finance Disbursement Review', slaHours: 24 }
            ]
          };
        }
      } else {
        // General default
        matchedWorkflow = {
          id: 'fallback_general',
          name: 'Standard Approval',
          steps: [
            { stepOrder: 1, role: 'manager', title: 'Direct Manager Approval', slaHours: 24 }
          ]
        };
      }
    }

    // 3. Format approval steps with timestamps and SLA calculation
    const slaPriorityHours = this.getSlaHours(priority);
    const now = new Date();

    const steps = matchedWorkflow.steps.map((s, index) => {
      const stepSlaHours = Math.min(s.slaHours || 24, slaPriorityHours);
      const deadline = new Date(now.getTime() + (index + 1) * stepSlaHours * 60 * 60 * 1000);

      return {
        stepOrder: index + 1,
        role: s.role,
        title: s.title || `${s.role.replace('_', ' ').toUpperCase()} Approval`,
        status: 'Pending',
        actorId: null,
        actorName: null,
        actedAt: null,
        comment: null,
        slaHours: stepSlaHours,
        slaDeadline: deadline.toISOString()
      };
    });

    return {
      matchedWorkflowId: matchedWorkflow.id,
      matchedWorkflowName: matchedWorkflow.name,
      steps,
      slaTotalHours: slaPriorityHours,
      initialStatus: this.getStatusForStepRole(steps[0]?.role)
    };
  }

  /**
   * Helper to format human status based on role
   */
  static getStatusForStepRole(role) {
    switch (role) {
      case 'manager':
        return 'Pending Manager Approval';
      case 'department_head':
        return 'Pending Department Head Approval';
      case 'finance':
        return 'Pending Finance Approval';
      case 'admin':
        return 'Pending Admin Approval';
      default:
        return 'Submitted';
    }
  }

  /**
   * Check SLA breaches across all active pending requests and trigger auto-escalation
   */
  static checkAndProcessSlaBreaches() {
    const requests = db.getRequests();
    const now = new Date();
    let updatedCount = 0;

    requests.forEach(req => {
      // Only check requests that are in active pending states
      if (
        req.status.includes('Pending') ||
        req.status === 'Submitted' ||
        req.status === 'More Information Required'
      ) {
        const currentStep = req.steps && req.steps[req.currentStepIndex];
        if (currentStep && currentStep.slaDeadline) {
          const deadline = new Date(currentStep.slaDeadline);
          if (now > deadline && !req.isDelayed) {
            // Mark SLA breached and auto-escalate
            req.isDelayed = true;
            req.isEscalated = true;
            req.status = 'Escalated';
            currentStep.status = 'Escalated';
            currentStep.comment = `SLA deadline of ${currentStep.slaHours || 24}h exceeded at ${now.toLocaleTimeString()}. Escalated for immediate management action.`;

            // Add Audit log
            req.auditLogs = req.auditLogs || [];
            req.auditLogs.push({
              id: `log_esc_${Date.now()}`,
              action: 'SLA Breached',
              actor: 'System Watchdog',
              timestamp: now.toISOString(),
              details: `SLA exceeded at Step ${currentStep.stepOrder} (${currentStep.title}). Request auto-escalated.`
            });

            // Send notification to Admin & Department Head
            db.addNotification({
              userId: 'usr_david', // Admin
              title: `SLA Breached: ${req.id}`,
              message: `Request '${req.title}' (${req.id}) has breached SLA deadline and requires immediate intervention.`,
              type: 'sla_breach',
              requestId: req.id
            });

            db.addNotification({
              userId: 'usr_michael', // Dept Head
              title: `Escalation Alert: ${req.id}`,
              message: `Request '${req.title}' was escalated due to delayed response.`,
              type: 'sla_breach',
              requestId: req.id
            });

            db.updateRequest(req.id, req);
            updatedCount++;
          }
        }
      }
    });

    return updatedCount;
  }
}
