import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Clock, 
  ShieldAlert, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Building2, 
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

export default function SettingsPage() {
  const { showToast } = useNotifications();
  const [settings, setSettings] = useState({
    slaCriticalHours: 4,
    slaHighHours: 24,
    slaMediumHours: 48,
    slaLowHours: 72,
    currency: 'INR',
    companyName: 'Acme Enterprise Corp',
    enableAutoEscalation: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await api.getSettings();
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        showToast('System settings and SLA matrix updated!', 'success');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Are you sure you want to reset all requests, workflows, and notifications to initial enterprise demo state?')) return;

    try {
      const res = await api.resetDemoData();
      if (res.success) {
        showToast('All database records reset to fresh demo seed.', 'info', 'Database Reset');
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              System Configuration
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">Global Parameters</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            System & SLA Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure global SLA response limits, auto-escalation triggers, default currency, and test data management.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SLA Policy Matrix Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                SLA Turnaround Deadlines
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Maximum hours granted to approvers before the request triggers auto-escalation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
              <label className="block font-bold text-red-700 dark:text-red-300 mb-1">Critical Priority SLA</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={settings.slaCriticalHours}
                  onChange={(e) => setSettings({ ...settings, slaCriticalHours: Number(e.target.value) })}
                  className="w-20 px-3 py-2 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 font-black text-center text-sm"
                />
                <span className="font-semibold text-slate-600 dark:text-slate-300">Hours</span>
              </div>
              <p className="text-[10px] text-red-600/80 dark:text-red-400/80 mt-1">Default 4h emergency override</p>
            </div>

            <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
              <label className="block font-bold text-amber-700 dark:text-amber-300 mb-1">High Priority SLA</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={settings.slaHighHours}
                  onChange={(e) => setSettings({ ...settings, slaHighHours: Number(e.target.value) })}
                  className="w-20 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 font-black text-center text-sm"
                />
                <span className="font-semibold text-slate-600 dark:text-slate-300">Hours</span>
              </div>
              <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1">Default 24h standard priority</p>
            </div>

            <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
              <label className="block font-bold text-blue-700 dark:text-blue-300 mb-1">Medium Priority SLA</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={settings.slaMediumHours}
                  onChange={(e) => setSettings({ ...settings, slaMediumHours: Number(e.target.value) })}
                  className="w-20 px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 font-black text-center text-sm"
                />
                <span className="font-semibold text-slate-600 dark:text-slate-300">Hours</span>
              </div>
              <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 mt-1">Default 48h routine approvals</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Low Priority SLA</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={settings.slaLowHours}
                  onChange={(e) => setSettings({ ...settings, slaLowHours: Number(e.target.value) })}
                  className="w-20 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-center text-sm"
                />
                <span className="font-semibold text-slate-600 dark:text-slate-300">Hours</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Default 72h low urgency</p>
            </div>
          </div>
        </div>

        {/* Escalation & Currency Parameters */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Escalation & Localization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Company Display Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Default Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAutoEscalation}
                onChange={(e) => setSettings({ ...settings, enableAutoEscalation: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Enable Automatic SLA Escalation</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  When enabled, background watchdog automatically flags delayed requests and notifies higher authorities upon SLA deadline expiration.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions Card */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="px-4 py-2.5 rounded-2xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Database</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
