import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { DollarSign, Download, ChevronDown, TrendingUp, Wallet, FileText, Printer, Eye } from 'lucide-react';

const mockPayslips = [
  { month: 'May 2026', gross: 68000, basic: 34000, hra: 13600, conveyance: 1600, special: 12800, pf: 4080, esi: 0, tds: 6200, professional: 200, net: 57520, status: 'PAID', paid_on: '2026-05-31' },
  { month: 'April 2026', gross: 68000, basic: 34000, hra: 13600, conveyance: 1600, special: 12800, pf: 4080, esi: 0, tds: 6200, professional: 200, net: 57520, status: 'PAID', paid_on: '2026-04-30' },
  { month: 'March 2026', gross: 68000, basic: 34000, hra: 13600, conveyance: 1600, special: 12800, pf: 4080, esi: 0, tds: 6200, professional: 200, net: 57520, status: 'PAID', paid_on: '2026-03-31' },
  { month: 'February 2026', gross: 65000, basic: 32500, hra: 13000, conveyance: 1600, special: 11900, pf: 3900, esi: 0, tds: 5800, professional: 200, net: 55100, status: 'PAID', paid_on: '2026-02-28' },
];

const SlipModal = ({ slip, user, onClose }) => {
  if (!slip) return null;
  const totalDeductions = slip.pf + slip.esi + slip.tds + slip.professional;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/5 flex justify-between items-start">
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Adamma Info Services Pvt. Ltd.</p>
            <h2 className="text-xl font-extrabold text-white mt-1">Salary Slip — {slip.month}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xs px-3 py-1 rounded-lg border border-white/10">✕ Close</button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Employee Name:</span><span className="text-white font-bold">{user?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Employee ID:</span><span className="text-white font-mono">{user?.employeeId || 'AIS-0042'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Designation:</span><span className="text-white">{user?.role}</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Department:</span><span className="text-white">{user?.department || 'Operations'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Bank Account:</span><span className="text-white font-mono">XXXX XXXX 4821</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Payment Date:</span><span className="text-white font-mono">{slip.paid_on}</span></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] text-brand-accent font-mono font-bold uppercase tracking-wider mb-3">Earnings</p>
              <div className="space-y-2 text-xs">
                {[['Basic Salary', slip.basic], ['HRA', slip.hra], ['Conveyance', slip.conveyance], ['Special Allowance', slip.special]].map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-slate-400">{k}</span><span className="text-white font-mono">₹{v.toLocaleString()}</span></div>
                ))}
                <div className="flex justify-between border-t border-white/5 pt-2 font-bold"><span className="text-white">Gross Total</span><span className="text-brand-accent font-mono">₹{slip.gross.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] text-brand-danger font-mono font-bold uppercase tracking-wider mb-3">Deductions</p>
              <div className="space-y-2 text-xs">
                {[['PF (12%)', slip.pf], ['ESI', slip.esi], ['TDS', slip.tds], ['Professional Tax', slip.professional]].map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-slate-400">{k}</span><span className="text-white font-mono">₹{v.toLocaleString()}</span></div>
                ))}
                <div className="flex justify-between border-t border-white/5 pt-2 font-bold"><span className="text-white">Total Deductions</span><span className="text-brand-danger font-mono">₹{totalDeductions.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-4 flex justify-between items-center">
            <span className="text-sm font-bold text-white">Net Take-Home Pay</span>
            <span className="text-2xl font-extrabold text-brand-primary font-mono">₹{slip.net.toLocaleString()}</span>
          </div>
          <p className="text-[9px] text-slate-600 text-center">This is a computer-generated payslip. No signature required. For queries contact payroll@adamma.in</p>
        </div>
      </div>
    </div>
  );
};

export const Payroll = () => {
  const { user } = useAuthStore();
  const [activeSlip, setActiveSlip] = useState(null);
  const [yearFilter, setYearFilter] = useState('2026');

  const ytdGross = mockPayslips.reduce((s, p) => s + p.gross, 0);
  const ytdNet = mockPayslips.reduce((s, p) => s + p.net, 0);
  const ytdTDS = mockPayslips.reduce((s, p) => s + p.tds, 0);
  const ytdPF = mockPayslips.reduce((s, p) => s + p.pf, 0);

  return (
    <div className="space-y-8 font-sans">
      {activeSlip && <SlipModal slip={activeSlip} user={user} onClose={() => setActiveSlip(null)} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3"><DollarSign className="h-7 w-7 text-brand-primary" />Payroll & Salary Slips</h1>
          <p className="text-sm text-slate-400 mt-1">View monthly payslips, YTD summaries, and tax deduction details.</p>
        </div>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="bg-slate-900 border border-white/10 text-white text-xs px-4 py-2 rounded-xl font-mono">
          <option>2026</option><option>2025</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['YTD Gross', `₹${ytdGross.toLocaleString()}`, TrendingUp, 'text-brand-accent'], ['YTD Net Pay', `₹${ytdNet.toLocaleString()}`, Wallet, 'text-brand-primary'], ['YTD TDS', `₹${ytdTDS.toLocaleString()}`, FileText, 'text-yellow-400'], ['YTD PF', `₹${ytdPF.toLocaleString()}`, DollarSign, 'text-purple-400']].map(([label, val, Icon, col]) => (
          <div key={label} className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">{label}</p>
              <Icon className={`h-4 w-4 ${col}`} />
            </div>
            <p className={`text-2xl font-extrabold mt-3 font-mono ${col}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand-primary" />
          <h3 className="font-bold text-white text-sm">Payslip Archive</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs font-mono">
                <th className="px-5 py-3">Month</th>
                <th className="px-5 py-3">Gross</th>
                <th className="px-5 py-3">Deductions</th>
                <th className="px-5 py-3">Net Pay</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockPayslips.map((slip, i) => (
                <tr key={i} className="text-slate-300 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-bold text-white">{slip.month}</td>
                  <td className="px-5 py-4 font-mono">₹{slip.gross.toLocaleString()}</td>
                  <td className="px-5 py-4 font-mono text-brand-danger">₹{(slip.pf + slip.esi + slip.tds + slip.professional).toLocaleString()}</td>
                  <td className="px-5 py-4 font-mono font-bold text-brand-accent">₹{slip.net.toLocaleString()}</td>
                  <td className="px-5 py-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-accent/10 border border-brand-accent/20 text-brand-accent">{slip.status}</span></td>
                  <td className="px-5 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => setActiveSlip(slip)} className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary/20 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                    <button className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"><Download className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
