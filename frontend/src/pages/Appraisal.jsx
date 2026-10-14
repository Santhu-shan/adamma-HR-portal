import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Award, 
  ChevronRight, 
  HelpCircle, 
  Send, 
  CheckCircle,
  FileCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const sections = [
  { id: 1, title: "1. Job Knowledge & Core Domain", desc: "Understanding of operational job metrics, framework constraints, and core domain policies." },
  { id: 2, title: "2. Execution Quality & Delivery", desc: "Consistency of work output, error frequency margins, and sprint commitment completions." },
  { id: 3, title: "3. Attendance Integrity & Punctuality", desc: "Shift clock-in timeliness, grace period violations, and scheduled break lock compliance." },
  { id: 4, title: "4. Corporate Discipline & Integrity", desc: "Adherence to dress code codes, professional workspace hygiene, and security compliance." },
  { id: 5, title: "5. Technical / Skill Proficiency", desc: "Mastery of operational stack languages, frameworks, and continuous learning milestones." },
  { id: 6, title: "6. Process & Guidelines Adherence", desc: "Adherence to standard operating workflows, reporting line guidelines, and ticketing engines." },
  { id: 7, title: "7. Adaptability & Teamwork Collaboration", desc: "Cross-functional team coordination, agile standup attendance, and mentorship of team members." },
  { id: 8, title: "8. Corporate Communication Skills", desc: "Timeliness of notification responses, client conversation etiquette, and verbal reviews." }
];

export const Appraisal = () => {
  const { user } = useAuthStore();

  // Active form status flow state
  const [status, setStatus] = useState('DRAFT'); // DRAFT -> SELF_SUBMITTED -> TL_REVIEWED -> MANAGER_REVIEWED -> ADMIN_REVIEWED -> COMPLETED

  // Evaluation ratings matrices (1 to 5 integer scales for 8 fields)
  const [employeeRatings, setEmployeeRatings] = useState(Array(8).fill(3));
  const [tlRatings, setTlRatings] = useState(Array(8).fill(4));
  const [managerRatings, setManagerRatings] = useState(Array(8).fill(4));
  const [adminRatings, setAdminRatings] = useState(Array(8).fill(4));

  // Feedback comments
  const [employeeFeedback, setEmployeeFeedback] = useState("");
  const [tlFeedback, setTlFeedback] = useState("");
  const [managerFeedback, setManagerFeedback] = useState("");
  const [adminFeedback, setAdminFeedback] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 font-mono">
        Loading appraisal calibration...
      </div>
    );
  }

  // Handler to set individual rating
  const updateRating = (index, value, tier) => {
    const val = parseInt(value);
    if (tier === 'employee') {
      const copy = [...employeeRatings];
      copy[index] = val;
      setEmployeeRatings(copy);
    } else if (tier === 'tl') {
      const copy = [...tlRatings];
      copy[index] = val;
      setTlRatings(copy);
    } else if (tier === 'manager') {
      const copy = [...managerRatings];
      copy[index] = val;
      setManagerRatings(copy);
    } else if (tier === 'admin') {
      const copy = [...adminRatings];
      copy[index] = val;
      setAdminRatings(copy);
    }
  };

  // Real-time calculation helpers
  const calculateTierSum = (ratings) => ratings.reduce((sum, val) => sum + val, 0);
  const calculateTierPercentage = (ratings) => (calculateTierSum(ratings) / 40) * 100;

  // 4-tier weighting formula implementation
  const selfWeight = 0.30;
  const tlWeight = 0.30;
  const mgrWeight = 0.30;
  const admWeight = 0.10;

  const currentCompositeScore = parseFloat((
    calculateTierPercentage(employeeRatings) * selfWeight +
    calculateTierPercentage(tlRatings) * tlWeight +
    calculateTierPercentage(managerRatings) * mgrWeight +
    calculateTierPercentage(adminRatings) * admWeight
  ).toFixed(2));

  // Recommendation engine mapping
  const getActionRecommendation = (score) => {
    if (score >= 90) return { action: "PROMOTION & TIER-A HIKE", color: "text-brand-accent border-brand-accent/20 bg-brand-accent/5", desc: "Exceptional output. Recommended for immediate level elevation." };
    if (score >= 75) return { action: "TIER-A MERIT HIKE", color: "text-brand-primary border-brand-primary/20 bg-brand-primary/5", desc: "Strong contribution. Commended for double-digit financial adjustment." };
    if (score >= 60) return { action: "STANDARD TIER-B HIKE", color: "text-blue-300 border-white/15 bg-white/5", desc: "Met commitments. Mapped to typical cost-of-living increment." };
    if (score >= 45) return { action: "RETAIN (NO ADJUSTMENT)", color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5", desc: "Adequate base performance. Retain salary scales at current levels." };
    return { action: "PERFORMANCE IMPROVEMENT PLAN (PIP)", color: "text-brand-danger border-brand-danger/20 bg-brand-danger/5", desc: "Performance below parameters. Initiate formal 45-day review program." };
  };

  const recommendation = getActionRecommendation(currentCompositeScore);

  const transitionFlow = (nextStatus) => {
    setStatus(nextStatus);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">4-Level Performance Appraisal Calibration</h1>
          <p className="text-sm text-slate-400 mt-1">Multi-tier weighted appraisal cycle. Role hierarchy verification active.</p>
        </div>

        {/* Dynamic Flow Status Tracker */}
        <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
          <span className="text-slate-400 font-mono">STATUS:</span>
          <span className="px-2.5 py-0.5 rounded font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">{status}</span>
        </div>
      </div>

      {/* Calibration Hub Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weighted Calculations Summary */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-[360px] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-primary to-cyan-500"></div>
          
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Real-time Combined Metric</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-6xl font-extrabold tracking-tight text-white">{currentCompositeScore}</span>
              <span className="text-slate-500 font-mono text-sm">/ 100</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Formula: Self (30%) + TL (30%) + Mgr (30%) + Admin (10%)</p>
          </div>

          <div className="py-4 border-t border-b border-white/5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Self Evaluation:</span>
              <span className="text-white font-mono font-bold">{calculateTierPercentage(employeeRatings).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">TL Review Rating:</span>
              <span className="text-white font-mono font-bold">{calculateTierPercentage(tlRatings).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Manager Calibration:</span>
              <span className="text-white font-mono font-bold">{calculateTierPercentage(managerRatings).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Admin Sign-off:</span>
              <span className="text-white font-mono font-bold">{calculateTierPercentage(adminRatings).toFixed(0)}%</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 italic leading-relaxed text-center">
            Scores dynamically aggregate across all 8 segments based on tier completions.
          </div>
        </div>

        {/* Action Recommendation Board */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-[360px] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-brand-accent"></div>
          
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">System Recommendation</span>
            <div className={`p-4 rounded-xl border mt-4 text-center ${recommendation.color}`}>
              <Sparkles className="h-5 w-5 mx-auto mb-2 text-inherit" />
              <p className="font-extrabold text-sm uppercase tracking-wide">{recommendation.action}</p>
            </div>
            <p className="text-xs text-slate-300 mt-4 leading-relaxed text-center">{recommendation.desc}</p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-[10px] text-slate-400 text-center leading-normal">
            This recommendation compiles dynamically based on corporate policy guidelines. Admins can override during finalization.
          </div>
        </div>

        {/* Phase Action Pathways */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-[360px] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-purple-500"></div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">Workflow Progression</h3>
            <p className="text-xs text-slate-400 leading-normal">Advance the appraisal through standard sign-off checks or return to previous levels for correction.</p>

            <div className="space-y-3 mt-6">
              {status === 'DRAFT' && (
                <button
                  onClick={() => transitionFlow('SELF_SUBMITTED')}
                  className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 transform active:scale-95 duration-200"
                >
                  Submit Self Evaluation <Send className="h-4 w-4" />
                </button>
              )}
              {status === 'SELF_SUBMITTED' && (
                <div className="space-y-2">
                  <button
                    onClick={() => transitionFlow('TL_REVIEWED')}
                    className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 transform active:scale-95 duration-200"
                  >
                    TL Calibration Approve <FileCheck className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => transitionFlow('DRAFT')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-brand-danger/35 text-red-400 font-bold text-xs tracking-wider flex items-center justify-center gap-2"
                  >
                    Return to Draft <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              )}
              {status === 'TL_REVIEWED' && (
                <div className="space-y-2">
                  <button
                    onClick={() => transitionFlow('MANAGER_REVIEWED')}
                    className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 transform active:scale-95 duration-200"
                  >
                    Manager Calibration Approve <FileCheck className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => transitionFlow('SELF_SUBMITTED')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-brand-danger/35 text-red-400 font-bold text-xs tracking-wider flex items-center justify-center gap-2"
                  >
                    Return to TL Level <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              )}
              {status === 'MANAGER_REVIEWED' && (
                <div className="space-y-2">
                  <button
                    onClick={() => transitionFlow('ADMIN_REVIEWED')}
                    className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 transform active:scale-95 duration-200"
                  >
                    Admin Calibration Approve <FileCheck className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => transitionFlow('TL_REVIEWED')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-brand-danger/35 text-red-400 font-bold text-xs tracking-wider flex items-center justify-center gap-2"
                  >
                    Return to Manager Level <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              )}
              {status === 'ADMIN_REVIEWED' && (
                <button
                  onClick={() => transitionFlow('COMPLETED')}
                  className="w-full py-3.5 rounded-xl bg-brand-accent text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 transform active:scale-95 duration-200"
                >
                  Finalize & Sign Off Cycle <CheckCircle className="h-4 w-4" />
                </button>
              )}
              {status === 'COMPLETED' && (
                <div className="p-4 bg-brand-accent/5 border border-brand-accent/20 text-center text-brand-accent text-xs rounded-xl font-bold">
                  🎉 Cycle Fully Signed Off & Closed.
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono text-center">
            Active User Persona Role: <span className="text-white font-bold">{user?.role}</span>
          </div>
        </div>

      </div>

      {/* Main 8-Section Evaluation Form */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-6">Active Performance Calibration Worksheet</h3>
        
        <div className="space-y-8">
          {sections.map((sect, index) => (
            <div key={sect.id} className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
              
              {/* Section Header */}
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">{sect.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sect.desc}</p>
              </div>

              {/* Slider Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-white/5">
                
                {/* Employee Self Score */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold tracking-wider uppercase font-mono mb-2">Self Score: {employeeRatings[index]}</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    disabled={status !== 'DRAFT'}
                    value={employeeRatings[index]}
                    onChange={(e) => updateRating(index, e.target.value, 'employee')}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-1">
                    <span>1: PIP</span>
                    <span>3: Met</span>
                    <span>5: Exc</span>
                  </div>
                </div>

                {/* TL Review Score */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold tracking-wider uppercase font-mono mb-2">TL Score: {tlRatings[index]}</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    disabled={user?.role !== 'TL' && user?.role !== 'ADMIN'}
                    value={tlRatings[index]}
                    onChange={(e) => updateRating(index, e.target.value, 'tl')}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-1">
                    <span>1: PIP</span>
                    <span>3: Met</span>
                    <span>5: Exc</span>
                  </div>
                </div>

                {/* Manager Score */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold tracking-wider uppercase font-mono mb-2">Manager Score: {managerRatings[index]}</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    disabled={user?.role !== 'MANAGER' && user?.role !== 'ADMIN'}
                    value={managerRatings[index]}
                    onChange={(e) => updateRating(index, e.target.value, 'manager')}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-1">
                    <span>1: PIP</span>
                    <span>3: Met</span>
                    <span>5: Exc</span>
                  </div>
                </div>

                {/* Admin Score */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold tracking-wider uppercase font-mono mb-2">Admin Score: {adminRatings[index]}</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    disabled={user?.role !== 'ADMIN'}
                    value={adminRatings[index]}
                    onChange={(e) => updateRating(index, e.target.value, 'admin')}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-1">
                    <span>1: PIP</span>
                    <span>3: Met</span>
                    <span>5: Exc</span>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>

        {/* Feedback Comments */}
        <div className="mt-8 space-y-6 pt-8 border-t border-white/5">
          <h3 className="text-lg font-bold text-white">Review Calibration Remarks</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">Employee Self Remarks</label>
              <textarea
                rows={3}
                disabled={status !== 'DRAFT'}
                value={employeeFeedback}
                onChange={(e) => setEmployeeFeedback(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="List your primary accomplishments for this review period..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">TL Calibration Comments</label>
              <textarea
                rows={3}
                disabled={user?.role !== 'TL' && user?.role !== 'ADMIN'}
                value={tlFeedback}
                onChange={(e) => setTlFeedback(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="Record team lead feedback, process alignment details..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">Manager Calibration Comments</label>
              <textarea
                rows={3}
                disabled={user?.role !== 'MANAGER' && user?.role !== 'ADMIN'}
                value={managerFeedback}
                onChange={(e) => setManagerFeedback(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="Record manager performance evaluations, hike reviews..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">Admin Sign-off Remarks</label>
              <textarea
                rows={3}
                disabled={user?.role !== 'ADMIN'}
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="Record administrative level sign-offs and actions..."
              />
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
