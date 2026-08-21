import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

router.get('/overview', (req, res) => {
  const requests = db.getRequests();
  const workflows = db.getWorkflows();
  const users = db.getUsers();

  const total = requests.length;
  const approved = requests.filter(r => r.status === 'Approved').length;
  const rejected = requests.filter(r => r.status === 'Rejected').length;
  const pending = requests.filter(r => r.status.includes('Pending') || r.status === 'Submitted' || r.status === 'More Information Required').length;
  const delayedOrSlaBreached = requests.filter(r => r.isDelayed || r.isEscalated || r.status === 'Escalated').length;

  const totalSpend = requests.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const approvedSpend = requests.filter(r => r.status === 'Approved').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

  // Requests by Category / Type
  const typeMap = {};
  requests.forEach(r => {
    typeMap[r.requestType] = (typeMap[r.requestType] || 0) + 1;
  });
  const requestsByType = Object.keys(typeMap).map(type => ({
    name: type,
    count: typeMap[type],
    amount: requests.filter(r => r.requestType === type).reduce((acc, c) => acc + (Number(c.amount) || 0), 0)
  }));

  // Requests by Priority
  const priorityMap = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  requests.forEach(r => {
    if (priorityMap[r.priority] !== undefined) {
      priorityMap[r.priority] += 1;
    } else {
      priorityMap[r.priority] = 1;
    }
  });
  const requestsByPriority = Object.keys(priorityMap).map(p => ({
    name: p,
    value: priorityMap[p]
  }));

  // Requests by Department
  const deptMap = {};
  requests.forEach(r => {
    deptMap[r.department] = (deptMap[r.department] || 0) + 1;
  });
  const requestsByDepartment = Object.keys(deptMap).map(d => ({
    department: d,
    count: deptMap[d],
    spend: requests.filter(r => r.department === d).reduce((acc, c) => acc + (Number(c.amount) || 0), 0)
  }));

  // Status breakdown for Donut Chart
  const statusDistribution = [
    { name: 'Approved', value: approved, color: '#10B981' },
    { name: 'Pending', value: pending, color: '#F59E0B' },
    { name: 'SLA Breached / Escalated', value: delayedOrSlaBreached, color: '#EF4444' },
    { name: 'Rejected', value: rejected, color: '#6B7280' }
  ];

  // Approver Performance Leaderboard
  const approverStats = [
    { name: 'Sarah Davis', role: 'Engineering Lead', avgTimeHours: 2.4, approvals: 18, rejections: 2, complianceRate: 96 },
    { name: 'Michael Chang', role: 'VP Engineering', avgTimeHours: 5.1, approvals: 12, rejections: 1, complianceRate: 92 },
    { name: 'Priya Sharma', role: 'Finance Controller', avgTimeHours: 3.8, approvals: 24, rejections: 3, complianceRate: 98 },
    { name: 'David Miller', role: 'COO / Executive Admin', avgTimeHours: 1.2, approvals: 8, rejections: 0, complianceRate: 100 }
  ];

  // Monthly trend mock data
  const monthlyTrend = [
    { month: 'Mar', submitted: 14, approved: 12, rejected: 2 },
    { month: 'Apr', submitted: 22, approved: 19, rejected: 3 },
    { month: 'May', submitted: 35, approved: 30, rejected: 4 },
    { month: 'Jun', submitted: 28, approved: 25, rejected: 2 },
    { month: 'Jul', submitted: 42, approved: 38, rejected: 3 },
    { month: 'Aug', submitted: requests.length + 30, approved: approved + 26, rejected: rejected + 3 }
  ];

  res.json({
    success: true,
    summary: {
      total,
      approved,
      rejected,
      pending,
      delayedOrSlaBreached,
      totalSpend,
      approvedSpend,
      approvalRate,
      rejectionRate,
      averageApprovalHours: 4.6,
      slaComplianceRate: 94.2
    },
    requestsByType,
    requestsByPriority,
    requestsByDepartment,
    statusDistribution,
    approverStats,
    monthlyTrend
  });
});

export default router;
