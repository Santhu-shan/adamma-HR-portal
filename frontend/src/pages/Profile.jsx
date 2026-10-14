import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import logoImg from '../assets/logo.png';
import { 
  User, 
  Briefcase, 
  CreditCard, 
  ShieldCheck, 
  Shirt, 
  Download, 
  MapPin, 
  Calendar,
  AlertCircle,
  Printer,
  FileText,
  X,
  Lock,
  Unlock,
  Loader2,
  Camera
} from 'lucide-react';

export const Profile = () => {
  const { user, payrollAdjustments, changePassword, uploadProfilePic } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 font-mono">
        Loading profile directory...
      </div>
    );
  }

  // Interactive toggle for payslip overlay
  const [showPayslip, setShowPayslip] = useState(false);
  // Security masking toggle for bank details
  const [revealBank, setRevealBank] = useState(false);

  // Change password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPwError('Please fill in both fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }

    setPwLoading(true);
    setPwError('');
    setPwSuccess('');

    try {
      const res = await changePassword(currentPassword, newPassword);
      setPwSuccess(res.message || 'Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('Selected image is too large. Please select a compressed file less than 500 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Pic = reader.result;
      try {
        await uploadProfilePic(base64Pic);
      } catch (err) {
        alert(err.message || 'Failed to update profile picture.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Dynamic Date calculation for the payslip header
  const today = new Date();
  const currentMonthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

  const adj = payrollAdjustments && user ? payrollAdjustments[user.id] : null;

  // Compensation Math
  const baseGross = (user.salary?.baseSalary || 0) + 
                    (user.salary?.hra || 0) + 
                    (user.salary?.conveyance || 0) + 
                    (user.salary?.medical || 0) + 
                    (user.salary?.otherAllowance || 0);

  const overtimeAllowance = adj ? adj.overtimeAmount : 0;
  const grossMonthly = baseGross + overtimeAllowance;

  const baseDeductions = (user.deductions?.epf || 0) + 
                         (user.deductions?.tds || 0) + 
                         (user.deductions?.profTax || 0) + 
                         (user.deductions?.retentionAmount || 0);

  const lopDeduction = adj ? adj.lopDeduction : 0;
  const totalDeductions = baseDeductions + lopDeduction;

  const netPay = grossMonthly - totalDeductions;

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Download Handler via dynamic html2pdf compiler
  const handleDownload = () => {
    const element = document.getElementById('printable-payslip');
    const opt = {
      margin: 0.1,
      filename: `Payslip_${user.name.replace(/\s+/g, '_')}_${currentMonthYear.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    if (window.html2pdf) {
      window.html2pdf().from(element).set(opt).save();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        window.html2pdf().from(element).set(opt).save();
      };
      document.body.appendChild(script);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Print CSS Injector */}
      <style>{`
        @media print {
          /* Hide sidebar, headers, background and all other elements */
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          /* Show only the payslip container */
          #printable-payslip, #printable-payslip * {
            visibility: visible;
          }
          #printable-payslip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 2px solid black !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Employee Profile Dossier</h1>
          <p className="text-sm text-slate-400 mt-1">Review onboarding coordinates, direct reporting supervisors, and official compensation records.</p>
        </div>
        <button
          onClick={() => setShowPayslip(true)}
          className="py-3 px-5 rounded-xl bg-gradient-to-r from-brand-primary to-orange-500 hover:shadow-brand-primary/20 hover:shadow-lg transition-all text-white font-bold text-xs tracking-wider flex items-center gap-2 transform active:scale-95 duration-200"
        >
          <Printer className="h-4.5 w-4.5" /> View Official Pay Slip
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PROFILE CRAD & SUPERVISORS */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Main Profile Info Card */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden text-center">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-primary to-orange-500"></div>
            
            <div className="relative h-24 w-24 mx-auto mt-4 mb-4 group">
              <div className="h-24 w-24 rounded-full bg-slate-800 border-2 border-brand-primary flex items-center justify-center overflow-hidden font-extrabold text-white text-3xl shadow-xl">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  user.name ? user.name[0] : 'U'
                )}
              </div>
              
              <label 
                className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-white"
                title="Change Profile Picture"
              >
                <Camera className="h-5.5 w-5.5 text-brand-primary animate-pulse" />
                <span className="text-[8px] font-mono uppercase tracking-widest font-bold">Edit Pic</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
            </div>
            
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-xs text-brand-primary font-mono font-bold tracking-widest uppercase mt-1">{user.role}</p>

            <div className="my-6 border-t border-b border-white/5 py-4 space-y-3 text-xs text-left">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Joined: <strong className="text-white">{user.doj || "Jan 05, 2026"}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Briefcase className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Status: <strong className="text-white">{user.status}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Work Location: <strong className="text-white">{user.location || "Bengaluru"}</strong></span>
              </div>
              {user.status === 'PROBATION' && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[10px] text-yellow-400 leading-normal flex items-start gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">On Probation Period</p>
                    <p className="mt-0.5">Subject to probation reviews. Sick/Casual leaves active; EL balances locked.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-[10px] text-slate-500 text-left font-mono">
              <p>EMPLOYEE ID: {user.id}</p>
              <p className="mt-1 truncate">EMAIL: {user.email}</p>
              <p className="mt-1">CONTACT: {user.mobile || "+91 98765 XXXXX"}</p>
              {user.dob && <p className="mt-1">DATE OF BIRTH: {user.dob}</p>}
            </div>
          </div>

          {/* Supervisors coordinates */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-brand-primary"></div>
            <h3 className="text-md font-bold text-white mb-4">Escalation Reporting Hierarchy</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-slate-400 font-mono font-bold uppercase">Team Lead (TL):</span>
                <span className="text-white font-bold">{user.tlName || user.tl || "Rohan Deshmukh"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono font-bold uppercase">Reporting Manager:</span>
                <span className="text-white font-bold">{user.managerName || user.manager || "Meera Nair"}</span>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-brand-danger"></div>
            
            <div className="flex items-center gap-2.5 mb-4">
              <Lock className="h-5 w-5 text-brand-danger" />
              <h3 className="text-md font-bold text-white">Customize Profile Password</h3>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              {pwError && (
                <div className="p-2 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-[10px] text-red-200">
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="p-2 rounded-xl bg-brand-accent/10 border border-brand-accent/20 text-[10px] text-green-200">
                  {pwSuccess}
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-brand-primary"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">New Custom Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-brand-primary text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transform active:scale-95 duration-200 mt-2 hover:shadow-lg hover:shadow-red-500/10"
              >
                {pwLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <>Update Password</>}
              </button>
            </form>
          </div>

        </div>

        {/* BANKING & COMPENSATION SUMMARY */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Identity & Bank Coordinates */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-brand-accent"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-5.5 w-5.5 text-brand-accent" />
                <h3 className="text-lg font-bold text-white">Registered Banking Coordinates</h3>
              </div>
              <button 
                onClick={() => setRevealBank(!revealBank)}
                className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors"
                title={revealBank ? "Hide Private Details" : "Reveal Private Details"}
              >
                {revealBank ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              <div className="space-y-3.5">
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Primary Bank Name:</span>
                  <span className="text-white font-bold">{user.bankDetails?.bankName || "Axis Bank Ltd"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="text-white font-mono font-bold">
                    {revealBank ? user.bankDetails?.accountNumber : `•••• •••• •••• ${user.bankDetails?.accountNumber?.slice(-4) || '9103'}`}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-slate-400">IFSC Routing Code:</span>
                  <span className="text-white font-mono font-bold">{user.bankDetails?.ifscCode || "UTIB0000004"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3.5">
                <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2 font-mono">
                  <span className="text-slate-500">UNIVERSAL AC (UAN):</span>
                  <span className="text-slate-300 font-bold">{user.bankDetails?.uan || "100987654321"}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2 font-mono">
                  <span className="text-slate-500">PF MEMBER ID:</span>
                  <span className="text-slate-300 font-bold">{user.bankDetails?.pfMemberId || "BG/BAN/98765/126"}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-500">PAN CARD NUMBER:</span>
                  <span className="text-slate-300 font-bold uppercase">{user.bankDetails?.pan || "RSTUV3456W"}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Salary Breakdown & Deductions */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-purple-500"></div>
            
            <div className="flex items-center gap-2.5 mb-6">
              <FileText className="h-5.5 w-5.5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Monthly Base Compensation Structure</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              
              {/* Earnings Column */}
              <div className="space-y-3">
                <p className="font-bold text-brand-primary uppercase tracking-wider text-[10px] font-mono mb-2">Monthly Earnings</p>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">Basic Salary & DA:</span>
                  <span className="text-white font-mono font-bold">₹{(user.salary?.baseSalary || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">House Rent Allowance:</span>
                  <span className="text-white font-mono font-bold">₹{(user.salary?.hra || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">Conveyance Allowance:</span>
                  <span className="text-white font-mono font-bold">₹{(user.salary?.conveyance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">Medical Allowance:</span>
                  <span className="text-white font-mono font-bold">₹{(user.salary?.medical || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">Other Allowance:</span>
                  <span className="text-white font-mono font-bold">₹{(user.salary?.otherAllowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 font-bold text-slate-200">
                  <span>Gross Monthly Base:</span>
                  <span className="text-emerald-400 font-mono">₹{grossMonthly.toLocaleString()}</span>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="space-y-3">
                <p className="font-bold text-brand-danger uppercase tracking-wider text-[10px] font-mono mb-2">Monthly Deductions</p>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">EPF Provident Fund:</span>
                  <span className="text-white font-mono font-bold">₹{(user.deductions?.epf || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">Tax Deducted (TDS):</span>
                  <span className="text-white font-mono font-bold">₹{(user.deductions?.tds || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">Professional Tax:</span>
                  <span className="text-white font-mono font-bold">₹{(user.deductions?.profTax || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-400">Retention Held Back:</span>
                  <span className="text-white font-mono font-bold">₹{(user.deductions?.retentionAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-8 font-bold text-slate-200">
                  <span>Total Deductions:</span>
                  <span className="text-red-400 font-mono">₹{totalDeductions.toLocaleString()}</span>
                </div>
              </div>

            </div>

            {/* Net Estimated Box */}
            <div className="mt-8 p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-bold text-slate-200">Estimated Net Payout (Monthly)</p>
                <p className="text-slate-400 text-xs mt-0.5">Calculated as Gross Monthly Earnings minus all standard Deductions.</p>
              </div>
              <div className="text-2xl font-extrabold text-brand-primary font-mono tracking-wide">
                ₹{netPay.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Annual Allowance seed */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-yellow-500"></div>
            
            <div className="flex items-center gap-2.5 mb-6">
              <ShieldCheck className="h-5.5 w-5.5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Annual Entitlements Preview</h3>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Annual LTA</span>
                <p className="text-sm font-extrabold text-white font-mono mt-1.5">₹{(user.salary?.lta || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Annual Medical</span>
                <p className="text-sm font-extrabold text-white font-mono mt-1.5">₹{(user.salary?.annualMedical || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Annual Bonus</span>
                <p className="text-sm font-extrabold text-white font-mono mt-1.5">₹{(user.salary?.bonus || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* PIXEL-PERFECT ADAMM PAYSLIP MODAL OVERLAY */}
      {showPayslip && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 overflow-y-auto p-4 md:p-8 no-print">
          <div className="w-full max-w-4xl bg-white text-black rounded-2xl border-4 border-slate-900 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Actions Header */}
            <div className="bg-slate-950 p-4 border-b border-white/10 flex justify-between items-center text-white no-print">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-brand-primary" />
                <span className="font-bold text-sm">Official Corporate Pay Slip Viewer</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="py-1.5 px-4 rounded bg-brand-accent text-white text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="py-1.5 px-4 rounded bg-brand-primary text-white text-xs font-bold hover:bg-orange-600 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Pay Slip
                </button>
                <button
                  onClick={() => setShowPayslip(false)}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PAYSLIP BODY SECTION */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10" id="printable-payslip">
              <div className="w-full border-2 border-black p-4 font-sans text-xs">
                
                {/* Logo & Header */}
                <div className="text-center mb-4 flex flex-col items-center">
                  <img src={logoImg} alt="ADAMMA Logo" className="h-24 w-auto object-contain" />
                  <h2 className="text-sm font-extrabold tracking-wider mt-2.5">ADAMMA INFO SERVICES PRIVATE LIMITED</h2>
                  <p className="text-[9px] font-bold text-slate-700 leading-normal max-w-xl mt-0.5">
                    938, KLP ARCADE, 2ND FLOOR, 5TH CROSS, 1ST BLOCK, BABUSAPALYA, OFF HRBR RING ROAD, BENGALURU – 560043
                  </p>
                  <div className="w-full border-t border-b border-black py-1 mt-3 font-extrabold text-center text-xs bg-slate-100 uppercase tracking-widest">
                    PAY SLIP - {currentMonthYear}
                  </div>
                </div>

                {/* Particulars Grid */}
                <div className="grid grid-cols-2 gap-4 border-b border-black pb-3 text-[10px]">
                  
                  {/* Left Column Particulars */}
                  <div className="space-y-1.5 pr-2">
                    <div className="grid grid-cols-3">
                      <span className="font-bold">Name of the Employee</span>
                      <span className="col-span-2">: {user.name}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold">Date of Birth</span>
                      <span className="col-span-2">: {user.dob || "Jan 07, 1988"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold">Employee ID</span>
                      <span className="col-span-2 font-mono font-bold">: {user.id || "AIS21198"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold">Date of Joining</span>
                      <span className="col-span-2">: {user.doj || "Dec 20, 2021"}</span>
                    </div>
                    <div className="grid grid-cols-3 pt-1 border-t border-dotted border-slate-300">
                      <span className="font-bold">Designation</span>
                      <span className="col-span-2">: {user.designation || "Deputy Manager"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold">Department</span>
                      <span className="col-span-2">: {user.department || "Accounts & Admin"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold">Location</span>
                      <span className="col-span-2">: {user.location || "Bengaluru"}</span>
                    </div>
                  </div>

                  {/* Right Column Particulars */}
                  <div className="space-y-1.5 pl-2 border-l border-dotted border-slate-300">
                    <div className="grid grid-cols-3">
                      <span className="font-bold">Standard Days</span>
                      <span className="col-span-2 font-mono">: {adj ? adj.calendarDays : 30}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold">Worked Days</span>
                      <span className="col-span-2 font-mono">: {adj ? (adj.calendarDays - adj.lopDays) : (user.status === 'PROBATION' ? '28' : '30')}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold">Leaves / Permissions</span>
                      <span className="col-span-2">: {adj ? adj.lopDays : (user.status === 'PROBATION' ? '2' : '0')}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold">UAN</span>
                      <span className="col-span-2 font-mono">: {user.bankDetails?.uan || "100987654321"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold">PF Member ID</span>
                      <span className="col-span-2 font-mono">: {user.bankDetails?.pfMemberId || "BG/BAN/98765/123"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold">PAN Card Number</span>
                      <span className="col-span-2 font-mono font-bold uppercase">: {user.bankDetails?.pan || "RSTUV3456W"}</span>
                    </div>
                    <div className="grid grid-cols-3 pt-1 border-t border-dotted border-slate-300">
                      <span className="font-bold">Bank Name</span>
                      <span className="col-span-2">: {user.bankDetails?.bankName || "Axis Bank Ltd"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold">Bank Account Number</span>
                      <span className="col-span-2 font-mono">: {user.bankDetails?.accountNumber || "9120100XXXXXXXX"}</span>
                    </div>
                  </div>

                </div>

                {/* Earnings & Deductions Tables */}
                <div className="grid grid-cols-2 border-b border-black text-[10px]">
                  
                  {/* Left Column: Earnings */}
                  <div className="border-r border-black pr-3 py-2 space-y-1.5">
                    <div className="flex justify-between font-extrabold border-b border-black pb-1.5 bg-slate-50 px-1 text-[9px] uppercase tracking-wider">
                      <span>Particulars</span>
                      <span>Amount (INR)</span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>Basic Salary & DA</span>
                      <span className="font-mono">₹ {(user.salary?.baseSalary || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>House Rent Allowance</span>
                      <span className="font-mono">₹ {(user.salary?.hra || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>Conveyance Allowance</span>
                      <span className="font-mono">₹ {(user.salary?.conveyance || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>Medical Allowance</span>
                      <span className="font-mono">₹ {(user.salary?.medical || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>Other Allowance</span>
                      <span className="font-mono">₹ {(user.salary?.otherAllowance || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-1 text-slate-400">
                      <span>Leave Encashment</span>
                      <span className="font-mono">₹ 0</span>
                    </div>
                    <div className="flex justify-between px-1 text-slate-400">
                      <span>Performance Incentives</span>
                      <span className="font-mono">₹ 0</span>
                    </div>
                    <div className={`flex justify-between px-1 ${overtimeAllowance > 0 ? 'text-black font-bold font-sans' : 'text-slate-400'}`}>
                      <span>Overtime Allowance {adj && adj.overtimeHours > 0 ? `(${adj.overtimeHours} hrs)` : ''}</span>
                      <span className="font-mono">₹ {overtimeAllowance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-1 text-slate-400">
                      <span>Others</span>
                      <span className="font-mono">₹ 0</span>
                    </div>
                    <div className="flex justify-between font-extrabold border-t border-black pt-1.5 bg-slate-50 px-1 mt-4">
                      <span>Gross Salary</span>
                      <span className="font-mono">₹ {grossMonthly.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Right Column: Deductions */}
                  <div className="pl-3 py-2 space-y-1.5">
                    <div className="flex justify-between font-extrabold border-b border-black pb-1.5 bg-slate-50 px-1 text-[9px] uppercase tracking-wider">
                      <span>Deductions</span>
                      <span>Amount (INR)</span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>EPF - Employee Provident Fund</span>
                      <span className="font-mono">₹ {(user.deductions?.epf || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>TDS Tax</span>
                      <span className="font-mono">₹ {(user.deductions?.tds || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>Professional Tax</span>
                      <span className="font-mono">₹ {(user.deductions?.profTax || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>Retention Retained</span>
                      <span className="font-mono">₹ {(user.deductions?.retentionAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between px-1 ${lopDeduction > 0 ? 'text-red-600 font-bold font-sans' : 'text-slate-400'}`}>
                      <span>Unpaid LOP Leaves {adj && adj.lopDays > 0 ? `(${adj.lopDays} days)` : ''}</span>
                      <span className="font-mono">₹ {lopDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between px-1 text-slate-400">
                      <span>Employee Loan</span>
                      <span className="font-mono">₹ 0</span>
                    </div>
                    <div className="flex justify-between px-1 text-slate-400">
                      <span>Claims</span>
                      <span className="font-mono">₹ 0</span>
                    </div>
                    <div className="flex justify-between font-extrabold border-t border-black pt-1.5 bg-slate-50 px-1 mt-[105px]">
                      <span>Total Deductions</span>
                      <span className="font-mono">₹ {totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>

                </div>

                {/* Annuals & Net Pay Bar */}
                <div className="grid grid-cols-2 gap-4 py-3 text-[10px]">
                  
                  {/* Left Column: Annually Info */}
                  <div className="space-y-1 pr-2">
                    <span className="font-extrabold border-b border-black pb-0.5 block text-[9px] uppercase tracking-wider">Annually Entitlements</span>
                    <div className="flex justify-between pt-1">
                      <span>LTA</span>
                      <span className="font-mono">₹ {(user.salary?.lta || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medical</span>
                      <span className="font-mono">₹ {(user.salary?.annualMedical || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus</span>
                      <span className="font-mono">₹ {(user.salary?.bonus || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Right Column: Net Pay block */}
                  <div className="flex flex-col justify-end pl-2">
                    <div className="border-2 border-black p-2.5 bg-slate-100 flex justify-between items-center text-xs font-black">
                      <span>Net Pay (Salary Disbursed)</span>
                      <span className="font-mono text-sm text-orange-600">₹ {netPay.toLocaleString()}</span>
                    </div>
                  </div>

                </div>

                {/* Footnote */}
                <div className="border-t border-black pt-2.5 text-center text-[8px] font-mono text-slate-500 uppercase tracking-wider">
                  This is a computer generated slip and does not require signature
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
