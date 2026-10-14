import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle, AlertTriangle, XCircle, ChevronDown, Send, Tag } from 'lucide-react';

const mockTickets = [
  { id: 'TKT-1001', subject: 'Cannot access HRMS attendance module', category: 'IT_ACCESS', priority: 'HIGH', status: 'OPEN', created: '2026-06-20', updated: '2026-06-21', assignedTo: 'IT Support', comments: [{ by: 'System', text: 'Ticket received and queued for IT team review.', time: '2026-06-20 09:15' }] },
  { id: 'TKT-1002', subject: 'Payslip for April 2026 showing incorrect TDS', category: 'PAYROLL', priority: 'MEDIUM', status: 'IN_PROGRESS', created: '2026-06-18', updated: '2026-06-22', assignedTo: 'Payroll Team', comments: [{ by: 'Payroll Team', text: 'Under review. Will update within 2 business days.', time: '2026-06-19 11:30' }] },
  { id: 'TKT-1003', subject: 'Leave balance mismatch for CL', category: 'LEAVE', priority: 'LOW', status: 'RESOLVED', created: '2026-06-10', updated: '2026-06-12', assignedTo: 'HR', comments: [{ by: 'HR', text: 'Leave balance corrected. Please check and confirm.', time: '2026-06-12 15:00' }] },
];

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const categories = ['IT_ACCESS', 'PAYROLL', 'LEAVE', 'ATTENDANCE', 'GENERAL', 'POLICY', 'ASSETS'];
const statusConfig = {
  OPEN: { label: 'Open', cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', cls: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20', icon: MessageSquare },
  RESOLVED: { label: 'Resolved', cls: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20', icon: CheckCircle },
  CLOSED: { label: 'Closed', cls: 'text-slate-500 bg-slate-800 border-white/5', icon: XCircle },
};
const priorityColors = { LOW: 'text-slate-400', MEDIUM: 'text-yellow-400', HIGH: 'text-orange-400', CRITICAL: 'text-brand-danger' };

export const Helpdesk = () => {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState(mockTickets);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [form, setForm] = useState({ subject: '', category: 'GENERAL', priority: 'MEDIUM', description: '' });

  const handleSubmit = () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    const t = {
      id: `TKT-${1000 + tickets.length + 1}`,
      subject: form.subject,
      category: form.category,
      priority: form.priority,
      status: 'OPEN',
      created: new Date().toISOString().split('T')[0],
      updated: new Date().toISOString().split('T')[0],
      assignedTo: 'Support Team',
      comments: [{ by: 'You', text: form.description, time: new Date().toLocaleString() }],
    };
    setTickets([t, ...tickets]);
    setForm({ subject: '', category: 'GENERAL', priority: 'MEDIUM', description: '' });
    setShowForm(false);
  };

  const handleReply = (id) => {
    if (!replyText.trim()) return;
    setTickets(tickets.map(t => t.id === id ? { ...t, comments: [...t.comments, { by: user?.name || 'You', text: replyText, time: new Date().toLocaleString() }], updated: new Date().toISOString().split('T')[0] } : t));
    setReplyText('');
  };

  const filtered = tickets.filter(t => statusFilter === 'ALL' || t.status === statusFilter);

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3"><LifeBuoy className="h-7 w-7 text-brand-primary" />Helpdesk & Support</h1>
          <p className="text-sm text-slate-400 mt-1">Raise and track tickets for IT, HR, Payroll, and admin issues.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-500 text-white font-bold text-xs tracking-wider flex items-center gap-2 hover:shadow-brand-primary/20 hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />Raise Ticket
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-6 rounded-3xl border border-brand-primary/20">
          <h3 className="font-bold text-white mb-4 text-sm">New Support Ticket</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject / Issue Title" className="col-span-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-primary/50" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono">
              {priorities.map(p => <option key={p}>{p}</option>)}
            </select>
            <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your issue in detail..." className="col-span-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 resize-none focus:outline-none focus:border-brand-primary/50" />
            <div className="col-span-full flex gap-3">
              <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-500 text-white font-bold text-xs">Submit Ticket</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 font-bold text-xs hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors ${statusFilter === s ? 'bg-brand-primary border-brand-primary text-white' : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'}`}>{s.replace('_', ' ')}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 text-sm">No tickets found.</div>}
        {filtered.map(ticket => {
          const sc = statusConfig[ticket.status] || statusConfig.OPEN;
          const StatusIcon = sc.icon;
          const isOpen = expanded === ticket.id;
          return (
            <div key={ticket.id} className="glass-panel rounded-2xl overflow-hidden border border-white/5">
              <button onClick={() => setExpanded(isOpen ? null : ticket.id)} className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <StatusIcon className={`h-4 w-4 shrink-0 ${sc.cls.split(' ')[0]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 flex-wrap">
                    <span className="font-mono text-[10px] text-slate-500 shrink-0">{ticket.id}</span>
                    <p className="text-sm font-semibold text-white truncate">{ticket.subject}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-500">{ticket.category}</span>
                    <span className={`text-[10px] font-bold ${priorityColors[ticket.priority]}`}>● {ticket.priority}</span>
                    <span className="text-[10px] text-slate-600">Updated {ticket.updated}</span>
                    <span className="text-[10px] text-slate-500">→ {ticket.assignedTo}</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold shrink-0 ${sc.cls}`}>{sc.label}</span>
                <ChevronDown className={`h-4 w-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="border-t border-white/5 p-5 space-y-4">
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {ticket.comments.map((c, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-7 w-7 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">{c.by[0]}</div>
                        <div className="flex-1 bg-slate-950/60 rounded-xl p-3">
                          <div className="flex justify-between mb-1"><span className="text-[10px] font-bold text-white">{c.by}</span><span className="text-[9px] text-slate-600 font-mono">{c.time}</span></div>
                          <p className="text-xs text-slate-300">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                    <div className="flex gap-3">
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Add a comment..." className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-primary/50" onKeyDown={e => e.key === 'Enter' && handleReply(ticket.id)} />
                      <button onClick={() => handleReply(ticket.id)} className="px-4 py-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"><Send className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
