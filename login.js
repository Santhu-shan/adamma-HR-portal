import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, Cpu, Activity, Globe, Sun, Moon, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Login = () => {
  const { login, verifyOtp, forgotPassword } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState('dark'); // 'light' | 'dark' | 'violet'

  // OTP Verification Flow state coordinates
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');

  // Forgot Password Recovery states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Helper to apply classes cleanly
  const applyTheme = (t) => {
    document.documentElement.classList.remove('dark', 'theme-violet');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (t === 'violet') {
      document.documentElement.classList.add('theme-violet');
    }
  };

  // Synchronize theme with local storage & DOM root
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const cycleTheme = () => {
    let nextTheme = 'dark';
    if (theme === 'dark') {
      nextTheme = 'violet';
    } else if (theme === 'violet') {
      nextTheme = 'light';
    } else {
      nextTheme = 'dark';
    }
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Inferred role for backward compatibility in mock fallback sandbox mode
    const emailLower = email.toLowerCase().trim();
    let inferredRole = 'EMPLOYEE';
    if (emailLower.includes('admin')) inferredRole = 'ADMIN';
    else if (emailLower.includes('manager') || emailLower.includes('meera')) inferredRole = 'MANAGER';
    else if (emailLower.includes('tl') || emailLower.includes('rohan')) inferredRole = 'TL';

    try {
      const res = await login(inferredRole, email, password);
      if (res && res.otpRequired) {
        setShowOtpInput(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication sequence failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await forgotPassword(email);
      if (res && res.success) {
        setSuccessMessage(res.message || 'A new password has been successfully generated and dispatched to your email.');
      }
    } catch (err) {
      setError(err.message || 'Failed to process password recovery request.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyOtp(email, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-1 bg-slate-50 dark:bg-[#04060f] font-sans relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 h-[40rem] w-[40rem] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[40rem] w-[40rem] rounded-full bg-orange-500/5 blur-[150px] pointer-events-none"></div>
      
      
      
      {/* Floating theme toggle button at top right */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={cycleTheme} 
          className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 shadow-sm hover:shadow"
          title={`Theme: ${theme === 'dark' ? 'Dark' : theme === 'violet' ? 'Amethyst Violet' : 'Light'} (Click to cycle)`}
        >
          {theme === 'light' && <Sun className="h-5 w-5 text-orange-500" />}
          {theme === 'dark' && <Moon className="h-5 w-5 text-brand-primary" />}
          {theme === 'violet' && <Sparkles className="h-5 w-5 text-fuchsia-400 animate-pulse" />}
        </button>
      </div>
      

      {/* LEFT PANE: Premium Brand Canvas & Dynamic Live Uptime Stats Ticker */}
      <div className="lg:col-span-5 flex-col justify-between p-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#090d1e] dark:to-[#03050a] border-r border-slate-200 dark:border-white/5 relative overflow-hidden transition-colors duration-300">
        
        {/* Radial grid mesh backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <img src={logoImg} alt="ADAMMA Logo" className="h-10 w-10 object-contain hover:scale-105 transition-transform duration-300" />
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-widest leading-none">ADAMMA</h1>
            <p className="text-[9px] text-brand-primary font-mono font-bold tracking-widest mt-0.5">HR WORKFORCE</p>
          </div>
        </div>

            {/* RIGHT PANE: Interactive Authentication Form Panel */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 md: relative transition-colors duration-300">
        {/* Central Core Branding Message */}
        <div className="my-auto space-y-6 relative z-10 max-w-sm">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.30]">
            The Enterprise <br />
            <span className="bg-gradient-to-r from-brand-primary to-orange-400 bg-clip-text text-transparent">Workforce Engine</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            A state-of-the-art console configured to orchestrate company directories, dynamic shift policies, monthly leave accruals, and performance calibration with unified RBAC.
          </p>
        </div>
        
        {/* Authentication Card Panel */}
        <div className="w-full max-w-md glass-panel bg-white/80 dark:bg-slate-900/40 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl relative z-10 transition-all duration-300 hover:border-brand-primary/20 animate-fadeIn">
          
          {showForgotPassword ? (
            <>
              {/* Recovery Headline */}
              <div className="mb-8 text-center sm:text-left animate-fadeIn">
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Password Recovery</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Enter your registered corporate email ID. The system will automatically generate a new secure temporary password and dispatch it via Microsoft Graph.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-xs text-red-200 animate-shake">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 animate-fadeIn">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                
                {/* Email Address */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all duration-300 font-mono"
                      placeholder="name@adamma.in"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-orange-500 hover:shadow-brand-primary/20 hover:shadow-lg transition-all text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 transform active:scale-95 duration-200 mt-2"
                >
                  {loading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>Generate & Email Password <ArrowRight className="h-4.5 w-4.5" /></>
                  )}
                </button>

                {/* Back to login credentials */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-[10px] text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-brand-primary font-bold font-mono transition-colors uppercase tracking-wider"
                  >
                    ← Back to Login Credentials
                  </button>
                </div>

              </form>
            </>
          ) : !showOtpInput ? (
            <>
              {/* Headline */}
              <div className="mb-8 text-center sm:text-left">
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">System Authorization</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enter your corporate credentials to access the engine console.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-xs text-red-200 animate-shake">
                  <div>{error}</div>
                  {error.includes('credentials') && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError('');
                        setSuccessMessage('');
                      }}
                      className="block mt-2.5 font-black text-brand-primary hover:underline font-mono uppercase text-[9px] tracking-wider"
                    >
                      Forgot Password? Reset and email it now →
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                
                {/* Email Address */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all duration-300 font-mono"
                      placeholder="name@adamma.in"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError('');
                        setSuccessMessage('');
                      }}
                      className="text-[10px] text-brand-primary hover:text-brand-primary/80 font-bold font-mono transition-colors uppercase tracking-wider"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all duration-300 font-mono"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-orange-500 hover:shadow-brand-primary/20 hover:shadow-lg transition-all text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 transform active:scale-95 duration-200 mt-2"
                >
                  {loading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>Authorize Access <ArrowRight className="h-4.5 w-4.5" /></>
                  )}
                </button>

              </form>
            </>
          ) : (
            <>
              {/* OTP Headline */}
              <div className="mb-8 text-center sm:text-left animate-fadeIn">
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Security Verification</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  We have dispatched a 6-digit verification code to <b>{email}</b> via Microsoft Graph. Enter it below to authorize this session.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-xs text-red-200 animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                
                {/* OTP Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Verification Code (OTP)</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-lg text-center tracking-[8px] font-black text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all duration-300 font-mono"
                      placeholder="000000"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-orange-500 hover:shadow-brand-primary/20 hover:shadow-lg transition-all text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 transform active:scale-95 duration-200 mt-2"
                >
                  {loading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>Verify & Access Console <ArrowRight className="h-4.5 w-4.5" /></>
                  )}
                </button>

                {/* Back to credentials */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp('');
                      setError('');
                    }}
                    className="text-[10px] text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-brand-primary font-bold font-mono transition-colors uppercase tracking-wider"
                  >
                    ← Back to Login Credentials
                  </button>
                </div>

              </form>
            </>
          )}
        </div>

      </div>

        

        {/* Live System Performance KPIs */}
        <div className="border-t border-slate-200 dark:border-white/5 pt-8 relative z-10">
          <div className="grid grid-cols-3 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-white/10 hover:bg-white/70 dark:hover:bg-white/[0.05] group">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Activity className="h-3.5 w-3.5 text-brand-primary group-hover:animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Headcount</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">45 Active</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-white/10 hover:bg-white/70 dark:hover:bg-white/[0.05] group">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Cpu className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Platform</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">99.98% SLA</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-white/10 hover:bg-white/70 dark:hover:bg-white/[0.05] group">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Globe className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Payroll</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">Disbursed</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      

    </div>
  );
};
this is the current login page ,it absolutely works fine with all the logic and workflow, i don't want to edit any logic it already does, what i want is to make the login page different from the traditional method, want to make it feel like the new era of AI website development, so i want to make the static page feels more fabulous with scroll animation, hover animation, some glossy effects and the layout more responsive, give some ideas for that with this existing code