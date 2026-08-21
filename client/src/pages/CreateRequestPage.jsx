import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Upload, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Building2, 
  ShieldCheck, 
  Trash2,
  HelpCircle,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency, getRoleLabel } from '../utils/formatters';

const REQUEST_TYPES = [
  { id: 'Purchase', label: 'Purchase Request', desc: 'Hardware, software licenses, office equipment, cloud assets' },
  { id: 'Expense', label: 'Expense Reimbursement', desc: 'Travel, client meals, incidental business expenses' },
  { id: 'Discount', label: 'Discount Approval', desc: 'Client contract volume discounts, special pricing quotes' },
  { id: 'Resource', label: 'Resource / Cloud Quota', desc: 'GPU clusters, contractor staff, compute resource allocation' },
  { id: 'IT Support / Equipment', label: 'IT Support & Equipment', desc: 'Developer laptop upgrades, displays, peripherals' },
  { id: 'Leave / Special', label: 'Leave / Special Request', desc: 'Conference travel sponsorship, sabbatical, extended leave' }
];

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'Finance', 'Human Resources', 'Operations', 'Executive'];

const PRIORITIES = [
  { id: 'Low', label: 'Low', sla: '72h SLA', desc: 'Standard non-urgent requests', color: 'border-slate-300 text-slate-700 dark:text-slate-300' },
  { id: 'Medium', label: 'Medium', sla: '48h SLA', desc: 'Normal operational priority', color: 'border-blue-300 text-blue-700 dark:text-blue-400' },
  { id: 'High', label: 'High', sla: '24h SLA', desc: 'High business importance', color: 'border-amber-300 text-amber-700 dark:text-amber-400' },
  { id: 'Critical', label: 'Critical', sla: '4h SLA', desc: 'Immediate emergency blocker', color: 'border-red-400 text-red-700 dark:text-red-400' }
];

export default function CreateRequestPage({ onNavigate, onSelectRequest }) {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    requestType: 'Purchase',
    amount: 125000,
    currency: 'INR',
    department: currentUser?.department || 'Engineering',
    priority: 'High',
    description: '',
    justification: '',
    // Dynamic contextual fields
    vendor: '',
    itemCount: 1,
    deliveryLocation: 'Bangalore Office - Floor 3',
    expenseCategory: 'Travel & Lodging',
    expenseDate: new Date().toISOString().split('T')[0],
    clientName: '',
    discountPercentage: '15%',
    contractTermMonths: 12,
    hardwareCategory: 'Developer Laptop',
    leaveDates: '',
    cloudProvider: 'Google Cloud Platform'
  });

  const [documents, setDocuments] = useState([
    { id: 'doc_init_1', name: 'Quotation_Specification_Doc.pdf', size: '1.2 MB', type: 'application/pdf', uploadedAt: new Date().toISOString() }
  ]);
  const [newDocName, setNewDocName] = useState('');
  const [loading, setLoading] = useState(false);
  const [predictedPath, setPredictedPath] = useState(null);
  const [predicting, setPredicting] = useState(false);

  // Dynamic Rule Path Calculation on Form Change
  useEffect(() => {
    let active = true;
    async function fetchPredictedPath() {
      setPredicting(true);
      try {
        const res = await api.previewPath({
          requestType: formData.requestType,
          amount: Number(formData.amount) || 0,
          department: formData.department,
          priority: formData.priority,
          role: currentUser?.role || 'employee'
        });
        if (active && res.success) {
          setPredictedPath(res);
        }
      } catch (err) {
        console.error('Error previewing workflow path:', err);
      } finally {
        if (active) setPredicting(false);
      }
    }

    const timer = setTimeout(fetchPredictedPath, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [formData.requestType, formData.amount, formData.department, formData.priority, currentUser]);

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    setDocuments(prev => [
      ...prev,
      {
        id: `doc_${Date.now()}`,
        name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
        size: `${(0.8 + Math.random() * 2).toFixed(1)} MB`,
        type: 'application/pdf',
        uploadedAt: new Date().toISOString()
      }
    ]);
    setNewDocName('');
  };

  const handleRemoveDoc = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a request title.');
      return;
    }

    setLoading(true);
    try {
      const customFields = {};
      if (formData.requestType === 'Purchase') {
        customFields.vendor = formData.vendor || 'Authorized Supplier';
        customFields.itemCount = formData.itemCount;
        customFields.deliveryLocation = formData.deliveryLocation;
      } else if (formData.requestType === 'Expense') {
        customFields.expenseCategory = formData.expenseCategory;
        customFields.expenseDate = formData.expenseDate;
      } else if (formData.requestType === 'Discount') {
        customFields.clientName = formData.clientName || 'Enterprise Client';
        customFields.discountPercentage = formData.discountPercentage;
        customFields.contractTermMonths = formData.contractTermMonths;
      } else if (formData.requestType === 'IT Support / Equipment') {
        customFields.hardwareCategory = formData.hardwareCategory;
      } else if (formData.requestType === 'Leave / Special') {
        customFields.leaveDates = formData.leaveDates || 'Next Week';
      } else if (formData.requestType === 'Resource') {
        customFields.cloudProvider = formData.cloudProvider;
      }

      const payload = {
        title: formData.title,
        requestType: formData.requestType,
        amount: Number(formData.amount) || 0,
        currency: formData.currency,
        department: formData.department,
        priority: formData.priority,
        description: formData.description,
        justification: formData.justification,
        customFields,
        documents
      };

      const res = await api.createRequest(payload);
      if (res.success && res.request) {
        showToast(`Request ${res.request.id} created successfully! Routed for approval.`, 'success', 'Request Submitted');
        if (onSelectRequest) {
          onSelectRequest(res.request.id);
        } else {
          onNavigate('my-requests');
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              New Approval Request
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">Autonomous Rule Routing</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Create Enterprise Request
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill in the request details below. The approval sequence will automatically calculate based on amount, department, and priority.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: The Interactive Request Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Card 1: Request Type Selector */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Select Request Type <span className="text-indigo-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Determines routing workflow</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REQUEST_TYPES.map((type) => {
                const isSelected = formData.requestType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, requestType: type.id })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {type.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {type.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Core Details */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              2. Core Details & Department
            </h3>

            {/* Request Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Request Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Procurement of High-Performance Engineering Workstations"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Department & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Amount (INR ₹)</span>
                  <span className="text-[10px] text-indigo-500 font-normal">Triggers tier threshold</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority Level (SLA Commitment)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORITIES.map((p) => {
                  const isSelected = formData.priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p.id })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <p className="text-xs font-bold">{p.label}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{p.sla}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contextual Fields depending on Request Type */}
            {formData.requestType === 'Purchase' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Recommended Vendor</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g. Apple Business, Dell India"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Delivery Location</label>
                  <input
                    type="text"
                    value={formData.deliveryLocation}
                    onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                    placeholder="Office Branch / Floor"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>
            )}

            {formData.requestType === 'Expense' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Expense Category</label>
                  <select
                    value={formData.expenseCategory}
                    onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Travel & Lodging">Travel & Lodging</option>
                    <option value="Client Meals & Entertainment">Client Meals & Entertainment</option>
                    <option value="Software Subscription">Software Subscription</option>
                    <option value="Office Supplies">Office Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Expense Incurred Date</label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>
            )}

            {formData.requestType === 'Discount' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Client / Account Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g. Enterprise Global Corp"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Requested Discount %</label>
                  <input
                    type="text"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    placeholder="e.g. 20%"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Description & Justification */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Detailed Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detail the exact specifications, items, dates, and purpose..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Business Justification / ROI
              </label>
              <textarea
                rows={2}
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                placeholder="Explain why this request is required for team or business objectives..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Card 3: Supporting Documents Dropzone */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Supporting Documents & Quotations
              </h3>
              <span className="text-[11px] text-slate-400">PDF, Invoices, Contracts</span>
            </div>

            {/* Add Document input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Enter filename (e.g. Vendor_Quotation_AUG.pdf)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={handleAddDocument}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Attach File</span>
              </button>
            </div>

            {/* Attached List */}
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">{doc.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              {loading ? 'Routing Request...' : 'Submit Request for Approval'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Right Col: Live Predicted Approval Workflow Preview */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          <div className="bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 p-6 rounded-3xl border border-indigo-800/50 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Rule Engine Live Prediction
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-white mb-1">
              Dynamic Approval Pipeline
            </h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed mb-5">
              Based on {formData.requestType} request for {formatCurrency(formData.amount, formData.currency)} in {formData.department}.
            </p>

            {/* Matched Workflow Badge */}
            {predictedPath && (
              <div className="p-3 bg-indigo-950/80 rounded-2xl border border-indigo-700/50 mb-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400">Matched Policy</span>
                  <p className="text-xs font-bold text-white">{predictedPath.matchedWorkflowName}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {predictedPath.steps?.length || 0} Stages
                </span>
              </div>
            )}

            {/* Sequential Steps Stepper */}
            <div className="space-y-4 relative">
              {predictedPath?.steps?.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-3.5 group">
                  {/* Step number badge */}
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 border border-indigo-400/50 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
                    {idx + 1}
                  </div>

                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                        {getRoleLabel(step.role)}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {step.slaHours}h SLA
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-0.5">{step.title}</h4>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-800/60 flex items-center justify-between text-xs text-indigo-200">
              <span>Estimated Turnaround:</span>
              <strong className="text-white font-bold">{predictedPath?.slaTotalHours || 24} hours max SLA</strong>
            </div>
          </div>

          {/* SLA Matrix Explainer Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Enterprise SLA Compliance Matrix</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-red-600">Critical Priority</span>
                <span>4 Hours (Immediate Escalate)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-amber-600">High Priority</span>
                <span>24 Hours</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-blue-600">Medium Priority</span>
                <span>48 Hours</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-slate-600">Low Priority</span>
                <span>72 Hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
