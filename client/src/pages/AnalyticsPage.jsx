import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Download, 
  Calendar, 
  Filter, 
  Award, 
  Building2,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend 
} from 'recharts';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const res = await api.getAnalytics();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [timeRange]);

  const handleExportCSV = () => {
    if (!data) return;
    let csvContent = 'data:text/csv;charset=utf-8,Category,Count,Total Amount\n';
    data.requestsByType?.forEach(row => {
      csvContent += `"${row.name}",${row.count},${row.amount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Approval_Workflow_Analytics_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 mx-auto animate-spin text-indigo-600" />
        <p className="text-sm font-semibold">Compiling enterprise workflow telemetry...</p>
      </div>
    );
  }

  const { summary, requestsByType, requestsByPriority, requestsByDepartment, statusDistribution, approverStats, monthlyTrend } = data;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Executive Telemetry
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">Real-Time SLA & Approver Performance</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Analytics & Governance Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deep dive into approval turnaround efficiency, SLA breach benchmarks, department spend, and approver velocity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
            <option value="1y">Year to Date</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span>Approval Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {summary.approvalRate}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>+3.2% vs last month</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span>Avg Turnaround Time</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {summary.averageApprovalHours}h
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <span>⚡ 65% faster than SLA target</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span>SLA Compliance Rate</span>
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {summary.slaComplianceRate}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.delayedOrSlaBreached} breaches registered
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span>Total Capital Approved</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatCurrency(summary.approvedSpend)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Out of {formatCurrency(summary.totalSpend)} requested
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Submission & Approval Velocity Line Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Workflow Velocity & Trends</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly submissions vs completed approvals</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="submitted" stroke="#6366f1" strokeWidth={3} name="Total Submitted" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={3} name="Approved Requests" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="rejected" stroke="#f43f5e" strokeWidth={2} name="Rejections" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests by Department Bar Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Spend by Department</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Capital distribution</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestsByDepartment} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: '#94a3b8' }} width={80} />
                <Tooltip 
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                />
                <Bar dataKey="spend" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Total Spend" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Approver Performance Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Approver Velocity & SLA Leaderboard</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Decision speed, volume handled, and SLA compliance ratings</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Approver Name</th>
                <th className="py-3.5 px-4">Role & Domain</th>
                <th className="py-3.5 px-4">Avg Turnaround</th>
                <th className="py-3.5 px-4">Approvals</th>
                <th className="py-3.5 px-4">Rejections</th>
                <th className="py-3.5 px-4">SLA Compliance</th>
                <th className="py-3.5 px-4 text-right">Performance Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {approverStats.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{item.name}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {item.role}
                  </td>
                  <td className="py-4 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {item.avgTimeHours} hours
                  </td>
                  <td className="py-4 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {item.approvals}
                  </td>
                  <td className="py-4 px-4 text-rose-600 dark:text-rose-400 font-semibold">
                    {item.rejections}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${item.complianceRate}%` }} 
                        />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.complianceRate}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      Tier 1 Approver
                    </span>
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
