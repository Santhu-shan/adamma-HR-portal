import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Briefcase, Plus, Users, Clock, CheckCircle, XCircle, ChevronDown, MapPin, Building, Search, Eye } from 'lucide-react';

const mockJobs = [
  { id: 'JOB-001', title: 'BGV Analyst', department: 'Verification', location: 'Bangalore', type: 'FULL_TIME', status: 'OPEN', openings: 3, applications: 12, posted: '2026-06-01', deadline: '2026-07-15', jd: 'Conduct background verification checks including employment, education, and criminal records for client organizations.' },
  { id: 'JOB-002', title: 'Senior Data Analyst', department: 'Operations', location: 'Chennai', type: 'FULL_TIME', status: 'OPEN', openings: 1, applications: 8, posted: '2026-06-10', deadline: '2026-07-20', jd: 'Analyse verification data pipelines, create MIS reports, and maintain quality metrics for the ops team.' },
  { id: 'JOB-003', title: 'HR Executive', department: 'Human Resources', location: 'Bangalore', type: 'FULL_TIME', status: 'ON_HOLD', openings: 1, applications: 5, posted: '2026-05-20', deadline: '2026-07-01', jd: 'Handle employee lifecycle, onboarding, HRMS management, and statutory compliance activities.' },
  { id: 'JOB-004', title: 'Client Relations Specialist', department: 'Client Relations', location: 'Delhi', type: 'FULL_TIME', status: 'CLOSED', openings: 2, applications: 19, posted: '2026-04-01', deadline: '2026-05-30', jd: 'Manage client accounts, SLA adherence, and coordinate between BGV ops and client stakeholders.' },
];

const mockApplicants = {
  'JOB-001': [
    { id: 'APP-001', name: 'Meera Nair', email: 'meera.n@gmail.com', stage: 'SCREENING', applied: '2026-06-05', exp: '2 yrs' },
    { id: 'APP-002', name: 'Aditya Bose', email: 'aditya.b@gmail.com', stage: 'INTERVIEW_L1', applied: '2026-06-07', exp: '3 yrs' },
    { id: 'APP-003', name: 'Shivani Rao', email: 'shivani.r@gmail.com', stage: 'OFFER_EXTENDED', applied: '2026-06-08', exp: '4 yrs' },
  ],
  'JOB-002': [
    { id: 'APP-004', name: 'Vikram Singh', email: 'vikram.s@gmail.com', stage: 'SCREENING', applied: '2026-06-12', exp: '5 yrs' },
    { id: 'APP-005', name: 'Nithya Kumar', email: 'nithya.k@gmail.com', stage: 'INTERVIEW_L2', applied: '2026-06-13', exp: '6 yrs' },
  ],
};

const stageColors = { SCREENING: 'text-slate-400 bg-slate-800 border-white/10', INTERVIEW_L1: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', INTERVIEW_L2: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20', OFFER_EXTENDED: 'text-purple-400 bg-purple-400/10 border-purple-400/20', HIRED: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20', REJECTED: 'text-brand-danger bg-brand-danger/10 border-brand-danger/20' };
const statusColors = { OPEN: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20', ON_HOLD: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', CLOSED: 'text-slate-500 bg-slate-800 border-white/5' };
const stages = ['SCREENING', 'INTERVIEW_L1', 'INTERVIEW_L2', 'OFFER_EXTENDED', 'HIRED', 'REJECTED'];

export const Recruitment = () => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState(mockJobs);
  const [applicants, setApplicants] = useState(mockApplicants);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', department: 'Operations', location: '', type: 'FULL_TIME', openings: 1, deadline: '', jd: '' });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const handlePostJob = () => {
    if (!form.title || !form.location || !form.deadline) return;
    const job = { id: `JOB-00${jobs.length + 1}`, ...form, status: 'OPEN', applications: 0, posted: new Date().toISOString().split('T')[0] };
    setJobs([job, ...jobs]);
    setForm({ title: '', department: 'Operations', location: '', type: 'FULL_TIME', openings: 1, deadline: '', jd: '' });
    setShowForm(false);
  };

  const updateStage = (jobId, appId, stage) => {
    setApplicants(prev => ({ ...prev, [jobId]: (prev[jobId] || []).map(a => a.id === appId ? { ...a, stage } : a) }));
  };

  const filtered = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3"><Briefcase className="h-7 w-7 text-brand-primary" />Recruitment Pipeline</h1>
          <p className="text-sm text-slate-400 mt-1">Track open positions, applicant pipeline, and hiring workflow.</p>
        </div>
        {isAdmin && <button onClick={() => setShowForm(true)} className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-500 text-white font-bold text-xs tracking-wider flex items-center gap-2 hover:shadow-brand-primary/20 hover:shadow-lg transition-all"><Plus className="h-4 w-4" />Post Opening</button>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-white/5 flex justify-between sticky top-0 bg-slate-900">
              <h3 className="font-bold text-white">New Job Opening</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white text-xs px-2 py-1 rounded border border-white/10">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {[['Job Title', 'title', 'text', 'e.g. BGV Analyst'], ['Location', 'location', 'text', 'e.g. Bangalore']].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-primary/50" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5">Department</label>
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono">
                    {['Operations', 'Verification', 'Human Resources', 'Client Relations', 'Quality', 'IT'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5">No. of Openings</label>
                  <input type="number" min="1" value={form.openings} onChange={e => setForm({ ...form, openings: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-primary/50" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5">Application Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-primary/50" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5">Job Description</label>
                <textarea rows={4} value={form.jd} onChange={e => setForm({ ...form, jd: e.target.value })} placeholder="Describe the role, responsibilities, and requirements..." className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 resize-none focus:outline-none focus:border-brand-primary/50" />
              </div>
              <button onClick={handlePostJob} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-blue-500 text-white font-bold text-xs">Post Job Opening</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['Total Openings', jobs.filter(j => j.status === 'OPEN').length, 'text-brand-primary'], ['Total Applications', jobs.reduce((s, j) => s + j.applications, 0), 'text-brand-accent'], ['On Hold', jobs.filter(j => j.status === 'ON_HOLD').length, 'text-yellow-400'], ['Closed Roles', jobs.filter(j => j.status === 'CLOSED').length, 'text-slate-400']].map(([label, val, col]) => (
          <div key={label} className="glass-panel p-5 rounded-2xl border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">{label}</p>
            <p className={`text-3xl font-extrabold mt-2 ${col}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs by title or department..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-primary/50" />
      </div>

      <div className="space-y-4">
        {filtered.map(job => {
          const isSelected = selectedJob === job.id;
          const jobApplicants = applicants[job.id] || [];
          return (
            <div key={job.id} className="glass-panel rounded-2xl overflow-hidden border border-white/5">
              <div className="p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 shrink-0"><Briefcase className="h-5 w-5 text-brand-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Building className="h-3 w-3" />{job.department}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Posted {job.posted}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Deadline {job.deadline}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-slate-400">{job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                      <span className="text-xs text-slate-400">{job.applications} applied</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${statusColors[job.status]}`}>{job.status}</span>
                      {isAdmin && <button onClick={() => setSelectedJob(isSelected ? null : job.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"><Eye className="h-3.5 w-3.5" />Applicants <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isSelected ? 'rotate-180' : ''}`} /></button>}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{job.jd}</p>
                </div>
              </div>

              {isSelected && isAdmin && (
                <div className="border-t border-white/5 p-5">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">Applicant Pipeline — {jobApplicants.length} candidates</p>
                  {jobApplicants.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-6">No applications received yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {jobApplicants.map(app => (
                        <div key={app.id} className="flex items-center gap-4 px-4 py-3 bg-slate-950/40 rounded-xl border border-white/5">
                          <div className="h-8 w-8 rounded-lg bg-brand-primary/20 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">{app.name[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white">{app.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{app.email} · {app.exp} exp · Applied {app.applied}</p>
                          </div>
                          <select value={app.stage} onChange={e => updateStage(job.id, app.id, e.target.value)} className={`text-[10px] px-2 py-1 rounded-lg border font-bold bg-transparent font-mono cursor-pointer ${stageColors[app.stage]}`}>
                            {stages.map(s => <option key={s} className="bg-slate-900 text-slate-200">{s}</option>)}
                          </select>
                        </div>
                      ))}
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
