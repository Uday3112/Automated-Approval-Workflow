import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  PlusCircle, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Layers,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getRoleLabel } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SLACountdown from '../components/SLACountdown';

export default function DashboardPage({ onNavigate, onSelectRequest }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    delayedOrSlaBreached: 0,
    totalSpend: 0,
    approvalRate: 0
  });
  const [requestsByType, setRequestsByType] = useState([]);
  const [requestsByPriority, setRequestsByPriority] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [analyticsRes, requestsRes] = await Promise.all([
          api.getAnalytics(),
          api.getRequests()
        ]);

        if (analyticsRes.success) {
          setSummary(analyticsRes.summary);
          setRequestsByType(analyticsRes.requestsByType || []);
          setRequestsByPriority(analyticsRes.requestsByPriority || []);
          setStatusDistribution(analyticsRes.statusDistribution || []);
        }

        if (requestsRes.success && requestsRes.requests) {
          setRecentRequests(requestsRes.requests.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [currentUser]);

  const urgentRequests = recentRequests.filter(r => r.isDelayed || r.isEscalated || r.priority === 'Critical');

  const statCards = [
    {
      title: 'Total Requests',
      value: summary.total,
      icon: FileText,
      color: 'from-blue-600 to-indigo-600',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-600 dark:text-blue-400',
      subtext: `Total volume processed`
    },
    {
      title: 'Pending Approvals',
      value: summary.pending,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-600 dark:text-amber-400',
      subtext: `Across active tiers`
    },
    {
      title: 'Approved Requests',
      value: summary.approved,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      subtext: `${summary.approvalRate}% completion rate`
    },
    {
      title: 'Rejected Requests',
      value: summary.rejected,
      icon: XCircle,
      color: 'from-rose-500 to-pink-600',
      bgLight: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      textColor: 'text-rose-600 dark:text-rose-400',
      subtext: `Compliance / budget rejects`
    },
    {
      title: 'Delayed / SLA Breached',
      value: summary.delayedOrSlaBreached,
      icon: ShieldAlert,
      color: 'from-red-600 to-rose-700',
      bgLight: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
      textColor: 'text-red-600 dark:text-red-400',
      subtext: `Immediate attention required`,
      highlight: summary.delayedOrSlaBreached > 0
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Enterprise Dashboard
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Welcome back, {currentUser?.name} ({getRoleLabel(currentUser?.role)})
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Workflow Overview & Approvals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time status of multi-tier purchase, expense, discount, and resource requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('create')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 group"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Request</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* SLA Alert Banner if Breaches Exist */}
      {urgentRequests.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-700 dark:text-red-300">
                {urgentRequests.length} Urgent / SLA Escalated Request(s)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Critical priority requests or SLA timeouts requiring immediate approver action.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inbox')}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold self-start sm:self-auto shadow-sm transition-colors"
          >
            Review Urgent Inbox
          </button>
        </div>
      )}

      {/* 5 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:shadow-md ${card.bgLight}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{card.title}</span>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black ${card.textColor}`}>
                  {card.value}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {card.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Requests by Category</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total volume and requests per category</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Active Workflows
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestsByType} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }} 
                  interval={0} 
                  angle={-15} 
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px', 
                    color: '#fff',
                    fontSize: '12px' 
                  }} 
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Requests Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approval Status Donut Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Approval Status Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current lifecycle distribution</p>
            </div>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px', 
                    color: '#fff',
                    fontSize: '12px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900 dark:text-slate-100">{summary.total}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {statusDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Requests Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Approval Requests</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live requests pipeline and approver stage</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('my-requests')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Requests</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Request ID & Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentRequests.map((req) => (
                <tr 
                  key={req.id} 
                  onClick={() => onSelectRequest(req.id)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block text-[11px]">
                      {req.id}
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 max-w-xs truncate">
                      {req.title}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {req.requestType}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{req.creatorName}</p>
                    <p className="text-[10px] text-slate-400">{req.department}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {req.amount > 0 ? formatCurrency(req.amount, req.currency) : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={req.priority} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={req.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <SLACountdown deadline={req.slaExpiresAt} status={req.status} isDelayed={req.isDelayed} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRequest(req.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
