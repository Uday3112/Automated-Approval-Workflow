import React, { useState } from 'react';
import { Layers, ShieldCheck, ArrowRight, Lock, Mail, CheckCircle2, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleLabel, getRoleBadgeStyle } from '../utils/formatters';

export default function LoginPage({ onLoginSuccess }) {
  const { availableUsers, login, switchUser } = useAuth();
  const [email, setEmail] = useState('alex.johnson@acmecorp.com');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user) => {
    switchUser(user);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden z-10">
        {/* Left Col: Brand & Visual */}
        <div className="lg:col-span-5 p-8 lg:p-10 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">WorkflowIQ</h1>
                <p className="text-xs text-indigo-300 font-medium">Enterprise Approval Automation</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white leading-tight">
                Streamline and orchestrate multi-tiered approval workflows.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamic routing by amount, department, and priority. Integrated SLA countdowns, auto-escalation, and end-to-end audit compliance.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-Level Approval Chains</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time SLA & Escalation Engine</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Visual Drag-and-Configure Builder</span>
            </div>
          </div>
        </div>

        {/* Right Col: Login Form & Role Persona Picker */}
        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">Sign In to Platform</h3>
            <p className="text-xs text-slate-400 mt-1">Select a demo persona or sign in with your credentials.</p>
          </div>

          {/* Quick Persona Selectors */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-Click Persona Login</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-950/60 border border-slate-700/60 hover:border-indigo-500 text-left transition-all group"
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-600 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate group-hover:text-indigo-300">{u.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400 truncate">{getRoleLabel(u.role)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-3 text-slate-500 font-semibold text-[10px]">Or standard email login</span></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  placeholder="name@acmecorp.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/30 w-3.5 h-3.5"
                />
                <span>Remember this device</span>
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Demo Mode: Click any 1-Click persona above to log in instantly."); }} className="text-indigo-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
