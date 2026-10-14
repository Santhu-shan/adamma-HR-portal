import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FolderOpen, Upload, Download, FileText, File, Image, Lock, Eye, Trash2, Search, Plus } from 'lucide-react';

const mockDocs = [
  { id: 'd1', name: 'Offer Letter.pdf', category: 'EMPLOYMENT', size: '142 KB', uploaded: '2023-02-20', type: 'pdf', access: 'PRIVATE', owner: 'HR' },
  { id: 'd2', name: 'Appointment Letter.pdf', category: 'EMPLOYMENT', size: '198 KB', uploaded: '2023-02-20', type: 'pdf', access: 'PRIVATE', owner: 'HR' },
  { id: 'd3', name: 'PAN Card Copy.jpg', category: 'KYC', size: '85 KB', uploaded: '2023-02-22', type: 'image', access: 'PRIVATE', owner: 'Employee' },
  { id: 'd4', name: 'Aadhaar Card.jpg', category: 'KYC', size: '92 KB', uploaded: '2023-02-22', type: 'image', access: 'PRIVATE', owner: 'Employee' },
  { id: 'd5', name: 'Salary Revision Letter - Apr 2025.pdf', category: 'COMPENSATION', size: '165 KB', uploaded: '2025-04-01', type: 'pdf', access: 'PRIVATE', owner: 'HR' },
  { id: 'd6', name: 'HRMS User Policy v2.1.pdf', category: 'POLICY', size: '320 KB', uploaded: '2026-01-01', type: 'pdf', access: 'SHARED', owner: 'HR' },
  { id: 'd7', name: 'Attendance Policy 2026.pdf', category: 'POLICY', size: '280 KB', uploaded: '2026-01-01', type: 'pdf', access: 'SHARED', owner: 'HR' },
  { id: 'd8', name: 'BGV Consent Form.pdf', category: 'VERIFICATION', size: '110 KB', uploaded: '2023-02-21', type: 'pdf', access: 'PRIVATE', owner: 'Employee' },
  { id: 'd9', name: 'Medical Certificate - Jun 2026.pdf', category: 'MEDICAL', size: '55 KB', uploaded: '2026-06-15', type: 'pdf', access: 'PRIVATE', owner: 'Employee' },
  { id: 'd10', name: 'Work From Home Agreement.pdf', category: 'EMPLOYMENT', size: '130 KB', uploaded: '2024-06-01', type: 'pdf', access: 'PRIVATE', owner: 'HR' },
];

const categories = ['ALL', 'EMPLOYMENT', 'KYC', 'COMPENSATION', 'POLICY', 'MEDICAL', 'VERIFICATION'];
const catColors = { EMPLOYMENT: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20', KYC: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', COMPENSATION: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20', POLICY: 'text-purple-400 bg-purple-400/10 border-purple-400/20', MEDICAL: 'text-red-400 bg-red-400/10 border-red-400/20', VERIFICATION: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' };

const FileIcon = ({ type }) => {
  if (type === 'image') return <Image className="h-5 w-5 text-yellow-400" />;
  return <FileText className="h-5 w-5 text-brand-primary" />;
};

export const Documents = () => {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [showUpload, setShowUpload] = useState(false);
  const [docs, setDocs] = useState(mockDocs);
  const [uploadName, setUploadName] = useState('');
  const [uploadCat, setUploadCat] = useState('KYC');
  const [dragOver, setDragOver] = useState(false);

  const filtered = docs.filter(d => {
    const ms = d.name.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === 'ALL' || d.category === catFilter;
    return ms && mc;
  });

  const handleUpload = () => {
    if (!uploadName.trim()) return;
    const newDoc = { id: `d${Date.now()}`, name: uploadName.endsWith('.pdf') ? uploadName : uploadName + '.pdf', category: uploadCat, size: '—', uploaded: new Date().toISOString().split('T')[0], type: 'pdf', access: 'PRIVATE', owner: 'Employee' };
    setDocs([newDoc, ...docs]);
    setUploadName('');
    setShowUpload(false);
  };

  const handleDelete = (id) => setDocs(docs.filter(d => d.id !== id));

  const grouped = categories.slice(1).reduce((acc, cat) => {
    const items = filtered.filter(d => d.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3"><FolderOpen className="h-7 w-7 text-brand-primary" />Documents & Assets</h1>
          <p className="text-sm text-slate-400 mt-1">Manage personal and company documents securely in one place.</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-500 text-white font-bold text-xs tracking-wider flex items-center gap-2 hover:shadow-brand-primary/20 hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />Upload Document
        </button>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md">
            <div className="p-5 border-b border-white/5 flex justify-between">
              <h3 className="font-bold text-white">Upload Document</h3>
              <button onClick={() => setShowUpload(false)} className="text-slate-500 hover:text-white text-xs px-2 py-1 rounded border border-white/10">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setUploadName(f.name); }} className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragOver ? 'border-brand-primary bg-brand-primary/5' : 'border-white/10 hover:border-white/20'}`}>
                <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Drag & drop a file or type the document name below</p>
              </div>
              <input value={uploadName} onChange={e => setUploadName(e.target.value)} placeholder="Document name (e.g. PAN Card Copy.pdf)" className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-primary/50" />
              <select value={uploadCat} onChange={e => setUploadCat(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono">
                {categories.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={handleUpload} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-blue-500 text-white font-bold text-xs">Upload Document</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-primary/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-colors ${catFilter === c ? 'bg-brand-primary border-brand-primary text-white' : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {catFilter === 'ALL' ? Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${catColors[cat]}`}>{cat}</span>
              <span className="text-[10px] text-slate-600">{items.length} files</span>
            </div>
            <div className="glass-panel rounded-2xl overflow-hidden">
              {items.map((doc, i) => (
                <div key={doc.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors ${i < items.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <FileIcon type={doc.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.size} · {doc.uploaded} · {doc.owner}</p>
                  </div>
                  {doc.access === 'PRIVATE' ? <Lock className="h-3.5 w-3.5 text-slate-600 shrink-0" /> : <span className="text-[9px] text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded border border-brand-accent/20 font-bold shrink-0">SHARED</span>}
                  <div className="flex gap-1.5 shrink-0">
                    <button className="p-1.5 rounded-lg bg-slate-800 border border-white/5 text-slate-400 hover:text-white transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                    <button className="p-1.5 rounded-lg bg-slate-800 border border-white/5 text-slate-400 hover:text-white transition-colors"><Download className="h-3.5 w-3.5" /></button>
                    {doc.owner === 'Employee' && <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg bg-brand-danger/10 border border-brand-danger/20 text-brand-danger hover:bg-brand-danger/20 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : filtered.length ? (
          <div className="glass-panel rounded-2xl overflow-hidden">
            {filtered.map((doc, i) => (
              <div key={doc.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors ${i < filtered.length - 1 ? 'border-b border-white/5' : ''}`}>
                <FileIcon type={doc.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${catColors[doc.category]}`}>{doc.category}</span>
                    <p className="text-[10px] text-slate-500 font-mono">{doc.size} · {doc.uploaded}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button className="p-1.5 rounded-lg bg-slate-800 border border-white/5 text-slate-400 hover:text-white transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 rounded-lg bg-slate-800 border border-white/5 text-slate-400 hover:text-white transition-colors"><Download className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 text-sm">No documents found.</div>
        )}
      </div>
    </div>
  );
};
