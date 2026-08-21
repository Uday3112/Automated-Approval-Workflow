import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateRequestPage from './pages/CreateRequestPage';
import MyRequestsPage from './pages/MyRequestsPage';
import ApprovalInboxPage from './pages/ApprovalInboxPage';
import RequestDetailsPage from './pages/RequestDetailsPage';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import { Menu } from 'lucide-react';

export default function App() {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Sync pending approval count for current user
  useEffect(() => {
    async function syncPendingCount() {
      if (!currentUser) return;
      try {
        const res = await api.getRequests({ scope: 'pending_approval' });
        if (res.success && res.requests) {
          setPendingCount(res.requests.length);
        }
      } catch (err) {
        console.error('Failed to sync pending count:', err);
      }
    }
    syncPendingCount();
    const interval = setInterval(syncPendingCount, 15000);
    return () => clearInterval(interval);
  }, [currentUser, activeTab]);

  const handleSelectRequest = (reqId) => {
    setSelectedRequestId(reqId);
    setActiveTab('request-details');
  };

  const handleBackToRequests = () => {
    setSelectedRequestId(null);
    setActiveTab('my-requests');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-spin flex items-center justify-center shadow-lg shadow-indigo-600/40">
          <div className="w-4 h-4 bg-white rounded-full" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
          Loading Enterprise Portal...
        </p>
      </div>
    );
  }

  // If no current user, show Login Page
  if (!currentUser) {
    return (
      <>
        <LoginPage onLoginSuccess={() => setActiveTab('dashboard')} />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Enterprise Navbar */}
      <Navbar
        onSelectRequest={handleSelectRequest}
      />

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'request-details') setSelectedRequestId(null);
          }}
          pendingCount={pendingCount}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {/* Mobile Menu Trigger button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 text-xs font-bold shadow-xs"
            >
              <Menu className="w-4 h-4" />
              <span>Navigation Menu</span>
            </button>
          </div>

          {/* Page Routing Switch */}
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab) => {
                setActiveTab(tab);
                setSelectedRequestId(null);
              }}
              onSelectRequest={handleSelectRequest}
            />
          )}

          {activeTab === 'create' && (
            <CreateRequestPage
              onNavigate={setActiveTab}
              onSelectRequest={handleSelectRequest}
            />
          )}

          {activeTab === 'my-requests' && (
            <MyRequestsPage
              onNavigate={setActiveTab}
              onSelectRequest={handleSelectRequest}
            />
          )}

          {activeTab === 'inbox' && (
            <ApprovalInboxPage
              onNavigate={setActiveTab}
              onSelectRequest={handleSelectRequest}
            />
          )}

          {activeTab === 'request-details' && (
            <RequestDetailsPage
              requestId={selectedRequestId}
              onBack={handleBackToRequests}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'workflows' && (
            <WorkflowBuilderPage />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage />
          )}

          {activeTab === 'users' && (
            <UsersPage />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
}
