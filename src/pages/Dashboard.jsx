import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  FileText,
  CheckSquare,
  ChevronRight,
  Percent,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CalendarOff
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 font-mono">
        Loading system session...
      </div>
    );
  }

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-12 font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 pb-6 border-b border-white/5">

        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Hello, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-sm text-slate-400">
            {dateFormatted} • Active Shift: 09:30 AM - 06:30 PM
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-900/70 border border-white/5 text-xs font-mono text-slate-300 shadow-sm">
          SYSTEM VERSION: <span className="text-brand-primary font-bold">1.0.0-PROD</span>
        </div>

      </div>

      {/* ADMIN DASHBOARD */}
      {user?.role === 'ADMIN' && (
        <div className="space-y-10">

          {/* KPI GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="glass-panel p-6 rounded-2xl hover:scale-[1.01] transition-transform border border-white/5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-mono">Active Headcount</p>
                <Users className="h-5 w-5 text-brand-primary" />
              </div>
              <p className="text-3xl font-extrabold text-white mt-4">124</p>
              <p className="text-xs text-brand-accent mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +4 onboarded this week
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl hover:scale-[1.01] transition-transform border border-white/5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-mono">Late Logins</p>
                <Clock className="h-5 w-5 text-brand-accent" />
              </div>
              <p className="text-3xl font-extrabold text-white mt-4">3</p>
              <p className="text-xs text-slate-400 mt-2">97.5% punctuality index</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl hover:scale-[1.01] transition-transform border border-white/5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-mono">NCNS Alerts</p>
                <AlertTriangle className="h-5 w-5 text-brand-warning" />
              </div>
              <p className="text-3xl font-extrabold text-white mt-4">0</p>
              <p className="text-xs text-slate-400 mt-2">All accounts verified</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl hover:scale-[1.01] transition-transform border border-white/5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-mono">Pending Appraisals</p>
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-3xl font-extrabold text-white mt-4">12</p>
              <p className="text-xs text-purple-400 mt-2">Calibration in progress</p>
            </div>

          </div>

          {/* CONFIG + AUDIT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-5">

              <h3 className="text-lg font-bold text-white tracking-tight">
                HRMS Configuration
              </h3>

              <div className="space-y-4">

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between hover:border-white/10 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Shift Rules Matrix (v1)</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Grace: 15m • Late Limit: 50m • Allowance: 3 Days
                    </p>
                  </div>
                  <button onClick={() => navigate('/settings')} className="text-xs text-brand-primary font-semibold hover:underline">
                    Edit
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between hover:border-white/10 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Holiday Calendar 2026</p>
                    <p className="text-xs text-slate-400 mt-1">10 official holidays configured</p>
                  </div>
                  <button onClick={() => navigate('/leaves')} className="text-xs text-brand-primary font-semibold hover:underline">
                    View
                  </button>
                </div>

              </div>

            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white">Audit Feed</h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-brand-primary"></span>
                  <span className="text-slate-300">Policy updated successfully</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-brand-accent"></span>
                  <span className="text-slate-300">2FA enabled across system</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MANAGER / TL */}
      {(user?.role === 'MANAGER' || user?.role === 'TL') && (
        <div className="space-y-10">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="glass-panel p-6 rounded-2xl">
              <p className="text-xs uppercase text-slate-400 font-mono">Attendance</p>
              <p className="text-3xl font-extrabold text-white mt-3">18 / 20</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <p className="text-xs uppercase text-slate-400 font-mono">Leaves Pending</p>
              <p className="text-3xl font-extrabold text-white mt-3">2</p>
              <button onClick={() => navigate('/leaves')} className="text-xs text-brand-primary mt-2 flex items-center gap-1 hover:underline">
                Open Queue <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <p className="text-xs uppercase text-slate-400 font-mono">Appraisals</p>
              <p className="text-3xl font-extrabold text-white mt-3">3</p>
              <button onClick={() => navigate('/appraisals')} className="text-xs text-brand-primary mt-2 flex items-center gap-1 hover:underline">
                Review <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* EMPLOYEE */}
      {user?.role === 'EMPLOYEE' && (
        <div className="space-y-10">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div className="glass-panel p-6 rounded-2xl">
              <p className="text-xs text-slate-400 uppercase font-mono">CL</p>
              <p className="text-3xl font-extrabold text-white mt-2">{user.clBalance}</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <p className="text-xs text-slate-400 uppercase font-mono">EL</p>
              <p className="text-3xl font-extrabold text-white mt-2">{user.elBalance}</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <p className="text-xs text-slate-400 uppercase font-mono">SL</p>
              <p className="text-3xl font-extrabold text-white mt-2">{user.slBalance}</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <p className="text-xs text-slate-400 uppercase font-mono">Comp Off</p>
              <p className="text-3xl font-extrabold text-white mt-2">{user.compOffBalance}</p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};