import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { BarChart2, Download, Filter, Calendar, TrendingUp, TrendingDown, Users, Clock, CalendarOff, FileText, RefreshCw } from 'lucide-react';

const attendanceTrend = [
  { month: 'Jan', present: 92, late: 4, absent: 2, leave: 2 },
  { month: 'Feb', present: 89, late: 6, absent: 3, leave: 2 },
  { month: 'Mar', present: 94, late: 3, absent: 1, leave: 2 },
  { month: 'Apr', present: 91, late: 5, absent: 2, leave: 2 },
  { month: 'May', present: 96, late: 2, absent: 1, leave: 1 },
  { month: 'Jun', present: 93, late: 4, absent: 1, leave: 2 },
];

const deptLeaveData = [
  { dept: 'Verification', cl: 24, el: 18, sl: 9, lop: 2 },
  { dept: 'Operations', cl: 18, el: 22, sl: 7, lop: 1 },
  { dept: 'Human Resources', cl: 8, el: 12, sl: 3, lop: 0 },
  { dept: 'Client Relations', cl: 10, el: 8, sl: 5, lop: 0 },
  { dept: 'Quality', cl: 6, el: 9, sl: 2, lop: 0 },
];

const headcountData = [
  { month: 'Jan 26', total: 112, joined: 6, left: 2 },
  { month: 'Feb 26', total: 116, joined: 5, left: 1 },
  { month: 'Mar 26', total: 120, joined: 6, left: 2 },
  { month: 'Apr 26', total: 122, joined: 4, left: 2 },
  { month: 'May 26', total: 124, joined: 3, left: 1 },
  { month: 'Jun 26', total: 124, joined: 2, left: 2 },
];

const miniBar = (value, max, color) => (
  <div className="w-full h-1.5 bg-slate-800 rounded-full">
    <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
  </div>
);

export const Reports = () => {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState('MONTHLY');
  const [month, setMonth] = useState('2026-06');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1200);
  };

  const maxPresent = Math.max(...attendanceTrend.map(r => r.present));

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3"><BarChart2 className="h-7 w-7 text-brand-primary" />Reports & Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">HR intelligence: attendance trends, leave analytics, and headcount metrics.</p>
        </div>
        <div className="flex gap-3">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="bg-slate-900 border border-white/10 text-white text-xs px-3 py-2 rounded-xl font-mono focus:outline-none focus:border-brand-primary/50" />
          <div className="flex gap-1 bg-slate-900 border border-white/10 rounded-xl p-1">
            {['MONTHLY', 'QUARTERLY', 'YEARLY'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${period === p ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['Avg Attendance', '93.2%', TrendingUp, 'text-brand-accent', '+1.4% vs last month'], ['Late Logins', '3.8%', Clock, 'text-yellow-400', '-0.6% improvement'], ['Leave Utilization', '8.1%', CalendarOff, 'text-brand-primary', 'Within 10% policy limit'], ['Attrition Rate', '1.6%', TrendingDown, 'text-brand-danger', '2 exits this month']].map(([label, val, Icon, col, sub]) => (
          <div key={label} className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">{label}</p>
              <Icon className={`h-4 w-4 ${col}`} />
            </div>
            <p className={`text-2xl font-extrabold mt-3 font-mono ${col}`}>{val}</p>
            <p className="text-[10px] text-slate-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-brand-primary" /><h3 className="font-bold text-white text-sm">Attendance Trend (2026)</h3></div>
            <div className="flex gap-3 text-[9px] font-mono">
              {[['Present', 'bg-brand-accent'], ['Late', 'bg-yellow-400'], ['Absent', 'bg-brand-danger']].map(([l, c]) => (
                <span key={l} className="flex items-center gap-1 text-slate-400"><span className={`h-2 w-2 rounded-full ${c}`} />{l}</span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {attendanceTrend.map(row => (
              <div key={row.month} className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500 font-mono w-6 shrink-0">{row.month}</span>
                <div className="flex-1 flex gap-1 h-5 rounded-lg overflow-hidden">
                  <div className="bg-brand-accent/70 flex items-center justify-center text-[8px] text-white font-bold" style={{ width: `${row.present}%` }}>{row.present > 20 ? `${row.present}%` : ''}</div>
                  <div className="bg-yellow-400/70" style={{ width: `${row.late}%` }} />
                  <div className="bg-brand-danger/70" style={{ width: `${row.absent}%` }} />
                  <div className="bg-brand-primary/50" style={{ width: `${row.leave}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-5"><Users className="h-4 w-4 text-brand-primary" /><h3 className="font-bold text-white text-sm">Headcount Movement</h3></div>
          <div className="space-y-3">
            {headcountData.map(row => (
              <div key={row.month} className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-slate-500 font-mono w-14 shrink-0">{row.month}</span>
                <div className="flex-1">{miniBar(row.total, 130, 'bg-brand-primary/60')}</div>
                <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
                  <span className="text-brand-accent">+{row.joined}</span>
                  <span className="text-brand-danger">-{row.left}</span>
                  <span className="text-white font-bold w-6 text-right">{row.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center gap-2 mb-5"><CalendarOff className="h-4 w-4 text-brand-primary" /><h3 className="font-bold text-white text-sm">Leave Utilization by Department (YTD)</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-[10px] font-mono">
                <th className="pb-3 pr-6">Department</th>
                <th className="pb-3 pr-4">CL Used</th>
                <th className="pb-3 pr-4">EL Used</th>
                <th className="pb-3 pr-4">SL Used</th>
                <th className="pb-3 pr-4">LOP</th>
                <th className="pb-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {deptLeaveData.map(row => {
                const total = row.cl + row.el + row.sl + row.lop;
                return (
                  <tr key={row.dept} className="text-slate-300">
                    <td className="py-3 pr-6 font-semibold text-sm text-white">{row.dept}</td>
                    <td className="py-3 pr-4"><span className="font-mono text-xs">{row.cl}</span></td>
                    <td className="py-3 pr-4"><span className="font-mono text-xs">{row.el}</span></td>
                    <td className="py-3 pr-4"><span className="font-mono text-xs">{row.sl}</span></td>
                    <td className="py-3 pr-4"><span className={`font-mono text-xs ${row.lop > 0 ? 'text-brand-danger' : 'text-slate-600'}`}>{row.lop}</span></td>
                    <td className="py-3"><span className="font-mono text-xs font-bold text-white">{total}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center gap-2 mb-5"><FileText className="h-4 w-4 text-brand-primary" /><h3 className="font-bold text-white text-sm">Export Reports</h3></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[['Monthly Attendance Report', 'Attendance data with late/absent breakdown', 'XLSX'], ['Leave Balance Summary', 'All employees leave balances and utilization', 'PDF'], ['Payroll MIS', 'Gross, net, and deduction summary', 'XLSX'], ['Headcount Report', 'Joining, exit, and total headcount', 'PDF'], ['Appraisal Summary', 'Calibration scores and recommendations', 'PDF'], ['Training Completion Report', 'Course completion rates by department', 'XLSX']].map(([title, desc, format]) => (
            <div key={title} className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xs font-bold text-white pr-3">{title}</h4>
                <span className="text-[9px] font-mono text-slate-500 bg-slate-800 border border-white/5 px-1.5 py-0.5 rounded shrink-0">{format}</span>
              </div>
              <p className="text-[10px] text-slate-500 mb-3">{desc}</p>
              <button onClick={handleGenerate} className="w-full py-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold text-[10px] hover:bg-brand-primary/20 transition-colors flex items-center justify-center gap-1.5">
                {generating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                {generating ? 'Generating...' : 'Export'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
