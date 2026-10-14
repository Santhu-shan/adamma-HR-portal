import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { Users, Search, Phone, Mail, MapPin, ChevronRight, Shield, User, Filter } from 'lucide-react';

const mockEmployees = [
  { id: 'AIS-001', name: 'Ravi Shankar', role: 'ADMIN', designation: 'HR Manager', department: 'Human Resources', email: 'ravi.s@adamma.in', phone: '+91 98400 11001', location: 'Chennai', status: 'ACTIVE', avatar: 'RS', joined: '2020-01-15' },
  { id: 'AIS-002', name: 'Divya Menon', role: 'MANAGER', designation: 'Ops Manager', department: 'Operations', email: 'divya.m@adamma.in', phone: '+91 98400 11002', location: 'Bangalore', status: 'ACTIVE', avatar: 'DM', joined: '2021-03-10' },
  { id: 'AIS-003', name: 'Arjun Reddy', role: 'TL', designation: 'Team Lead', department: 'Verification', email: 'arjun.r@adamma.in', phone: '+91 98400 11003', location: 'Hyderabad', status: 'ACTIVE', avatar: 'AR', joined: '2022-06-01' },
  { id: 'AIS-004', name: 'Priya Patel', role: 'EMPLOYEE', designation: 'BV Analyst', department: 'Verification', email: 'priya.p@adamma.in', phone: '+91 98400 11004', location: 'Bangalore', status: 'ACTIVE', avatar: 'PP', joined: '2023-02-20' },
  { id: 'AIS-005', name: 'Rahul Kumar', role: 'EMPLOYEE', designation: 'BV Analyst', department: 'Verification', email: 'rahul.k@adamma.in', phone: '+91 98400 11005', location: 'Mumbai', status: 'ACTIVE', avatar: 'RK', joined: '2023-04-15' },
  { id: 'AIS-006', name: 'Sneha Iyer', role: 'EMPLOYEE', designation: 'Data Entry', department: 'Operations', email: 'sneha.i@adamma.in', phone: '+91 98400 11006', location: 'Chennai', status: 'ACTIVE', avatar: 'SI', joined: '2024-01-08' },
  { id: 'AIS-007', name: 'Karan Malhotra', role: 'TL', designation: 'Team Lead', department: 'Client Relations', email: 'karan.m@adamma.in', phone: '+91 98400 11007', location: 'Delhi', status: 'PROBATION', avatar: 'KM', joined: '2025-11-01' },
  { id: 'AIS-008', name: 'Ananya Sharma', role: 'EMPLOYEE', designation: 'QA Analyst', department: 'Quality', email: 'ananya.s@adamma.in', phone: '+91 98400 11008', location: 'Pune', status: 'ACTIVE', avatar: 'AS', joined: '2023-09-12' },
];

const roleColors = { ADMIN: 'text-purple-400 bg-purple-400/10 border-purple-400/20', MANAGER: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20', TL: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', EMPLOYEE: 'text-slate-300 bg-slate-800 border-white/10' };
const statusColors = { ACTIVE: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20', PROBATION: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', INACTIVE: 'text-brand-danger bg-brand-danger/10 border-brand-danger/20' };
const avatarColors = ['bg-brand-primary/20 text-brand-primary', 'bg-purple-500/20 text-purple-400', 'bg-brand-accent/20 text-brand-accent', 'bg-yellow-500/20 text-yellow-400'];

export const EmployeeDirectory = () => {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [selected, setSelected] = useState(null);

  const departments = ['ALL', ...new Set(mockEmployees.map(e => e.department))];
  const roles = ['ALL', 'ADMIN', 'MANAGER', 'TL', 'EMPLOYEE'];

  const filtered = useMemo(() => mockEmployees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.designation.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || e.department === deptFilter;
    const matchRole = roleFilter === 'ALL' || e.role === roleFilter;
    return matchSearch && matchDept && matchRole;
  }), [search, deptFilter, roleFilter]);

  return (
    <div className="space-y-8 font-sans">
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md">
            <div className="p-6 border-b border-white/5 flex justify-between">
              <h3 className="font-bold text-white">Employee Profile</h3>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xs px-2 py-1 rounded border border-white/10">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-extrabold ${avatarColors[0]}`}>{selected.avatar}</div>
                <div>
                  <h4 className="text-lg font-extrabold text-white">{selected.name}</h4>
                  <p className="text-xs text-slate-400">{selected.designation}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold mt-1 inline-block ${roleColors[selected.role]}`}>{selected.role}</span>
                </div>
              </div>
              <div className="space-y-3 text-xs">
                {[['Employee ID', selected.id], ['Department', selected.department], ['Location', selected.location], ['Joined', selected.joined]].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400">{k}</span><span className="text-white font-mono">{v}</span></div>
                ))}
                <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400">Email</span><span className="text-brand-primary font-mono">{selected.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Phone</span><span className="text-white font-mono">{selected.phone}</span></div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${statusColors[selected.status]}`}>{selected.status}</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3"><Users className="h-7 w-7 text-brand-primary" />Employee Directory</h1>
        <p className="text-sm text-slate-400 mt-1">Browse active workforce, contact details, and org hierarchy.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, designation..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 transition-colors" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="bg-slate-900 border border-white/10 text-white text-xs px-4 py-3 rounded-xl font-mono min-w-[160px]">
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-slate-900 border border-white/10 text-white text-xs px-4 py-3 rounded-xl font-mono min-w-[130px]">
          {roles.map(r => <option key={r}>{r}</option>)}
        </select>
        <div className="flex gap-1 bg-slate-900 border border-white/10 rounded-xl p-1">
          {['grid', 'list'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${viewMode === m ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}>{m === 'grid' ? '⊞' : '≡'}</button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 font-mono">{filtered.length} employees found</p>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((emp, i) => (
            <div key={emp.id} onClick={() => setSelected(emp)} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-brand-primary/20 cursor-pointer transition-all hover:scale-[1.01]">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-sm font-extrabold ${avatarColors[i % avatarColors.length]}`}>{emp.avatar}</div>
                <span className={`text-[9px] px-2 py-0.5 rounded border font-bold ${statusColors[emp.status]}`}>{emp.status}</span>
              </div>
              <h4 className="font-bold text-white text-sm">{emp.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{emp.designation}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.department}</p>
              <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${roleColors[emp.role]}`}>{emp.role}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{emp.location}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs font-mono">
                {['Employee', 'Department', 'Role', 'Location', 'Email', 'Status', ''].map(h => <th key={h} className="px-5 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((emp, i) => (
                <tr key={emp.id} className="text-slate-300 hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => setSelected(emp)}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${avatarColors[i % avatarColors.length]}`}>{emp.avatar}</div>
                      <div><p className="font-bold text-white text-xs">{emp.name}</p><p className="text-[10px] text-slate-500 font-mono">{emp.id}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">{emp.department}</td>
                  <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${roleColors[emp.role]}`}>{emp.role}</span></td>
                  <td className="px-5 py-3 text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{emp.location}</td>
                  <td className="px-5 py-3 text-xs text-brand-primary font-mono">{emp.email}</td>
                  <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${statusColors[emp.status]}`}>{emp.status}</span></td>
                  <td className="px-5 py-3"><ChevronRight className="h-4 w-4 text-slate-600" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
