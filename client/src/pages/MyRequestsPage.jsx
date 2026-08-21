import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Calendar, 
  ArrowUpDown, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getRoleLabel } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SLACountdown from '../components/SLACountdown';

export default function MyRequestsPage({ onNavigate, onSelectRequest }) {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getRequests({ scope: 'my_requests' });
      if (res.success && res.requests) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error('Failed to load my requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  // Filter & Sort Logic
  const filteredRequests = requests.filter(r => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = r.id?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchType = r.requestType?.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchType) return false;
    }

    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') {
        if (!r.status?.includes('Pending') && r.status !== 'Submitted') return false;
      } else if (statusFilter === 'Delayed') {
        if (!r.isDelayed && !r.isEscalated && r.status !== 'Escalated') return false;
      } else if (r.status !== statusFilter) {
        return false;
      }
    }

    if (typeFilter !== 'All' && r.requestType !== typeFilter) return false;
    if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'date_asc') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'amount_desc') return (b.amount || 0) - (a.amount || 0);
    if (sortBy === 'amount_asc') return (a.amount || 0) - (b.amount || 0);
    return 0;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Personal Tracking
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">Requester: {currentUser?.name}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            My Request History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track real-time approval stages, approver notes, and SLA status for all your submitted requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRequests}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('create')}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Search & Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Request ID, title, or type..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              <option value="All">All Request Types</option>
              <option value="Purchase">Purchase Requests</option>
              <option value="Expense">Expense Requests</option>
              <option value="Discount">Discount Requests</option>
              <option value="Resource">Resource / Cloud</option>
              <option value="IT Support / Equipment">IT Support & Equipment</option>
              <option value="Leave / Special">Leave / Special</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Status Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
          {['All', 'Pending', 'Approved', 'More Information Required', 'Delayed', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st === 'More Information Required' ? 'Info Required' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Title & Type</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Date Created</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Current Approver</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">SLA Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No requests found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search criteria or create a new request.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const currentStep = req.steps && req.steps[req.currentStepIndex];
                  return (
                    <tr
                      key={req.id}
                      onClick={() => onSelectRequest(req.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {req.id}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800 dark:text-slate-100 max-w-xs truncate">{req.title}</p>
                        <span className="text-[11px] text-slate-400 font-medium">{req.requestType}</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {req.amount > 0 ? formatCurrency(req.amount, req.currency) : '—'}
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <PriorityBadge priority={req.priority} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        {req.status === 'Approved' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Completed</span>
                        ) : req.status === 'Rejected' ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">✗ Closed</span>
                        ) : currentStep ? (
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {getRoleLabel(currentStep.role)}
                            </p>
                            <span className="text-[10px] text-slate-400">Stage {currentStep.stepOrder} of {req.steps.length}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <SLACountdown 
                          deadline={req.slaExpiresAt} 
                          status={req.status} 
                          isDelayed={req.isDelayed} 
                        />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRequest(req.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
