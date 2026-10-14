import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LogOut, AlertTriangle, CheckCircle, Clock, FileText, ChevronRight, Download, Shield } from 'lucide-react';

const exitSteps = [
  { id: 1, title: 'Resignation Submission', desc: 'Employee submits formal resignation letter with last working day.', role: 'EMPLOYEE' },
  { id: 2, title: 'TL Acknowledgement', desc: 'Team lead acknowledges and initiates knowledge transfer plan.', role: 'TL' },
  { id: 3, title: 'Manager Approval', desc: 'Manager reviews, accepts, and files exit notice.', role: 'MANAGER' },
  { id: 4, title: 'Knowledge Transfer', desc: 'Employee completes KT tasks and handover checklist.', role: 'EMPLOYEE' },
  { id: 5, title: 'Asset Recovery', desc: 'IT team collects all company assets and revokes system access.', role: 'IT' },
  { id: 6, title: 'F&F Settlement', desc: 'HR processes full and final settlement within 45 days.', role: 'HR' },
  { id: 7, title: 'Experience Letter Issuance', desc: 'HR issues experience and relieving letters.', role: 'HR' },
];

const ktChecklist = [
  'Document all active project processes',
  'Transfer client communication threads',
  'Update team wiki / knowledge base',
  'Handover pending BGV case files',
  'Revoke third-party tool access requests',
  'Return company laptop & accessories',
  'Return ID card & access badge',
  'Settle pending expense claims',
];

export const Resignation = () => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ktItems, setKtItems] = useState(Array(ktChecklist.length).fill(false));
  const [form, setForm] = useState({ lastDay: '', reason: '', type: 'VOLUNTARY', remarks: '' });
  const [confirm, setConfirm] = useState(false);

  const handleSubmit = () => {
    if (!form.lastDay || !form.reason) return;
    setSubmitted(true);
    setShowForm(false);
    setCurrentStep(2);
  };

  const toggleKT = (i) => {
    const copy = [...ktItems];
    copy[i] = !copy[i];
    setKtItems(copy);
  };

  const ktDone = ktItems.filter(Boolean).length;
  const noticeDays = form.lastDay ? Math.max(0, Math.ceil((new Date(form.lastDay) - new Date()) / 86400000)) : null;

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3"><LogOut className="h-7 w-7 text-brand-danger" />Resignation & Exit</h1>
          <p className="text-sm text-slate-400 mt-1">Manage offboarding workflow, knowledge transfer, and F&F settlements.</p>
        </div>
        {!submitted && user?.role === 'EMPLOYEE' && (
          <button onClick={() => setShowForm(true)} className="py-2.5 px-5 rounded-xl bg-brand-danger/10 border border-brand-danger/30 text-brand-danger font-bold text-xs tracking-wider flex items-center gap-2 hover:bg-brand-danger/20 transition-all">
            <LogOut className="h-4 w-4" />Submit Resignation
          </button>
        )}
      </div>

      {submitted && (
        <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-300">Resignation Under Processing</p>
            <p className="text-xs text-slate-400 mt-0.5">Last working day: <span className="font-mono text-white">{form.lastDay}</span> · Notice period: <span className="font-mono text-white">{noticeDays} days remaining</span></p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg">
            <div className="p-5 border-b border-white/5 flex justify-between">
              <div>
                <h3 className="font-bold text-white">Formal Resignation</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">This action initiates the official exit workflow.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white text-xs px-2 py-1 rounded border border-white/10">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5">Proposed Last Working Day</label>
                <input type="date" value={form.lastDay} onChange={e => setForm({ ...form, lastDay: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-primary/50" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5">Separation Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono">
                  {['VOLUNTARY', 'BETTER_OPPORTUNITY', 'HIGHER_EDUCATION', 'PERSONAL_REASON', 'HEALTH'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5">Reason</label>
                <textarea rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Briefly describe your reason for leaving..." className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 resize-none focus:outline-none focus:border-brand-primary/50" />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} className="mt-0.5 accent-brand-danger" />
                <span className="text-xs text-slate-400">I understand this resignation submission is formal and will initiate the exit workflow per Adamma Info Services HR policy.</span>
              </label>
              <button onClick={handleSubmit} disabled={!confirm || !form.lastDay || !form.reason} className="w-full py-3 rounded-xl bg-brand-danger/10 border border-brand-danger/30 text-brand-danger font-bold text-xs disabled:opacity-40 hover:bg-brand-danger/20 transition-colors">
                Submit Resignation Formally
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-white text-sm">Exit Workflow Pipeline</h3>
          {exitSteps.map((step, i) => {
            const done = step.id < currentStep;
            const active = step.id === currentStep;
            return (
              <div key={step.id} className={`glass-panel p-4 rounded-2xl border transition-all ${active ? 'border-brand-primary/30 shadow-lg shadow-brand-primary/5' : done ? 'opacity-60' : 'opacity-40'}`}>
                <div className="flex items-center gap-4">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${done ? 'bg-brand-accent/20 text-brand-accent' : active ? 'bg-brand-primary/20 text-brand-primary' : 'bg-slate-800 text-slate-600'}`}>
                    {done ? <CheckCircle className="h-5 w-5" /> : active ? <Clock className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{step.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-800 border border-white/5 px-2 py-0.5 rounded">{step.role}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-sm">KT Checklist</h3>
              <span className="text-xs font-mono text-brand-primary">{ktDone}/{ktChecklist.length}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4">
              <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${(ktDone / ktChecklist.length) * 100}%` }} />
            </div>
            <div className="space-y-2">
              {ktChecklist.map((item, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={ktItems[i]} onChange={() => toggleKT(i)} className="mt-0.5 accent-brand-accent" />
                  <span className={`text-xs transition-colors ${ktItems[i] ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="font-bold text-white text-sm">Exit Documents</h3>
            {[['Experience Letter', submitted], ['Relieving Letter', false], ['F&F Statement', false], ['NOC Certificate', false]].map(([doc, avail]) => (
              <div key={doc} className="flex justify-between items-center">
                <span className="text-xs text-slate-300">{doc}</span>
                {avail ? <button className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary"><Download className="h-3 w-3" /></button> : <span className="text-[10px] text-slate-600 font-mono">Pending</span>}
              </div>
            ))}
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <div className="flex gap-2 items-start">
              <Shield className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed">F&F settlement is processed within 45 working days from last working date per Indian labour law (Section 16, Payment of Wages Act).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
