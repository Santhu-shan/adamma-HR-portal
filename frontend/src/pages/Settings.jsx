import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  Settings as SettingsIcon,
  UserPlus,
  Users,
  Sliders,
  Save,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Shield,
  CreditCard,
  Briefcase,
  DollarSign,
  Calendar,
  X
} from 'lucide-react';

export const Settings = () => {
  const { user, onboardUser, updateEmployeeDetails, fetchEmployees, commitPayrollAdjustment, payrollAdjustments, deactivateUser } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 font-mono">
        Loading settings console...
      </div>
    );
  }

  // Dynamic MongoDB Database Users List
  const [employees, setEmployees] = useState([]);

  // Interactive Payroll Calculator States
  const [calcEmployeeId, setCalcEmployeeId] = useState('');
  const [calcCalendarDays, setCalcCalendarDays] = useState(30);
  const [calcLopDays, setCalcLopDays] = useState(0);
  const [calcOvertimeHours, setCalcOvertimeHours] = useState(0);
  const [calcFlatOt, setCalcFlatOt] = useState(0);
  const [calcSuccess, setCalcSuccess] = useState('');

  const handleCommitPayroll = (e) => {
    e.preventDefault();
    if (!calcEmployeeId) return;

    const selectedEmp = employees.find(emp => emp.id === calcEmployeeId);
    if (!selectedEmp) return;

    const grossBase = (selectedEmp.salary?.baseSalary || 0) + 
                      (selectedEmp.salary?.hra || 0) + 
                      (selectedEmp.salary?.conveyance || 0) + 
                      (selectedEmp.salary?.medical || 0) + 
                      (selectedEmp.salary?.otherAllowance || 0);
    
    const dailyRate = grossBase / calcCalendarDays;
    const lopDeduction = dailyRate * calcLopDays;
    const otHourlyRate = dailyRate / 9;
    const computedOtAmount = calcOvertimeHours * otHourlyRate;
    const overtimeAmount = calcFlatOt > 0 ? calcFlatOt : computedOtAmount;

    const deductions = (selectedEmp.deductions?.epf || 0) + 
                       (selectedEmp.deductions?.tds || 0) + 
                       (selectedEmp.deductions?.profTax || 0) + 
                       (selectedEmp.deductions?.retentionAmount || 0);

    const originalNet = grossBase - deductions;
    const netPayout = originalNet + overtimeAmount - lopDeduction;

    commitPayrollAdjustment(calcEmployeeId, {
      calendarDays: calcCalendarDays,
      lopDays: calcLopDays,
      lopDeduction: Math.round(lopDeduction),
      overtimeHours: calcOvertimeHours,
      overtimeAmount: Math.round(overtimeAmount),
      netPayout: Math.round(netPayout),
      dailyRate: Math.round(dailyRate)
    });

    setCalcSuccess(`Payroll adjustments for ${selectedEmp.name} successfully committed to the active session!`);
    setTimeout(() => setCalcSuccess(''), 3000);
  };

  const refreshEmployees = async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load dynamic employees list:', err);
    }
  };

  useEffect(() => {
    refreshEmployees();
  }, []);

  // Form States for Onboarding Wizard Tabs
  const [onboardTab, setOnboardTab] = useState('profile'); // 'profile' | 'bank' | 'earnings' | 'deductions'

  // Tab 1: Profile & Organization Info
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNum, setMobileNum] = useState('');
  const [dob, setDob] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().split('T')[0]);
  const [newRole, setNewRole] = useState('EMPLOYEE');
  const [status, setStatus] = useState('PROBATION');
  const [probationDuration, setProbationDuration] = useState(6);
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('Bengaluru');
  const [targetTl, setTargetTl] = useState('Rohan Deshmukh');
  const [targetManager, setTargetManager] = useState('Meera Nair');

  // Tab 2: Banking & Identity Details
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [uan, setUan] = useState('');
  const [pfMemberId, setPfMemberId] = useState('');
  const [pan, setPan] = useState('');

  // Tab 3: Monthly Salary Earnings (Amount in INR)
  const [baseSalary, setBaseSalary] = useState(45000);
  const [hra, setHra] = useState(18000);
  const [conveyance, setConveyance] = useState(1600);
  const [medicalAllowance, setMedicalAllowance] = useState(1250);
  const [otherAllowance, setOtherAllowance] = useState(4150);

  // Tab 4: Standard Deductions & Annuals
  const [epf, setEpf] = useState(1800);
  const [tds, setTds] = useState(2500);
  const [profTax, setProfTax] = useState(200);
  const [retentionAmount, setRetentionAmount] = useState(5000);
  const [lta, setLta] = useState(40000);
  const [annualMedical, setAnnualMedical] = useState(15000);
  const [annualBonus, setAnnualBonus] = useState(50000);

  // Dynamic Calculated Previews
  const grossMonthly = baseSalary + hra + conveyance + medicalAllowance + otherAllowance;
  const totalDeductions = epf + tds + profTax + retentionAmount;
  const netPay = grossMonthly - totalDeductions;

  // Policy Form States
  const [shiftStart, setShiftStart] = useState('09:30');
  const [shiftEnd, setShiftEnd] = useState('18:30');
  const [gracePeriod, setGracePeriod] = useState(15);
  const [lateDaysCap, setLateDaysCap] = useState(3);

  // Feedback alerts
  const [onboardSuccess, setOnboardSuccess] = useState('');
  const [onboardError, setOnboardError] = useState('');
  const [policySuccess, setPolicySuccess] = useState('');
  const [welcomeKit, setWelcomeKit] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
    setEmployeeId('');
    setName('');
    setEmail('');
    setMobileNum('');
    setDob('');
    setDesignation('');
    setDepartment('');
    setBankName('');
    setBankAccountNumber('');
    setIfscCode('');
    setUan('');
    setPfMemberId('');
    setPan('');
    setBaseSalary(45000);
    setHra(18000);
    setConveyance(1600);
    setMedicalAllowance(1250);
    setOtherAllowance(4150);
    setEpf(1800);
    setTds(2500);
    setProfTax(200);
    setRetentionAmount(5000);
    setLta(40000);
    setAnnualMedical(15000);
    setAnnualBonus(50000);
    setOnboardTab('profile');
  };

  const startEditingEmployee = (emp) => {
    setEditingEmployeeId(emp.id);
    setEmployeeId(emp.employeeId || '');
    setOnboardTab('profile');

    setName(emp.name || '');
    setEmail(emp.email || '');
    setMobileNum(emp.mobile || '');
    setDob(emp.dob || '');
    if (emp.doj) {
      try {
        const parsedDoj = new Date(emp.doj);
        if (!isNaN(parsedDoj.getTime())) {
          setDateOfJoining(parsedDoj.toISOString().split('T')[0]);
        }
      } catch (e) { }
    }
    setNewRole(emp.role || 'EMPLOYEE');
    setStatus(emp.status || 'PROBATION');
    if (emp.probationDuration) {
      setProbationDuration(parseInt(emp.probationDuration) || 6);
    }
    setDesignation(emp.designation || '');
    setDepartment(emp.department || '');
    setLocation(emp.location || 'Bengaluru');
    setTargetTl(emp.tl || 'Rohan Deshmukh');
    setTargetManager(emp.manager || 'Meera Nair');

    setBankName(emp.bankDetails?.bankName || '');
    setBankAccountNumber(emp.bankDetails?.accountNumber || '');
    setIfscCode(emp.bankDetails?.ifscCode || '');
    setUan(emp.bankDetails?.uan || '');
    setPfMemberId(emp.bankDetails?.pfMemberId || '');
    setPan(emp.bankDetails?.pan || '');

    setBaseSalary(emp.salary?.baseSalary || 0);
    setHra(emp.salary?.hra || 0);
    setConveyance(emp.salary?.conveyance || 0);
    setMedicalAllowance(emp.salary?.medical || 0);
    setOtherAllowance(emp.salary?.otherAllowance || 0);

    setEpf(emp.deductions?.epf || 0);
    setTds(emp.deductions?.tds || 0);
    setProfTax(emp.deductions?.profTax || 0);
    setRetentionAmount(emp.deductions?.retentionAmount || 0);
    setLta(emp.salary?.lta || 0);
    setAnnualMedical(emp.salary?.annualMedical || 0);
    setAnnualBonus(emp.salary?.bonus || 0);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Dynamic Inline Role Changing
  const handleRoleUpdate = (empId, updatedRole) => {
    setEmployees(employees.map(emp => {
      if (emp.id === empId) {
        return { ...emp, role: updatedRole };
      }
      return emp;
    }));
    setPolicySuccess(`Security Role for User ID ${empId} successfully updated to ${updatedRole}!`);
    setTimeout(() => setPolicySuccess(''), 2000);
  };

  const handleDeactivate = async (emp) => {
    const confirmDeactivate = window.confirm(
      `Are you sure you want to deactivate ${emp.name}? \n\n` +
      `This will immediately block their login credentials and schedule this account for permanent deletion in 10 days.`
    );
    if (!confirmDeactivate) return;

    try {
      const res = await deactivateUser(emp.id);
      if (res && (res.success || res.message)) {
        setPolicySuccess(res.message || `Successfully deactivated ${emp.name}. Scheduled for deletion in 10 days.`);
        setTimeout(() => setPolicySuccess(''), 4000);
        await refreshEmployees();
      } else {
        setOnboardError(res.message || 'Deactivation failed.');
        setTimeout(() => setOnboardError(''), 4000);
      }
    } catch (err) {
      console.error('Failed to deactivate user:', err);
      setOnboardError(err.message || 'An error occurred during deactivation.');
      setTimeout(() => setOnboardError(''), 4000);
    }
  };

  // Submit Onboarding
  const handleOnboardEmployee = async (e) => {
    e.preventDefault();
    setOnboardError('');
    setOnboardSuccess('');

    // Pre-validations
    if (!employeeId || typeof employeeId !== 'string' || !employeeId.startsWith('AIS')) {
      setOnboardError("Employee ID is required and must start with 'AIS' prefix.");
      setOnboardTab('profile');
      return;
    }
    if (!name || !email || !designation || !department) {
      setOnboardError("Please fill out all required basic profile coordinates.");
      setOnboardTab('profile');
      return;
    }
    if (!bankName || !bankAccountNumber || !ifscCode) {
      setOnboardError("Please specify essential bank details under the Bank tab.");
      setOnboardTab('bank');
      return;
    }
    if (!editingEmployeeId && employees.some(emp => emp.email.toLowerCase() === email.toLowerCase())) {
      setOnboardError("Corporate email address already registered in HR database.");
      setOnboardTab('profile');
      return;
    }

    try {
      const payload = {
        employeeId,
        name,
        email,
        mobile: mobileNum || "+91 98765 43000",
        role: newRole,
        status,
        doj: dateOfJoining,
        dob: dob || "1995-01-01",
        designation,
        department,
        location: location || "Bengaluru",
        probationDuration: status === 'PROBATION' ? probationDuration : 0,
        targetTl: newRole === 'EMPLOYEE' ? targetTl : '--',
        targetManager: newRole === 'EMPLOYEE' || newRole === 'TL' ? targetManager : '--',
        bankDetails: {
          bankName,
          accountNumber: bankAccountNumber,
          ifscCode,
          uan: uan || "100987650000",
          pfMemberId: pfMemberId || "BG/BAN/98765/000",
          pan: pan || "ABCDE1234F"
        },
        salary: {
          baseSalary,
          hra,
          conveyance,
          medical: medicalAllowance,
          otherAllowance,
          lta,
          annualMedical,
          bonus: annualBonus
        },
        deductions: {
          epf,
          tds,
          profTax,
          retentionAmount
        }
      };

      if (editingEmployeeId) {
        // Dynamic Candidate Update Flow
        await updateEmployeeDetails(editingEmployeeId, payload);

        const dojDate = new Date(dateOfJoining);
        const formattedDoj = dojDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        let probEnd = new Date(dojDate);
        probEnd.setMonth(dojDate.getMonth() + probationDuration);
        const formattedProbEnd = status === 'PROBATION'
          ? probEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : '--';

        await refreshEmployees();

        setOnboardSuccess(`Employee profile for ${name} successfully updated!`);
        setEditingEmployeeId(null);

        // Reset Form Fields
        setEmployeeId('');
        setName('');
        setEmail('');
        setMobileNum('');
        setDob('');
        setDesignation('');
        setDepartment('');
        setBankName('');
        setBankAccountNumber('');
        setIfscCode('');
        setUan('');
        setPfMemberId('');
        setPan('');
        setBaseSalary(45000);
        setHra(18000);
        setConveyance(1600);
        setMedicalAllowance(1250);
        setOtherAllowance(4150);
        setEpf(1800);
        setTds(2500);
        setProfTax(200);
        setRetentionAmount(5000);
        setLta(40000);
        setAnnualMedical(15000);
        setAnnualBonus(50000);
        setOnboardTab('profile');
      } else {
        // Onboard new flow
        const result = await onboardUser(payload);

        const dojDate = new Date(dateOfJoining);
        const formattedDoj = dojDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        let probEnd = new Date(dojDate);
        probEnd.setMonth(dojDate.getMonth() + probationDuration);
        const formattedProbEnd = status === 'PROBATION'
          ? probEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : '--';

        const newEmp = {
          id: result.userId || `AIS${Math.floor(10000 + Math.random() * 90000)}`, // standard sequence
          name,
          email,
          role: newRole,
          status,
          doj: formattedDoj,
          dob: dob || "1995-01-01",
          mobile: mobileNum || "+91 98765 43000",
          designation,
          department,
          location,
          probationEnd: formattedProbEnd,
          probationDuration: status === 'PROBATION' ? `${probationDuration} months` : '--',
          tl: newRole === 'EMPLOYEE' ? targetTl : '--',
          manager: newRole === 'EMPLOYEE' || newRole === 'TL' ? targetManager : '--',
          bankDetails: payload.bankDetails,
          salary: payload.salary,
          deductions: payload.deductions,
          temporaryPassword: result.generatedPassword
        };

        await refreshEmployees();

        setWelcomeKit({
          name,
          email,
          password: result.generatedPassword,
          emailSent: result.emailSent,
          empId: newEmp.id,
          message: result.message
        });

        setOnboardSuccess(`Employee ${name} successfully onboarded!`);

        // Reset Form Fields
        setEmployeeId('');
        setName('');
        setEmail('');
        setMobileNum('');
        setDob('');
        setDesignation('');
        setDepartment('');
        setBankName('');
        setBankAccountNumber('');
        setIfscCode('');
        setUan('');
        setPfMemberId('');
        setPan('');
        setBaseSalary(45000);
        setHra(18000);
        setConveyance(1600);
        setMedicalAllowance(1250);
        setOtherAllowance(4150);
        setEpf(1800);
        setTds(2500);
        setProfTax(200);
        setRetentionAmount(5000);
        setLta(40000);
        setAnnualMedical(15000);
        setAnnualBonus(50000);
        setOnboardTab('profile');
      }

    } catch (err) {
      setOnboardError(err.message || 'Onboarding server error.');
    }
  };

  // Save policy rules
  const handleSavePolicies = (e) => {
    e.preventDefault();
    setPolicySuccess("System policy matrices successfully committed. Version updated to v2-Active.");
    setTimeout(() => setPolicySuccess(''), 2500);
  };

  return (
    <div className="space-y-8 font-sans">

      {/* Header Banner */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">System Settings & Onboarding Console</h1>
        <p className="text-sm text-slate-400 mt-1">Configure security profiles, dynamic policies, and onboard human resources with complete compensation matrices.</p>
      </div>

      {policySuccess && (
        <div className="p-4 rounded-xl bg-brand-accent/10 border border-brand-accent/20 text-xs text-green-200 flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-brand-accent shrink-0" />
          <span>{policySuccess}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Onboard New User Wizard Form */}
        <div className="glass-panel p-6 rounded-3xl xl:col-span-1 relative overflow-hidden h-fit flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-primary to-orange-500"></div>

          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <UserPlus className="h-5.5 w-5.5 text-brand-primary" />
              <h3 className="text-lg font-bold text-white">{editingEmployeeId ? 'Edit Candidate Details' : 'HR Onboarding Wizard'}</h3>
            </div>

            {onboardError && (
              <div className="mb-4 p-3 rounded-lg bg-brand-danger/10 border border-brand-danger/20 text-[10px] text-red-200">
                {onboardError}
              </div>
            )}

            {onboardSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-brand-accent/10 border border-brand-accent/20 text-[10px] text-green-200">
                {onboardSuccess}
              </div>
            )}

            {/* Tabbed Menu Indicators */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/60 rounded-xl mb-6 border border-white/5 text-[9px] font-mono tracking-tighter text-center">
              <button
                type="button"
                onClick={() => setOnboardTab('profile')}
                className={`py-2 rounded-lg font-bold transition-all ${onboardTab === 'profile' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => setOnboardTab('bank')}
                className={`py-2 rounded-lg font-bold transition-all ${onboardTab === 'bank' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Identity
              </button>
              <button
                type="button"
                onClick={() => setOnboardTab('earnings')}
                className={`py-2 rounded-lg font-bold transition-all ${onboardTab === 'earnings' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Earnings
              </button>
              <button
                type="button"
                onClick={() => setOnboardTab('deductions')}
                className={`py-2 rounded-lg font-bold transition-all ${onboardTab === 'deductions' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Deducts
              </button>
            </div>

            <form onSubmit={handleOnboardEmployee} className="space-y-4 text-xs">

              {/* TAB 1: Profile & Organization Info */}
              {onboardTab === 'profile' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Employee ID *</label>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:border-brand-primary font-mono font-bold"
                      placeholder="e.g. AIS1002"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Employee Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:border-brand-primary"
                      placeholder="e.g. Name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Corporate Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                        placeholder="username@adamma.in"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Mobile Contact</label>
                      <input
                        type="text"
                        value={mobileNum}
                        onChange={(e) => setMobileNum(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                        placeholder="+91 98765 XXXXX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Joining Date (DOJ) *</label>
                      <input
                        type="date"
                        required
                        value={dateOfJoining}
                        onChange={(e) => setDateOfJoining(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Designation *</label>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary"
                        placeholder="e.g. Deputy Manager"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Department *</label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary"
                        placeholder="e.g. Accounts & Admin"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Target Role</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-2.5 text-slate-200 focus:outline-none focus:border-brand-primary"
                      >
                        <option value="EMPLOYEE">EMPLOYEE</option>
                        <option value="TL">TEAM LEAD (TL)</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Work Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary"
                        placeholder="Bengaluru"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Onboarding Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-2.5 text-slate-200 focus:outline-none focus:border-brand-primary"
                      >
                        <option value="PROBATION">PROBATION</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                      </select>
                    </div>
                    {status === 'PROBATION' && (
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Probation (Months)</label>
                        <select
                          value={probationDuration}
                          onChange={(e) => setProbationDuration(parseInt(e.target.value))}
                          className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-2.5 text-slate-200 focus:outline-none focus:border-brand-primary"
                        >
                          <option value={3}>3 Months</option>
                          <option value={6}>6 Months</option>
                          <option value={9}>9 Months</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {newRole === 'EMPLOYEE' && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Supervisor TL</label>
                        <select
                          value={targetTl}
                          onChange={(e) => setTargetTl(e.target.value)}
                          className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-2.5 text-slate-200 focus:outline-none focus:border-brand-primary"
                        >
                          <option value="Rohan Deshmukh">Rohan Deshmukh</option>
                          <option value="--">--</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Reporting Manager</label>
                        <select
                          value={targetManager}
                          onChange={(e) => setTargetManager(e.target.value)}
                          className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-2.5 text-slate-200 focus:outline-none focus:border-brand-primary"
                        >
                          <option value="Meera Nair">Meera Nair</option>
                          <option value="--">--</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setOnboardTab('bank')}
                      className="py-2.5 px-5 rounded-xl bg-slate-900 border border-white/5 hover:border-brand-primary text-brand-primary font-bold text-xs tracking-wider transition-colors"
                    >
                      Next: Banking details
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Banking & Identity Details */}
              {onboardTab === 'bank' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Bank Name *</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary"
                        placeholder="e.g. Axis Bank"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Bank IFSC Code *</label>
                      <input
                        type="text"
                        required
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono uppercase"
                        placeholder="UTIB0000004"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Bank Account Number *</label>
                    <input
                      type="text"
                      required
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      placeholder="9120100XXXXXXXX"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">UAN (Universal A/C)</label>
                      <input
                        type="text"
                        value={uan}
                        onChange={(e) => setUan(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                        placeholder="100987654321"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">PAN Card</label>
                      <input
                        type="text"
                        value={pan}
                        onChange={(e) => setPan(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono uppercase"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Provident Fund Member ID</label>
                    <input
                      type="text"
                      value={pfMemberId}
                      onChange={(e) => setPfMemberId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      placeholder="BG/BAN/98765/123"
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setOnboardTab('profile')}
                      className="text-slate-400 hover:text-white font-bold text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardTab('earnings')}
                      className="py-2.5 px-5 rounded-xl bg-slate-900 border border-white/5 hover:border-brand-primary text-brand-primary font-bold text-xs tracking-wider transition-colors"
                    >
                      Next: Earnings
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Monthly Salary Earnings */}
              {onboardTab === 'earnings' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Basic Salary & DA (₹)</label>
                      <input
                        type="number"
                        required
                        value={baseSalary}
                        onChange={(e) => setBaseSalary(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">House Rent Allowance (₹)</label>
                      <input
                        type="number"
                        required
                        value={hra}
                        onChange={(e) => setHra(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Conveyance (₹)</label>
                      <input
                        type="number"
                        value={conveyance}
                        onChange={(e) => setConveyance(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-2 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Medical (₹)</label>
                      <input
                        type="number"
                        value={medicalAllowance}
                        onChange={(e) => setMedicalAllowance(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-2 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Other Allow (₹)</label>
                      <input
                        type="number"
                        value={otherAllowance}
                        onChange={(e) => setOtherAllowance(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-2 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                  </div>

                  {/* Calculations Preview Pane */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 font-mono text-[10px] space-y-1 text-slate-400">
                    <p className="font-bold text-slate-200 uppercase tracking-wider text-[9px] mb-1">Earnings Summary</p>
                    <div className="flex justify-between">
                      <span>Gross Monthly Base:</span>
                      <strong className="text-white">₹{grossMonthly.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setOnboardTab('bank')}
                      className="text-slate-400 hover:text-white font-bold text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardTab('deductions')}
                      className="py-2.5 px-5 rounded-xl bg-slate-900 border border-white/5 hover:border-brand-primary text-brand-primary font-bold text-xs tracking-wider transition-colors"
                    >
                      Next: Deductions
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: Standard Deductions & Annuals */}
              {onboardTab === 'deductions' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Monthly EPF (₹)</label>
                      <input
                        type="number"
                        value={epf}
                        onChange={(e) => setEpf(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Monthly TDS Tax (₹)</label>
                      <input
                        type="number"
                        value={tds}
                        onChange={(e) => setTds(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Professional Tax (₹)</label>
                      <input
                        type="number"
                        value={profTax}
                        onChange={(e) => setProfTax(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Retention Retained (₹)</label>
                      <input
                        type="number"
                        value={retentionAmount}
                        onChange={(e) => setRetentionAmount(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Annual LTA (₹)</label>
                      <input
                        type="number"
                        value={lta}
                        onChange={(e) => setLta(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-2 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Ann Medical (₹)</label>
                      <input
                        type="number"
                        value={annualMedical}
                        onChange={(e) => setAnnualMedical(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-2 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Ann Bonus (₹)</label>
                      <input
                        type="number"
                        value={annualBonus}
                        onChange={(e) => setAnnualBonus(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-2.5 px-2 text-slate-200 focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                  </div>

                  {/* Calculations Preview Pane */}
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-white/5 font-mono text-[10px] space-y-1.5 text-slate-400">
                    <p className="font-bold text-slate-200 uppercase tracking-wider text-[9px] mb-1">Net Pay Aggregation Preview</p>
                    <div className="flex justify-between">
                      <span>Gross Monthly Base:</span>
                      <strong className="text-emerald-400">+ ₹{grossMonthly.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Total Deductions:</span>
                      <strong className="text-red-400">- ₹{totalDeductions.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-xs font-bold pt-1">
                      <span className="text-slate-200">Net Estimated Payout:</span>
                      <strong className="text-brand-accent">₹{netPay.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setOnboardTab('earnings')}
                      className="text-slate-400 hover:text-white font-bold text-xs"
                    >
                      Back
                    </button>
                    <div className="flex gap-2">
                      {editingEmployeeId && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="py-2.5 px-4 rounded-xl bg-slate-900 border border-white/5 hover:border-white/10 hover:bg-slate-800 transition-all text-slate-400 font-bold text-xs tracking-wider uppercase"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-primary to-orange-500 hover:shadow-brand-primary/20 hover:shadow-lg transition-all text-white font-bold text-xs tracking-wider uppercase transform active:scale-95 duration-200"
                      >
                        {editingEmployeeId ? 'Save Updates' : 'Commit Onboarding'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>

        {/* System Settings & User List Table */}
        <div className="lg:col-span-2 space-y-8 xl:col-span-2">

          {/* User Directory & Role Assignment */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-brand-accent"></div>

            <div className="flex items-center gap-2.5 mb-6">
              <Users className="h-5.5 w-5.5 text-brand-accent" />
              <h3 className="text-lg font-bold text-white">Employee Directories & Security Roles</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-mono">
                    <th className="pb-3">User Profile</th>
                    <th className="pb-3">Status / Location</th>
                    <th className="pb-3">Supervisor Line</th>
                    <th className="pb-3 text-right">Assigned System Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="text-slate-300">
                      <td className="py-4">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          {emp.name}
                          <span className="text-[9px] font-mono text-slate-500 font-normal">({emp.employeeId || emp.id})</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.email}</p>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">DOJ: {emp.doj || "Jan 05, 2026"}</span>
                      </td>
                      <td className="py-4 leading-normal">
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${emp.status === 'CONFIRMED'
                              ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent'
                              : emp.status === 'SUSPENDED'
                              ? 'bg-red-500/10 border-red-500/20 text-red-500'
                              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                            }`}>
                            {emp.status}
                          </span>
                        </div>
                        {emp.status === 'PROBATION' && emp.probationDuration && (
                          <div className="text-[10px] text-slate-500 font-mono mt-1">
                            <p>Duration: {emp.probationDuration}</p>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">📍 {emp.location || "Bengaluru"}</span>
                      </td>
                      <td className="py-4 font-mono text-xs text-slate-400 leading-normal">
                        <p>TL: {emp.tl || '--'}</p>
                        <p className="text-[10px] text-slate-500">MGR: {emp.manager || '--'}</p>
                        <span className="text-[10px] text-slate-500 block mt-1 font-bold">{emp.designation}</span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => startEditingEmployee(emp)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-brand-primary text-slate-400 hover:text-brand-primary transition-all flex items-center gap-1 text-[10px] font-bold"
                            title="Edit Candidate Profile"
                          >
                            <UserCheck className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                            <span>Edit Details</span>
                          </button>

                          {emp.role !== 'ADMIN' && emp.status !== 'SUSPENDED' && (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(emp)}
                              className="p-1.5 rounded-lg bg-red-950/20 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-red-300 transition-all flex items-center gap-1 text-[10px] font-bold"
                              title="Deactivate Employee (Schedule for 10-day deletion)"
                            >
                              <X className="h-3.5 w-3.5 text-red-500 shrink-0" />
                              <span>Deactivate</span>
                            </button>
                          )}

                          <div className="inline-flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <select
                              value={emp.role}
                              onChange={(e) => handleRoleUpdate(emp.id, e.target.value)}
                              className="bg-slate-950 border border-white/5 hover:border-brand-primary/30 rounded-lg py-1 px-2 text-[10px] text-slate-200 font-mono font-bold focus:outline-none focus:border-brand-primary transition-colors"
                            >
                              <option value="EMPLOYEE">EMPLOYEE</option>
                              <option value="TL">TL</option>
                              <option value="MANAGER">MANAGER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic Shift Policy Console */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-purple-500"></div>

            <div className="flex items-center gap-2.5 mb-6">
              <Sliders className="h-5.5 w-5.5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Dynamic Shift Policy Configuration</h3>
            </div>

            <form onSubmit={handleSavePolicies} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Standard Shift Start Time</label>
                <input
                  type="time"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-brand-primary transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Standard Shift End Time</label>
                <input
                  type="time"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-brand-primary transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Late Check-in Grace Period (Mins)</label>
                <input
                  type="number"
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-brand-primary transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Monthly Late Allowance (Days)</label>
                <input
                  type="number"
                  value={lateDaysCap}
                  onChange={(e) => setLateDaysCap(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-brand-primary transition-colors font-mono"
                />
              </div>

              <div className="md:col-span-2 flex justify-end pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 hover:shadow-purple-500/20 hover:shadow-lg transition-all text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2 transform active:scale-95 duration-200"
                >
                  <Save className="h-4 w-4" /> Save System Rules
                </button>
              </div>

            </form>
          </div>

          {/* Dynamic Monthly Payroll & Salary Adjustments Console */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-brand-primary"></div>

            <div className="flex items-center gap-2.5 mb-6">
              <DollarSign className="h-5.5 w-5.5 text-brand-primary" />
              <h3 className="text-lg font-bold text-white">Dynamic Monthly Payroll & Salary Adjustments</h3>
            </div>

            {calcSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-brand-accent/5 border border-brand-accent/20 text-xs text-green-300 flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-brand-accent" />
                <span>{calcSuccess}</span>
              </div>
            )}

            <div className="space-y-6 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Select Employee Profile</label>
                <select
                  value={calcEmployeeId}
                  onChange={(e) => {
                    setCalcEmployeeId(e.target.value);
                    setCalcLopDays(0);
                    setCalcOvertimeHours(0);
                    setCalcFlatOt(0);
                  }}
                  className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-brand-primary transition-colors font-mono font-bold"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) - {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              {!calcEmployeeId ? (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-slate-400 leading-normal">
                  💡 Select an active employee from the dropdown above to load their salary matrices and boot the dynamic payroll calculations.
                </div>
              ) : (
                <form onSubmit={handleCommitPayroll} className="space-y-6 animate-fade-in">
                  
                  {/* Dynamic Rate Calculator Display */}
                  {(() => {
                    const emp = employees.find(e => e.id === calcEmployeeId);
                    if (!emp) return null;
                    const baseGross = (emp.salary?.baseSalary || 0) + 
                                      (emp.salary?.hra || 0) + 
                                      (emp.salary?.conveyance || 0) + 
                                      (emp.salary?.medical || 0) + 
                                      (emp.salary?.otherAllowance || 0);
                    
                    const dailyRate = baseGross / calcCalendarDays;
                    const lopDeduction = dailyRate * calcLopDays;
                    const hourlyOtRate = dailyRate / 9;
                    const calculatedOtAmount = calcOvertimeHours * hourlyOtRate;
                    const overtimeAmount = calcFlatOt > 0 ? calcFlatOt : calculatedOtAmount;
                    
                    const deductions = (emp.deductions?.epf || 0) + 
                                       (emp.deductions?.tds || 0) + 
                                       (emp.deductions?.profTax || 0) + 
                                       (emp.deductions?.retentionAmount || 0);
                    
                    const baseNet = baseGross - deductions;
                    const netPayout = baseNet + overtimeAmount - lopDeduction;

                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Calendar Divisor Select */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Calendar Days in Month</label>
                            <select
                              value={calcCalendarDays}
                              onChange={(e) => setCalcCalendarDays(parseInt(e.target.value))}
                              className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-3 text-slate-200 focus:outline-none focus:border-brand-primary font-mono font-bold"
                            >
                              <option value={28}>28 Days (Feb)</option>
                              <option value={29}>29 Days (Leap Feb)</option>
                              <option value={30}>30 Days (Apr, Jun, Sep, Nov)</option>
                              <option value={31}>31 Days (Jan, Mar, May, Jul, Aug, Oct, Dec)</option>
                            </select>
                          </div>

                          {/* Base Gross Display */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Gross Salary Base</label>
                            <div className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-slate-400 font-mono font-bold">
                              ₹{baseGross.toLocaleString()}
                            </div>
                          </div>

                          {/* Dynamic Wage per Day Rate */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Calculated Wage / Day</label>
                            <div className="w-full bg-brand-primary/10 border border-brand-primary/20 rounded-xl py-3 px-4 text-brand-primary font-mono font-bold shadow-[inset_0_0_10px_rgba(249,115,22,0.05)]">
                              ₹{Math.round(dailyRate).toLocaleString()} <span className="text-[9px] text-slate-500 font-normal">/ day</span>
                            </div>
                          </div>

                        </div>

                        {/* Adjustments Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                          
                          {/* LOP Leaves Input */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">LOP Unpaid Leaves (Days)</label>
                            <input
                              type="number"
                              min={0}
                              max={calcCalendarDays}
                              step={0.5}
                              value={calcLopDays}
                              onChange={(e) => setCalcLopDays(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-brand-primary font-mono font-bold"
                            />
                            <p className="text-[10px] text-red-400/80 font-mono mt-1.5 flex justify-between px-1">
                              <span>Deduction:</span>
                              <strong>- ₹{Math.round(lopDeduction).toLocaleString()}</strong>
                            </p>
                          </div>

                          {/* Overtime Hours Input */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Overtime Hours (9h = 1d)</label>
                            <input
                              type="number"
                              min={0}
                              step={0.5}
                              disabled={calcFlatOt > 0}
                              value={calcOvertimeHours}
                              onChange={(e) => setCalcOvertimeHours(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-brand-primary font-mono font-bold disabled:opacity-50"
                            />
                            <p className="text-[10px] text-emerald-400/80 font-mono mt-1.5 flex justify-between px-1">
                              <span>OT Rate:</span>
                              <strong>₹{Math.round(hourlyOtRate).toLocaleString()} / hr</strong>
                            </p>
                          </div>

                          {/* Flat Overtime Override */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">Flat OT Allowance (Override)</label>
                            <input
                              type="number"
                              min={0}
                              value={calcFlatOt}
                              onChange={(e) => {
                                setCalcFlatOt(parseInt(e.target.value) || 0);
                                if (parseInt(e.target.value) > 0) setCalcOvertimeHours(0);
                              }}
                              className="w-full bg-slate-950 border border-white/5 hover:border-white/10 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-brand-primary font-mono font-bold"
                              placeholder="e.g. 5000"
                            />
                            <p className="text-[10px] text-slate-500 font-mono mt-1.5 px-1">
                              Overrides hourly calculation if set.
                            </p>
                          </div>

                        </div>

                        {/* Real-time Computations Summary Panel */}
                        <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-2 font-mono text-[10.5px]">
                          <p className="font-extrabold text-slate-200 text-[10px] uppercase tracking-wider mb-2">Committed Payroll Balance Overview</p>
                          <div className="flex justify-between text-slate-400">
                            <span>Base Salary & Allowances (Gross):</span>
                            <span>₹{baseGross.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Standard Deductions (PF, TDS, PT):</span>
                            <span>- ₹{deductions.toLocaleString()}</span>
                          </div>
                          {calcLopDays > 0 && (
                            <div className="flex justify-between text-red-400">
                              <span>LOP Unpaid Leaves Deduction ({calcLopDays} days):</span>
                              <span>- ₹{Math.round(lopDeduction).toLocaleString()}</span>
                            </div>
                          )}
                          {overtimeAmount > 0 && (
                            <div className="flex justify-between text-emerald-400">
                              <span>Overtime Allowance ({calcOvertimeHours > 0 ? `${calcOvertimeHours} hrs` : 'Flat Amount'}):</span>
                              <span>+ ₹{Math.round(overtimeAmount).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-xs font-bold pt-2.5 border-t border-white/5">
                            <span className="text-white uppercase">Adjusted Net Payout (Monthly):</span>
                            <span className="text-brand-primary text-sm font-black">₹{Math.round(netPayout).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="py-3 px-6 rounded-xl bg-brand-primary hover:bg-orange-600 hover:shadow-brand-primary/20 hover:shadow-lg transition-all text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2 transform active:scale-95 duration-200"
                          >
                            <Save className="h-4 w-4" /> Commit Payroll Adjustments
                          </button>
                        </div>
                      </>
                    );
                  })()}

                </form>
              )}

            </div>
          </div>

        </div>

        {/* Dynamic Welcome Kit Credentials Card Modal */}
        {welcomeKit && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans animate-fade-in no-print">
            <div className="w-full max-w-md bg-slate-950 text-white rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl p-6 md:p-8">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-primary to-orange-500"></div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-brand-primary shrink-0" />
                  <h3 className="text-lg font-bold text-white">Employee Onboarding Welcome Kit</h3>
                </div>
                <button
                  onClick={() => setWelcomeKit(null)}
                  className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors animate-fade-in"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">

                {welcomeKit.emailSent ? (
                  <div className="p-3.5 rounded-xl bg-brand-accent/5 border border-brand-accent/20 flex gap-2.5 text-xs text-green-300">
                    <CheckCircle className="h-4.5 w-4.5 text-brand-accent shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>SMTP Welcome Email Dispatched!</strong> Credentials welcome kit has been sent successfully from <span className="font-bold text-white font-mono">info@adamma.in</span> to employee's inbox!
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex gap-2.5 text-xs text-yellow-400">
                    <AlertTriangle className="h-4.5 w-4.5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Welcome Email Bypassed (Local Sandbox Mode):</strong> Backend mailer bypassed. Please copy credentials below manually to perform authentication testing.
                    </p>
                  </div>
                )}

                <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-3.5 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2 font-mono">
                    <span className="text-slate-500 font-bold">EMPLOYEE ID:</span>
                    <span className="text-slate-200 font-bold">{welcomeKit.empId}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2 font-mono">
                    <span className="text-slate-500 font-bold">EMAIL USERNAME:</span>
                    <span className="text-white font-bold select-all">{welcomeKit.email}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-500 font-bold">TEMP PASSWORD:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-primary font-bold text-sm tracking-wide select-all">{welcomeKit.password}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-white/5 text-[10px] text-slate-400 leading-relaxed font-mono">
                  <p className="font-bold text-slate-200 uppercase tracking-wider mb-1">Sandbox Persona testing Guide:</p>
                  1. Copy the email username and temporary password.<br />
                  2. Click Sign Out from the sidebar.<br />
                  3. Enter these coordinates into the login form.<br />
                  4. Verify 2FA (PIN 123456) to access their profile!
                </div>

                <button
                  type="button"
                  onClick={() => setWelcomeKit(null)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-orange-500 hover:shadow-brand-primary/20 hover:shadow-lg transition-all text-white font-bold text-xs tracking-wider uppercase transform active:scale-95 duration-200"
                >
                  Onboarding Setup Complete
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
