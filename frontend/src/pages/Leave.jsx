import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  CalendarOff, 
  Plus, 
  FileText, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Calendar,
  AlertCircle,
  FileCheck2,
  Trash2
} from 'lucide-react';

const mockHolidays2026 = [
  { name: "Republic Day", date: "Jan 26, 2026", type: "Gazetted" },
  { name: "Maha Shivratri", date: "Feb 15, 2026", type: "Optional" },
  { name: "Holi", date: "Mar 04, 2026", type: "Gazetted" },
  { name: "Eid-ul-Fitr", date: "Mar 20, 2026", type: "Gazetted" },
  { name: "Good Friday", date: "Apr 03, 2026", type: "Gazetted" },
  { name: "Independence Day", date: "Aug 15, 2026", type: "Gazetted" },
  { name: "Gandhi Jayanti", date: "Oct 02, 2026", type: "Gazetted" },
  { name: "Diwali (Deepavali)", date: "Nov 08, 2026", type: "Gazetted" },
  { name: "Guru Nanak Jayanti", date: "Nov 24, 2026", type: "Optional" },
  { name: "Christmas Day", date: "Dec 25, 2026", type: "Gazetted" }
];

export const Leave = () => {
  const { user, updateLeaveBalances } = useAuthStore();

  // Leaves applied by the logged-in user (simulated database list)
  const [myLeaves, setMyLeaves] = useState([
    { id: "lv-101", type: "CL", start: "2026-05-10", end: "2026-05-11", days: 1, status: "APPROVED", remarks: "Doctor checkup", doc: null },
    { id: "lv-102", type: "SL", start: "2026-06-15", end: "2026-06-19", days: 4, status: "PENDING", remarks: "Recovering from viral fever", doc: "medical_cert.pdf" }
  ]);

  // Leave approval queue for supervisors (TL / MANAGER roles)
  const [teamLeaves, setTeamLeaves] = useState([
    { id: "lv-201", applicantName: "Priya Patel", role: "EMPLOYEE", type: "EL", start: "2026-07-10", end: "2026-07-15", days: 5, status: "PENDING", remarks: "Family wedding event", doc: null },
    { id: "lv-202", applicantName: "Rahul Kumar", role: "EMPLOYEE", type: "SL", start: "2026-06-01", end: "2026-06-05", days: 4, status: "TL_APPROVED", remarks: "Dental surgery", doc: "dental_prescription.png" }
  ]);

  // Form States
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [leaveType, setLeaveType] = useState('CL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 font-mono">
        Loading leave data...
      </div>
    );
  }

  // Local helper to calculate date differences
  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const sDate = new Date(start);
    const eDate = new Date(end);
    const timeDiff = eDate.getTime() - sDate.getTime();
    if (timeDiff < 0) return 0;
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const calculatedDays = calculateDuration(startDate, endDate);

  // Form Submission
  const handleApplyLeave = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (calculatedDays <= 0) {
      setFormError("End date must occur after or on the start date.");
      return;
    }

    // Probation blocks EL checks
    if (leaveType === 'EL' && user.status === 'PROBATION') {
      setFormError("Earned Leave (EL) accruals are locked during probation.");
      return;
    }

    // Balance checks
    let activeBalance = 0;
    if (leaveType === 'CL') activeBalance = user.clBalance;
    else if (leaveType === 'EL') activeBalance = user.elBalance;
    else if (leaveType === 'SL') activeBalance = user.slBalance;
    else if (leaveType === 'COMP_OFF') activeBalance = user.compOffBalance;

    if (leaveType !== 'LOP' && leaveType !== 'MATERNITY' && leaveType !== 'PATERNITY' && leaveType !== 'BEREAVEMENT') {
      if (calculatedDays > activeBalance) {
        setFormError(`Insufficient ${leaveType} balance. Requested: ${calculatedDays}, Available: ${activeBalance}.`);
        return;
      }
    }

    // SL document verification rule (> 3 days requires attachment)
    if (leaveType === 'SL' && calculatedDays > 3 && !docFile) {
      setFormError("Policy Warning: Sick Leaves exceeding 3 consecutive days require formal medical documentation.");
      return;
    }

    // Deduction / Balance adjustment mock simulation
    if (leaveType === 'CL') updateLeaveBalances(user.clBalance - calculatedDays, user.elBalance, user.slBalance, user.compOffBalance);
    else if (leaveType === 'EL') updateLeaveBalances(user.clBalance, user.elBalance - calculatedDays, user.slBalance, user.compOffBalance);
    else if (leaveType === 'SL') updateLeaveBalances(user.clBalance, user.elBalance, user.slBalance - calculatedDays, user.compOffBalance);
    else if (leaveType === 'COMP_OFF') updateLeaveBalances(user.clBalance, user.elBalance, user.slBalance, user.compOffBalance - calculatedDays);

    const newLeave = {
      id: `lv-${Math.floor(Math.random() * 900) + 100}`,
      type: leaveType,
      start: startDate,
      end: endDate,
      days: calculatedDays,
      status: "PENDING",
      remarks: remarks,
      doc: docFile ? docFile.name : null
    };

    setMyLeaves([newLeave, ...myLeaves]);
    setFormSuccess("Leave request successfully submitted to supervisor review queue!");
    setStartDate('');
    setEndDate('');
    setRemarks('');
    setDocFile(null);
    setTimeout(() => {
      setShowApplyForm(false);
      setFormSuccess('');
    }, 1800);
  };

  // Supervisor actions (Approve, Reject, Return)
  const handleReview = (id, action) => {
    setTeamLeaves(teamLeaves.map(lv => {
      if (lv.id === id) {
        let newStatus = lv.status;
        if (action === 'APPROVE') {
          // Dynamic role progression
          if (user.role === 'TL') {
            newStatus = 'TL_APPROVED';
          } else if (user.role === 'MANAGER' || user.role === 'ADMIN') {
            newStatus = 'APPROVED';
          }
        } else if (action === 'REJECT') {
          newStatus = 'REJECTED';
        } else if (action === 'RETURN') {
          newStatus = 'RETURNED_TO_USER';
        }
        return { ...lv, status: newStatus };
      }
      return lv;
    }));
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Leaves, Calendar & Approvals</h1>
          <p className="text-sm text-slate-400 mt-1">Submit time-off requests, monitor leave bounds, and track team availability.</p>
        </div>
        <button
          onClick={() => setShowApplyForm(!showApplyForm)}
          className="py-3 px-5 rounded-xl bg-gradient-to-r from-brand-primary to-blue-500 hover:shadow-brand-primary/20 hover:shadow-lg transition-all text-white font-bold text-xs tracking-wider flex items-center gap-2 transform active:scale-95 duration-200"
        >
          <Plus className="h-4.5 w-4.5" /> {showApplyForm ? 'Close Application' : 'Apply for Leave'}
        </button>
      </div>

      {/* Apply Leave Overlay Card */}
      {showApplyForm && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1 bg-brand-primary"></div>
          <h2 className="text-lg font-bold text-white mb-6">Leave Application Form</h2>

          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-brand-danger shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-brand-accent/10 border border-brand-accent/20 text-xs text-green-200 flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-brand-accent shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleApplyLeave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Type & Dates */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-brand-primary transition-colors"
                >
                  <option value="CL">Casual Leave (CL)</option>
                  <option value="SL">Sick Leave (SL)</option>
                  <option value="EL">Earned Leave (EL)</option>
                  <option value="COMP_OFF">Compensatory Off (Comp-Off)</option>
                  <option value="LOP">Loss Of Pay (LOP)</option>
                  <option value="BEREAVEMENT">Bereavement Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">Duration Estimate</label>
                <div className="p-4 rounded-xl bg-slate-950 text-center border border-white/5">
                  <span className="text-3xl font-extrabold text-white font-mono">{calculatedDays}</span>
                  <span className="text-slate-400 text-xs ml-1.5 font-bold">Days Requested</span>
                </div>
              </div>
            </div>

            {/* Date Boundaries */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-brand-primary transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-brand-primary transition-colors font-mono"
                />
              </div>
            </div>

            {/* Attachment & Comments */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">Attachment (SL Cert / Proof)</label>
                <input
                  type="file"
                  onChange={(e) => setDocFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-brand-primary hover:file:bg-slate-850 file:transition-colors file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">Remarks & Context</label>
                <textarea
                  rows={2}
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="Provide details about this leave request..."
                />
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="py-3 px-6 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white font-bold text-xs tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-brand-primary text-white font-bold text-xs tracking-wider"
              >
                Submit Leave Request
              </button>
            </div>

          </form>
        </div>
      )}

      {/* RENDER SUPERVISOR APPROVALS QUEUE */}
      {(user?.role === 'TL' || user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
        <div className="glass-panel p-6 rounded-3xl border-t-4 border-t-purple-500">
          <div className="flex items-center gap-2.5 mb-6">
            <FileCheck2 className="h-5.5 w-5.5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Team Leave Approval Queue ({user.role} View)</h3>
          </div>
          
          <div className="overflow-x-auto">
            {teamLeaves.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-white/5">
                No leave requests awaiting approval.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-mono">
                    <th className="pb-3">Applicant Employee</th>
                    <th className="pb-3">Leave Type</th>
                    <th className="pb-3">Start/End Dates</th>
                    <th className="pb-3">Days</th>
                    <th className="pb-3">Comments / Remarks</th>
                    <th className="pb-3">Attached Proof</th>
                    <th className="pb-3">Flow Status</th>
                    <th className="pb-3 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {teamLeaves.map((lv) => (
                    <tr key={lv.id} className="text-slate-300">
                      <td className="py-4 font-bold text-white">{lv.applicantName} <span className="text-[10px] text-slate-500 font-mono font-medium block">({lv.role})</span></td>
                      <td className="py-4 font-mono font-bold text-brand-primary">{lv.type}</td>
                      <td className="py-4 font-mono text-slate-400">{lv.start} — {lv.end}</td>
                      <td className="py-4 font-mono">{lv.days}</td>
                      <td className="py-4 max-w-xs truncate text-slate-400">{lv.remarks}</td>
                      <td className="py-4 text-xs font-mono text-slate-400">{lv.doc ? `📄 ${lv.doc}` : '--'}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          lv.status === 'APPROVED' 
                            ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent'
                            : lv.status === 'TL_APPROVED'
                            ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                            : lv.status === 'REJECTED'
                            ? 'bg-brand-danger/10 border-brand-danger/20 text-brand-danger'
                            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                        }`}>
                          {lv.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {lv.status !== 'APPROVED' && lv.status !== 'REJECTED' && lv.status !== 'RETURNED_TO_USER' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleReview(lv.id, 'APPROVE')}
                              className="p-2 rounded bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/30 text-brand-accent transition-colors"
                              title="Approve Leave"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReview(lv.id, 'REJECT')}
                              className="p-2 rounded bg-brand-danger/10 hover:bg-brand-danger/20 border border-brand-danger/30 text-brand-danger transition-colors"
                              title="Reject Leave"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReview(lv.id, 'RETURN')}
                              className="p-2 rounded bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 transition-colors"
                              title="Return for Revision"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Personal Leave Log & Holiday calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Personal Leave History */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <CalendarOff className="h-5.5 w-5.5 text-brand-primary" />
            <h3 className="text-lg font-bold text-white">My Leave Application Logs</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-mono">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Applied Range</th>
                  <th className="pb-3">Days</th>
                  <th className="pb-3">Flow Status</th>
                  <th className="pb-3">Supervisor Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myLeaves.map((lv) => (
                  <tr key={lv.id} className="text-slate-300">
                    <td className="py-4 font-mono font-bold text-brand-primary">{lv.type}</td>
                    <td className="py-4 font-mono text-slate-400">{lv.start} — {lv.end}</td>
                    <td className="py-4 font-mono">{lv.days}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        lv.status === 'APPROVED' 
                          ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent' 
                          : lv.status === 'REJECTED'
                          ? 'bg-brand-danger/10 border-brand-danger/20 text-brand-danger'
                          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                      }`}>
                        {lv.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 italic max-w-xs truncate">{lv.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2026 Holiday List */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-5.5 w-5.5 text-brand-accent" />
              <h3 className="text-lg font-bold text-white">2026 Holiday List</h3>
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {mockHolidays2026.map((h, index) => (
                <div key={index} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                  <div>
                    <p className="font-bold text-slate-100">{h.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{h.date}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                    h.type === 'Optional' 
                      ? 'bg-slate-950 text-slate-400 border border-white/5' 
                      : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                  }`}>
                    {h.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-white/5 text-[9px] text-slate-500 text-center leading-normal mt-6">
            Standard Gazetted and optional holidays are auto-seeded in accordance with the corporate policy calendar.
          </div>
        </div>

      </div>

    </div>
  );
};
