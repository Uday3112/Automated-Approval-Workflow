import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  ShieldAlert, 
  User, 
  Building2, 
  Wallet, 
  Download, 
  MessageSquare, 
  Send,
  AlertTriangle,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency, formatDate, getRoleLabel } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SLACountdown from '../components/SLACountdown';
import ApprovalTimeline from '../components/ApprovalTimeline';
import DocumentViewerModal from '../components/DocumentViewerModal';
import { ApproveModal, RejectModal, RequestInfoModal, RespondInfoModal } from '../components/ActionModals';

export default function RequestDetailsPage({ requestId, onBack, onNavigate }) {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDocPreview, setActiveDocPreview] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'info' | 'respond'
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getRequestById(requestId);
      if (res.success && res.request) {
        setRequest(res.request);
      }
    } catch (err) {
      console.error('Failed to load request details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId, currentUser]);

  const handleApprove = async (comment) => {
    setActionLoading(true);
    try {
      const res = await api.approveRequest(request.id, comment);
      if (res.success) {
        showToast('Request stage approved successfully!', 'success', 'Approved');
        setModalType(null);
        fetchRequestDetails();
      }
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    try {
      const res = await api.rejectRequest(request.id, reason);
      if (res.success) {
        showToast('Request rejected.', 'error', 'Rejected');
        setModalType(null);
        fetchRequestDetails();
      }
    } catch (err) {
      alert(err.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async (question) => {
    setActionLoading(true);
    try {
      const res = await api.requestInfo(request.id, question);
      if (res.success) {
        showToast('Clarification request sent.', 'warning', 'Information Requested');
        setModalType(null);
        fetchRequestDetails();
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespondInfo = async ({ response, documents }) => {
    setActionLoading(true);
    try {
      const res = await api.respondInfo(request.id, { response, documents });
      if (res.success) {
        showToast('Response submitted and approval workflow resumed!', 'success', 'Information Provided');
        setModalType(null);
        fetchRequestDetails();
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 mx-auto animate-spin text-indigo-600" />
        <p className="text-sm font-semibold">Loading request lifecycle details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Request Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">The request may have been removed or does not exist.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Back to List
        </button>
      </div>
    );
  }

  const currentStep = request.steps && request.steps[request.currentStepIndex];
  const isCreator = currentUser?.id === request.createdBy;
  const isCurrentApprover = currentUser?.role === 'admin' || (currentStep && currentUser?.role === currentStep.role);
  const isPendingAction = request.status.includes('Pending') || request.status === 'Submitted' || request.status === 'Escalated';
  const isInfoRequired = request.status === 'More Information Required';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Back Nav & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </button>

        {/* Approver Action Bar (if active step belongs to current user) */}
        {isCurrentApprover && isPendingAction && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalType('approve')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Step</span>
            </button>
            <button
              onClick={() => setModalType('reject')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => setModalType('info')}
              className="px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Request Info</span>
            </button>
          </div>
        )}

        {/* Requester Response Button (if info is required) */}
        {isInfoRequired && (
          <button
            onClick={() => setModalType('respond')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 animate-pulse"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Respond to Clarification Request</span>
          </button>
        )}
      </div>

      {/* SLA Alert Banner if Escalated */}
      {(request.isEscalated || request.isDelayed) && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center gap-3 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-red-700 dark:text-red-300">
              SLA Timeout Breached • Auto-Escalated to Management
            </p>
            <p className="text-[11px] text-red-600 dark:text-red-400">
              This request exceeded its {request.slaTotalHours}h SLA deadline. Priority override is activated.
            </p>
          </div>
        </div>
      )}

      {/* Main Request Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                {request.id}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {request.requestType}
              </span>
              <PriorityBadge priority={request.priority} size="sm" />
              <StatusBadge status={request.status} size="sm" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {request.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Created on {formatDate(request.createdAt)} by <strong className="text-slate-700 dark:text-slate-300">{request.creatorName}</strong> ({request.creatorDepartment})
            </p>
          </div>

          {/* Amount Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left md:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400">Requested Amount</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {request.amount > 0 ? formatCurrency(request.amount, request.currency) : 'Non-Financial'}
            </p>
            <div className="mt-1 flex items-center justify-start md:justify-end gap-1.5">
              <span className="text-[11px] text-slate-500">SLA:</span>
              <SLACountdown deadline={request.slaExpiresAt} status={request.status} isDelayed={request.isDelayed} />
            </div>
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Approval Path Lifecycle ({request.matchedWorkflowName || 'Configured Rule'})
            </h3>
            <span className="text-[11px] text-slate-400">
              Stage {request.currentStepIndex + 1} of {request.steps?.length || 0}
            </span>
          </div>

          <ApprovalTimeline
            steps={request.steps || []}
            currentStepIndex={request.currentStepIndex}
            status={request.status}
            isEscalated={request.isEscalated}
            isDelayed={request.isDelayed}
          />
        </div>
      </div>

      {/* Two-Column Details & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Description & Custom Fields */}
        <div className="lg:col-span-7 space-y-6">
          {/* Description & Justification */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Request Details & Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Description</span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {request.description || 'No description provided.'}
                </p>
              </div>

              {request.justification && (
                <div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Business Justification</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {request.justification}
                  </p>
                </div>
              )}

              {/* Contextual Custom Fields Table */}
              {request.customFields && Object.keys(request.customFields).length > 0 && (
                <div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Contextual Parameters</span>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {Object.entries(request.customFields).map(([key, val]) => (
                      <div key={key} className="py-1">
                        <span className="text-[10px] text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attached Documents Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Supporting Documents & Attachments</span>
              <span className="text-[11px] text-slate-400">{request.documents?.length || 0} Files</span>
            </h3>

            <div className="space-y-2">
              {(!request.documents || request.documents.length === 0) ? (
                <p className="text-xs text-slate-400 py-4 text-center">No documents attached.</p>
              ) : (
                request.documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocPreview(doc)}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400">{doc.size} • Uploaded {formatDate(doc.uploadedAt)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                    >
                      Preview
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: End-to-End Audit Trail & Approver Comments */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Audit Trail & History
              </h3>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Compliance Verified
              </span>
            </div>

            {/* Audit Logs list */}
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {request.auditLogs?.map((log, index) => {
                const isApproved = log.action.includes('Approved') || log.action.includes('Completed');
                const isRejected = log.action.includes('Rejected');
                const isEscalated = log.action.includes('Escalated') || log.action.includes('Breached');
                const isInfo = log.action.includes('Information');

                return (
                  <div key={log.id || index} className="relative flex items-start gap-3.5 pl-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      isApproved 
                        ? 'bg-emerald-500 text-white' 
                        : isRejected 
                        ? 'bg-rose-500 text-white' 
                        : isEscalated 
                        ? 'bg-red-600 text-white animate-pulse' 
                        : isInfo 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-indigo-600 text-white'
                    }`}>
                      <span className="text-[9px] font-bold">●</span>
                    </div>

                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {log.actor}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {log.action}
                      </p>
                      {log.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={Boolean(activeDocPreview)}
        onClose={() => setActiveDocPreview(null)}
        document={activeDocPreview}
      />

      {/* Action Modals */}
      <ApproveModal
        isOpen={modalType === 'approve'}
        onClose={() => setModalType(null)}
        onConfirm={handleApprove}
        request={request}
        loading={actionLoading}
      />

      <RejectModal
        isOpen={modalType === 'reject'}
        onClose={() => setModalType(null)}
        onConfirm={handleReject}
        request={request}
        loading={actionLoading}
      />

      <RequestInfoModal
        isOpen={modalType === 'info'}
        onClose={() => setModalType(null)}
        onConfirm={handleRequestInfo}
        request={request}
        loading={actionLoading}
      />

      <RespondInfoModal
        isOpen={modalType === 'respond'}
        onClose={() => setModalType(null)}
        onConfirm={handleRespondInfo}
        request={request}
        loading={actionLoading}
      />
    </div>
  );
}
