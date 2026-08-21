import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Plus, 
  Edit3, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  User, 
  Building2, 
  Wallet, 
  Crown,
  ChevronRight,
  ArrowDown,
  X,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency, getRoleLabel } from '../utils/formatters';

const ROLE_OPTIONS = [
  { id: 'manager', label: 'Direct Manager', icon: User, desc: 'Immediate reporting manager' },
  { id: 'department_head', label: 'Department Head / VP', icon: Building2, desc: 'Functional VP or Department Director' },
  { id: 'finance', label: 'Finance Team', icon: Wallet, desc: 'Finance controller & audit' },
  { id: 'admin', label: 'System Admin / Executive', icon: Crown, desc: 'Executive leadership signoff' }
];

export default function WorkflowBuilderPage() {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkflow, setActiveWorkflow] = useState(null);

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Sandbox simulation state
  const [simType, setSimType] = useState('Purchase');
  const [simAmount, setSimAmount] = useState(250000);
  const [simDept, setSimDept] = useState('Engineering');
  const [simPriority, setSimPriority] = useState('Critical');
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.getWorkflows();
      if (res.success && res.workflows) {
        setWorkflows(res.workflows);
        if (res.workflows.length > 0 && !activeWorkflow) {
          setActiveWorkflow(res.workflows[0]);
        } else if (activeWorkflow) {
          const found = res.workflows.find(w => w.id === activeWorkflow.id);
          setActiveWorkflow(found || res.workflows[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRule({
      name: '',
      description: '',
      requestType: 'Purchase',
      minAmount: 0,
      maxAmount: 100000,
      departments: ['All'],
      priorities: ['All'],
      steps: [
        { stepOrder: 1, role: 'manager', title: 'Direct Manager Approval', slaHours: 24, autoEscalate: true }
      ],
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (wf) => {
    setEditingRule(JSON.parse(JSON.stringify(wf)));
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!editingRule.name || !editingRule.steps || editingRule.steps.length === 0) {
      alert('Please provide a rule name and at least one approval step.');
      return;
    }

    try {
      const res = await api.saveWorkflow(editingRule);
      if (res.success) {
        showToast(`Workflow rule '${editingRule.name}' saved successfully!`, 'success', 'Rule Configured');
        setIsModalOpen(false);
        setEditingRule(null);
        fetchWorkflows();
      }
    } catch (err) {
      alert(err.message || 'Failed to save workflow');
    }
  };

  const handleDeleteRule = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete workflow rule '${name}'?`)) return;
    try {
      const res = await api.deleteWorkflow(id);
      if (res.success) {
        showToast('Workflow rule deleted.', 'info');
        fetchWorkflows();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await api.testRule({
        requestType: simType,
        amount: Number(simAmount) || 0,
        department: simDept,
        priority: simPriority
      });
      if (res.success) {
        setSimResult(res.result);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Run initial simulation
  useEffect(() => {
    handleRunSimulation();
  }, [simType, simAmount, simDept, simPriority]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Admin Configuration
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">Autonomous Workflow Rules</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Visual Workflow Builder
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Define multi-tier approval paths, threshold limits (e.g. &lt; ₹50,000, ₹50k-₹2L, &gt; ₹2L), SLA deadlines, and auto-escalation triggers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Rule</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Rule Selector & Visual Flowchart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Configured Workflow Rules List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 px-2 py-1 mb-2">
              Configured Enterprise Policies ({workflows.length})
            </h3>

            <div className="space-y-2">
              {workflows.map((wf) => {
                const isSelected = activeWorkflow?.id === wf.id;
                return (
                  <div
                    key={wf.id}
                    onClick={() => setActiveWorkflow(wf)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          {wf.requestType}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {wf.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(wf);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Edit Rule"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRule(wf.id, wf.name);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                      {wf.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span>Threshold: {formatCurrency(wf.minAmount)} – {wf.maxAmount > 9999999 ? '∞' : formatCurrency(wf.maxAmount)}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{wf.steps?.length || 0} Approval Tiers</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Visual Flowchart Canvas of the Selected Workflow */}
        <div className="lg:col-span-7 space-y-6">
          {activeWorkflow ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Visual Pipeline Architecture
                    </span>
                    <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {activeWorkflow.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeWorkflow.description}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenEditModal(activeWorkflow)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Tiers</span>
                </button>
              </div>

              {/* Node 1: Trigger Condition */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-2">
                  <Sliders className="w-4 h-4" />
                  <span>Entry Trigger Condition</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Type:</span>
                    <strong>{activeWorkflow.requestType}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Amount Range:</span>
                    <strong>{formatCurrency(activeWorkflow.minAmount)} – {activeWorkflow.maxAmount > 9999999 ? 'No Limit' : formatCurrency(activeWorkflow.maxAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Department Scope:</span>
                    <strong>{activeWorkflow.departments?.join(', ') || 'All'}</strong>
                  </div>
                </div>
              </div>

              {/* Arrow Connector */}
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

              {/* Flowchart Tier Nodes */}
              <div className="space-y-3 relative">
                {activeWorkflow.steps?.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {step.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {getRoleLabel(step.role)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-indigo-500" />
                              {step.slaHours} Hours SLA
                            </span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400">Auto-Escalate Active</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {idx < activeWorkflow.steps.length - 1 && (
                      <div className="flex justify-center my-1">
                        <ArrowDown className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Final Node: Completion */}
              <div className="flex justify-center">
                <ArrowDown className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Final Approval Granted & Notification Broadcasted</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
              Select a workflow policy from the list to view its pipeline diagram.
            </div>
          )}

          {/* Live Rule Testing Sandbox */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl border border-indigo-900/60 shadow-xl text-white space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Rule Testing Sandbox
              </h3>
            </div>
            <p className="text-xs text-indigo-200/80">
              Test how the rule engine resolves any sample payload in real time.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">Type</label>
                <select
                  value={simType}
                  onChange={(e) => setSimType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="Purchase">Purchase</option>
                  <option value="Expense">Expense</option>
                  <option value="Discount">Discount</option>
                  <option value="Resource">Resource</option>
                  <option value="IT Support / Equipment">IT Support</option>
                  <option value="Leave / Special">Leave</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">Dept</label>
                <select
                  value={simDept}
                  onChange={(e) => setSimDept(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">Priority</label>
                <select
                  value={simPriority}
                  onChange={(e) => setSimPriority(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Simulation Result Output */}
            {simResult && (
              <div className="mt-3 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-300">Matched Policy:</span>
                  <span className="font-bold text-white">{simResult.matchedWorkflowName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-300">Generated Pipeline:</span>
                  <span className="font-bold text-emerald-400">
                    {simResult.steps?.map(s => getRoleLabel(s.role)).join(' ➔ ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Rule Modal */}
      {isModalOpen && editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingRule.id ? 'Edit Approval Policy Rule' : 'Create New Approval Policy'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  placeholder="e.g. Purchase: High Value (> ₹2,00,000)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  placeholder="Governance policy summary..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Request Type</label>
                  <select
                    value={editingRule.requestType}
                    onChange={(e) => setEditingRule({ ...editingRule, requestType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Purchase">Purchase</option>
                    <option value="Expense">Expense</option>
                    <option value="Discount">Discount</option>
                    <option value="Resource">Resource</option>
                    <option value="IT Support / Equipment">IT Support</option>
                    <option value="Leave / Special">Leave</option>
                    <option value="All">All Types</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Amount (₹)</label>
                  <input
                    type="number"
                    value={editingRule.minAmount}
                    onChange={(e) => setEditingRule({ ...editingRule, minAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Amount (₹)</label>
                  <input
                    type="number"
                    value={editingRule.maxAmount}
                    onChange={(e) => setEditingRule({ ...editingRule, maxAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* Approval Tiers Configuration */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Sequential Approval Stages
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRule({
                        ...editingRule,
                        steps: [
                          ...editingRule.steps,
                          { stepOrder: editingRule.steps.length + 1, role: 'department_head', title: 'Department Head Approval', slaHours: 24, autoEscalate: true }
                        ]
                      });
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tier</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {editingRule.steps.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <select
                          value={step.role}
                          onChange={(e) => {
                            const newSteps = [...editingRule.steps];
                            newSteps[idx].role = e.target.value;
                            newSteps[idx].title = `${getRoleLabel(e.target.value)} Approval`;
                            setEditingRule({ ...editingRule, steps: newSteps });
                          }}
                          className="px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold"
                        >
                          {ROLE_OPTIONS.map(r => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const newSteps = [...editingRule.steps];
                            newSteps[idx].title = e.target.value;
                            setEditingRule({ ...editingRule, steps: newSteps });
                          }}
                          placeholder="Stage Title"
                          className="px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        />

                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={step.slaHours}
                            onChange={(e) => {
                              const newSteps = [...editingRule.steps];
                              newSteps[idx].slaHours = Number(e.target.value);
                              setEditingRule({ ...editingRule, steps: newSteps });
                            }}
                            className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-center"
                          />
                          <span className="text-[10px] text-slate-400">Hours</span>
                        </div>
                      </div>

                      {editingRule.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newSteps = editingRule.steps.filter((_, i) => i !== idx);
                            setEditingRule({ ...editingRule, steps: newSteps });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                >
                  Save Policy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
