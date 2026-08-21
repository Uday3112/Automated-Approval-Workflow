import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Sparkles, 
  User, 
  Building2, 
  Wallet, 
  ChevronRight, 
  Filter,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency, formatDate, getRoleLabel } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SLACountdown from '../components/SLACountdown';
import { ApproveModal, RejectModal, RequestInfoModal } from '../components/ActionModals';

export default function ApprovalInboxPage({ onNavigate, onSelectRequest }) {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReqForAction, setSelectedReqForAction] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'info'
  const [actionLoading, setActionLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await api.getRequests({ scope: 'pending_approval' });
      if (res.success && res.requests) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [currentUser]);

  const handleApprove = async (comment) => {
    if (!selectedReqForAction) return;
    setActionLoading(true);
    try {
      const res = await api.approveRequest(selectedReqForAction.id, comment);
      if (res.success) {
        showToast(`Request ${selectedReqForAction.id} approved successfully!`, 'success', 'Approved');
        setModalType(null);
        setSelectedReqForAction(null);
        fetchInbox();
      }
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!selectedReqForAction) return;
    setActionLoading(true);
    try {
      const res = await api.rejectRequest(selectedReqForAction.id, reason);
      if (res.success) {
        showToast(`Request ${selectedReqForAction.id} rejected.`, 'error', 'Rejected');
        setModalType(null);
        setSelectedReqForAction(null);
        fetchInbox();
      }
    } catch (err) {
      alert(err.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async (question) => {
    if (!selectedReqForAction) return;
    setActionLoading(true);
    try {
      const res = await api.requestInfo(selectedReqForAction.id, question);
      if (res.success) {
        showToast(`Clarification request sent to ${selectedReqForAction.creatorName}.`, 'warning', 'Information Requested');
        setModalType(null);
        setSelectedReqForAction(null);
        fetchInbox();
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateSlaBreach = async (reqId) => {
    try {
      const res = await api.simulateSlaBreach(reqId);
      if (res.success) {
        showToast(`Simulated SLA timeout on ${reqId}! Request marked as Delayed & Auto-Escalated.`, 'error', 'SLA Breached & Escalated');
        fetchInbox();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'Urgent') return r.priority === 'Critical' || r.isDelayed || r.isEscalated;
    if (activeFilter === 'Purchase') return r.requestType === 'Purchase';
    if (activeFilter === 'Expense') return r.requestType === 'Expense';
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Authority Queue
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">Active Approver: {currentUser?.name} ({getRoleLabel(currentUser?.role)})</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Approval Inbox
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Requests waiting for your decision. Check SLA deadlines, verify documents, and approve or request information.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchInbox}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Inbox"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            {filteredRequests.length} Pending Actions
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'All', label: 'All Pending Approvals' },
          { id: 'Urgent', label: 'Urgent & Critical (SLA Alerts)' },
          { id: 'Purchase', label: 'Purchase Invoices' },
          { id: 'Expense', label: 'Expense Reimbursements' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Card List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">All Caught Up!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            There are no requests waiting for your approval tier right now. You can switch to another user persona in the top navigation bar to test other workflow stages.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const currentStep = req.steps && req.steps[req.currentStepIndex];
            const isCritical = req.priority === 'Critical' || req.isDelayed;

            return (
              <div
                key={req.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border shadow-xs transition-all overflow-hidden ${
                  isCritical 
                    ? 'border-red-300 dark:border-red-900/60 ring-1 ring-red-500/20' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header Strip */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      {req.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {req.requestType}
                    </span>
                    <PriorityBadge priority={req.priority} size="sm" />
                    <StatusBadge status={req.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">SLA Countdown:</span>
                    <SLACountdown deadline={req.slaExpiresAt} status={req.status} isDelayed={req.isDelayed} />
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Request summary & Requester */}
                  <div className="lg:col-span-8 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {req.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {req.description}
                      </p>
                      {req.justification && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                          <strong>Justification:</strong> {req.justification}
                        </p>
                      )}
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Requester: <strong>{req.creatorName}</strong> ({req.department})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Workflow: <strong>{req.matchedWorkflowName || 'Standard'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Attachments: <strong>{req.documents?.length || 0} files</strong></span>
                      </div>
                    </div>

                    {/* Documents pill list */}
                    {req.documents && req.documents.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {req.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                          >
                            <FileText className="w-3 h-3 text-indigo-500" />
                            <span>{doc.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                    <div className="mb-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Requested Amount</span>
                      <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                        {req.amount > 0 ? formatCurrency(req.amount, req.currency) : 'Non-Financial'}
                      </p>
                      {currentStep && (
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                          Current Stage: {currentStep.title} (Tier {currentStep.stepOrder} of {req.steps.length})
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedReqForAction(req);
                            setModalType('approve');
                          }}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedReqForAction(req);
                            setModalType('reject');
                          }}
                          className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedReqForAction(req);
                          setModalType('info');
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Request Additional Info</span>
                      </button>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                        <button
                          onClick={() => onSelectRequest(req.id)}
                          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5"
                        >
                          <span>Full Lifecycle</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>

                        {/* Simulate SLA Breach for Live Demo */}
                        <button
                          onClick={() => handleSimulateSlaBreach(req.id)}
                          className="text-red-500 hover:text-red-700 font-semibold text-[10px] hover:underline"
                          title="Simulate immediate timeout & auto-escalation"
                        >
                          ⚡ Test SLA Breach
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ApproveModal
        isOpen={modalType === 'approve'}
        onClose={() => setModalType(null)}
        onConfirm={handleApprove}
        request={selectedReqForAction}
        loading={actionLoading}
      />

      <RejectModal
        isOpen={modalType === 'reject'}
        onClose={() => setModalType(null)}
        onConfirm={handleReject}
        request={selectedReqForAction}
        loading={actionLoading}
      />

      <RequestInfoModal
        isOpen={modalType === 'info'}
        onClose={() => setModalType(null)}
        onConfirm={handleRequestInfo}
        request={selectedReqForAction}
        loading={actionLoading}
      />
    </div>
  );
}
