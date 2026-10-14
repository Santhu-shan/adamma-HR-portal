import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Award, Play, CheckCircle, Clock, Lock, ChevronRight, ExternalLink, Star, Plus } from 'lucide-react';

const mockCourses = [
  { id: 'C001', title: 'BGV Process Fundamentals', category: 'CORE', duration: '4 hrs', level: 'BEGINNER', progress: 100, completed: '2026-01-15', cert: true, mandatory: true, rating: 4.5, desc: 'Learn the end-to-end background verification process including employment, education, and criminal checks.' },
  { id: 'C002', title: 'Data Privacy & GDPR Compliance', category: 'COMPLIANCE', duration: '2 hrs', level: 'INTERMEDIATE', progress: 100, completed: '2026-02-10', cert: true, mandatory: true, rating: 4.2, desc: 'Understand data handling obligations, GDPR requirements, and privacy best practices for BGV operations.' },
  { id: 'C003', title: 'Client Communication Excellence', category: 'SOFT_SKILLS', duration: '3 hrs', level: 'BEGINNER', progress: 60, completed: null, cert: false, mandatory: false, rating: 4.7, desc: 'Master professional client communication, email etiquette, and escalation management.' },
  { id: 'C004', title: 'Advanced Case Investigation Techniques', category: 'CORE', duration: '6 hrs', level: 'ADVANCED', progress: 0, completed: null, cert: true, mandatory: false, rating: 4.8, desc: 'Deep dive into complex verification cases, fraud detection, and investigative methodologies.' },
  { id: 'C005', title: 'IT Security & Cyber Hygiene', category: 'COMPLIANCE', duration: '2.5 hrs', level: 'BEGINNER', progress: 100, completed: '2026-03-05', cert: true, mandatory: true, rating: 4.0, desc: 'Understand phishing, password hygiene, secure document handling, and data breach protocols.' },
  { id: 'C006', title: 'Excel for Operations & MIS', category: 'TOOLS', duration: '5 hrs', level: 'INTERMEDIATE', progress: 30, completed: null, cert: false, mandatory: false, rating: 4.6, desc: 'Advanced Excel for VLOOKUP, pivot tables, macros, and operations MIS reporting.' },
];

const mockCerts = mockCourses.filter(c => c.cert && c.completed);

const catColors = { CORE: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20', COMPLIANCE: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', SOFT_SKILLS: 'text-purple-400 bg-purple-400/10 border-purple-400/20', TOOLS: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' };
const levelColors = { BEGINNER: 'text-brand-accent', INTERMEDIATE: 'text-yellow-400', ADVANCED: 'text-brand-danger' };
const categories = ['ALL', 'CORE', 'COMPLIANCE', 'SOFT_SKILLS', 'TOOLS'];

export const Training = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState(mockCourses);
  const [tab, setTab] = useState('COURSES');
  const [catFilter, setCatFilter] = useState('ALL');

  const filtered = courses.filter(c => catFilter === 'ALL' || c.category === catFilter);
  const completed = courses.filter(c => c.progress === 100).length;
  const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100).length;
  const totalHours = courses.filter(c => c.completed).reduce((s, c) => s + parseFloat(c.duration), 0);

  const handleEnroll = (id) => {
    setCourses(courses.map(c => c.id === id ? { ...c, progress: 10 } : c));
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3"><BookOpen className="h-7 w-7 text-brand-primary" />Training & Certifications</h1>
        <p className="text-sm text-slate-400 mt-1">Complete mandatory trainings, upskill with electives, and earn certificates.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['Completed', completed, 'text-brand-accent'], ['In Progress', inProgress, 'text-yellow-400'], ['Certificates', mockCerts.length, 'text-purple-400'], ['Hours Trained', `${totalHours}h`, 'text-brand-primary']].map(([label, val, col]) => (
          <div key={label} className="glass-panel p-5 rounded-2xl border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">{label}</p>
            <p className={`text-3xl font-extrabold mt-2 ${col}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-slate-900 border border-white/10 rounded-xl p-1 w-fit">
        {['COURSES', 'CERTIFICATES'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${tab === t ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {tab === 'COURSES' && (
        <>
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors ${catFilter === c ? 'bg-brand-primary border-brand-primary text-white' : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'}`}>{c}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(course => (
              <div key={course.id} className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-brand-primary/20 transition-all">
                <div>
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${catColors[course.category]}`}>{course.category}</span>
                    <div className="flex gap-1.5 shrink-0">
                      {course.mandatory && <span className="text-[9px] px-2 py-0.5 rounded border font-bold text-brand-danger bg-brand-danger/10 border-brand-danger/20">MANDATORY</span>}
                      {course.cert && <Award className="h-3.5 w-3.5 text-yellow-400" />}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-sm leading-snug">{course.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{course.desc}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`text-[10px] font-bold ${levelColors[course.level]}`}>{course.level}</span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[10px] text-yellow-400 flex items-center gap-1"><Star className="h-3 w-3 fill-current" />{course.rating}</span>
                  </div>
                </div>

                <div className="mt-4">
                  {course.progress > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-slate-400">Progress</span>
                        <span className={course.progress === 100 ? 'text-brand-accent' : 'text-brand-primary'}>{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full">
                        <div className={`h-full rounded-full transition-all ${course.progress === 100 ? 'bg-brand-accent' : 'bg-brand-primary'}`} style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  )}

                  {course.progress === 100 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-brand-accent flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" />Completed {course.completed}</span>
                      {course.cert && <button className="text-[10px] text-purple-400 flex items-center gap-1 hover:underline"><Award className="h-3.5 w-3.5" />View Cert</button>}
                    </div>
                  ) : course.progress > 0 ? (
                    <button className="w-full py-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-primary/20 transition-colors">
                      <Play className="h-3.5 w-3.5 fill-current" />Continue
                    </button>
                  ) : (
                    <button onClick={() => handleEnroll(course.id)} className="w-full py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:border-brand-primary/30 hover:text-brand-primary transition-colors">
                      <Play className="h-3.5 w-3.5" />Start Course
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'CERTIFICATES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockCerts.map(cert => (
            <div key={cert.id} className="glass-panel p-5 rounded-2xl border border-yellow-400/10 hover:border-yellow-400/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20"><Award className="h-6 w-6 text-yellow-400" /></div>
                <div>
                  <p className="text-[10px] text-slate-500 font-mono">CERTIFICATE OF COMPLETION</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Adamma Info Services</p>
                </div>
              </div>
              <h3 className="font-bold text-white text-sm">{cert.title}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Issued: <span className="text-white font-mono">{cert.completed}</span></p>
              <p className="text-[10px] text-slate-400">Issued to: <span className="text-white">{user?.name}</span></p>
              <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                <button className="flex-1 py-2 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-bold text-xs hover:bg-yellow-400/20 transition-colors flex items-center justify-center gap-1"><ExternalLink className="h-3.5 w-3.5" />View</button>
                <button className="flex-1 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 font-bold text-xs hover:text-white transition-colors">Download</button>
              </div>
            </div>
          ))}
          {mockCerts.length === 0 && <div className="col-span-full glass-panel rounded-2xl p-12 text-center text-slate-500 text-sm">No certificates earned yet. Complete courses to earn them.</div>}
        </div>
      )}
    </div>
  );
};
