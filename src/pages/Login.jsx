import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  Cpu,
  Activity,
  Globe,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import logoImg from "../assets/logo.png";

export default function Logo() {
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const lastX = useRef(0);

  const onPointerDown = (e) => {
    setDragging(true);
    lastX.current = e.clientX || e.touches?.[0]?.clientX;
  };

  const onPointerMove = (e) => {
    if (!dragging) return;

    const x = e.clientX || e.touches?.[0]?.clientX;
    const delta = x - lastX.current;

    setRotation((prev) => prev + delta * 0.5);
    lastX.current = x;
  };
  const onPointerUp = () => {
    setDragging(false);
  };
 return (
    <div
      className="relative flex items-center justify-center"
      onMouseDown={onPointerDown}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onMouseLeave={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
    >
      {/* Glow background */}
      <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-orange-400/30 via-brand-primary/30 to-fuchsia-500/30 rounded-full animate-pulse"></div>

      <img
        src={logoImg}
        alt="ADAMMA Logo"
        className={`h-28 w-28 object-contain relative z-10 transition-transform duration-100 ${
          introDone ? "scale-100 opacity-100" : "scale-[2.2] opacity-0"
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          animation: dragging
            ? "none"
            : "spin360 12s linear infinite",
        }}
      />
    </div>
  );
}

export const Login = () => {
  const [introDone, setIntroDone] = useState(true);
  const { login, verifyOtp, forgotPassword } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState("dark"); // 'light' | 'dark' | 'violet'

  // OTP Verification Flow state coordinates
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");

  // Forgot Password Recovery states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Helper to apply classes cleanly
  const applyTheme = (t) => {
    document.documentElement.classList.remove("dark", "theme-violet");
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else if (t === "violet") {
      document.documentElement.classList.add("theme-violet");
    }
  };

  // Synchronize theme with local storage & DOM root
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);
  useEffect(() => {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
    }));

    let animationId;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fill();
      }

      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];

          const dist = Math.hypot(a.x - b.x, a.y - b.y);

          if (dist < 140) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,120,0,${1 - dist / 140})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show-section");
          }
        });
      },
      { threshold: 0.15 },
    );

    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const cycleTheme = () => {
    let nextTheme = "dark";
    if (theme === "dark") {
      nextTheme = "violet";
    } else if (theme === "violet") {
      nextTheme = "light";
    } else {
      nextTheme = "dark";
    }
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Inferred role for backward compatibility in mock fallback sandbox mode
    const emailLower = email.toLowerCase().trim();
    let inferredRole = "EMPLOYEE";
    if (emailLower.includes("admin")) inferredRole = "ADMIN";
    else if (emailLower.includes("manager") || emailLower.includes("meera"))
      inferredRole = "MANAGER";
    else if (emailLower.includes("tl") || emailLower.includes("rohan"))
      inferredRole = "TL";

    try {
      const res = await login(inferredRole, email, password);
      if (res && res.otpRequired) {
        setShowOtpInput(true);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Authentication sequence failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await forgotPassword(email);
      if (res && res.success) {
        setSuccessMessage(
          res.message ||
            "A new password has been successfully generated and dispatched to your email.",
        );
      }
    } catch (err) {
      setError(err.message || "Failed to process password recovery request.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await verifyOtp(email, otp);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target.closest(".top-bar")) return;

        setIntroDone(true);
        document
          .getElementById("login-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }}
      className="min-h-screen grid grid-cols-1 bg-slate-50 dark:bg-[#04060f] font-sans relative isolate overflow-hidden transition-colors duration-300"
    >
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,120,0,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(0,200,255,0.14),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(180,0,255,0.12),transparent_50%)] opacity-60" />
      <canvas
        id="particle-canvas"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 h-[40rem] w-[40rem] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[40rem] w-[40rem] rounded-full bg-orange-500/5 blur-[150px] pointer-events-none"></div>

      {/* Floating theme toggle button at top right */}
      <div className="top-bar fixed top-0 left-0 right-0 z-40 flex justify-center pt-6">
        <div
          className="
    flex
    items-center
    gap-8
    px-6
    py-3
    rounded-2xl
    backdrop-blur-xl
    bg-white/70
    dark:bg-slate-900/50
    border
    border-slate-200
    dark:border-white/10
    shadow-xl
  "
        >
          <img src={logoImg} alt="ADAMMA" className="h-8 w-8 object-contain" />

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-primary transition-colors"
          >
            Home
          </button>

          <button
            onClick={() =>
              document
                .getElementById("features-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-primary transition-colors"
          >
            Features
          </button>

          <button
            onClick={() =>
              document
                .getElementById("stats-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-primary transition-colors"
          >
            Stats
          </button>

          <button
            onClick={() =>
              document
                .getElementById("login-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="
        px-4
        py-2
        rounded-xl
        bg-gradient-to-r
        from-brand-primary
        to-orange-500
        text-white
        text-sm
        font-bold
      "
          >
            Login
          </button>
        </div>
      </div>
      <div className="fixed top-8 right-8 z-50">
        <button
          onClick={cycleTheme}
          className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 shadow-sm hover:shadow"
          title={`Theme: ${theme === "dark" ? "Dark" : theme === "violet" ? "Amethyst Violet" : "Light"} (Click to cycle)`}
        >
          {theme === "light" && <Sun className="h-5 w-5 text-orange-500" />}
          {theme === "dark" && <Moon className="h-5 w-5 text-brand-primary" />}
          {theme === "violet" && (
            <Sparkles className="h-5 w-5 text-fuchsia-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* LEFT PANE: Premium Brand Canvas & Dynamic Live Uptime Stats Ticker */}
      <div
        id="hero-section"
        className="lg:col-span-5 flex-col justify-between p-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#090d1e] dark:to-[#03050a] border-r border-slate-200 dark:border-white/5 relative overflow-hidden transition-colors duration-300"
      >
        {/* Radial grid mesh backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Brand Header */}
        <section
          id="features-section"
          className={`reveal-section min-h-screen flex flex-col items-center justify-center px-6 relative z-10 transition-all duration-1000 ${
            introDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="relative mb-8 perspective-[1000px]">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-orange-400/30 via-brand-primary/30 to-fuchsia-500/30 rounded-full animate-pulse"></div>

            <img
              src={logoImg}
              alt="ADAMMA Logo"
              className={`h-28 w-28 object-contain relative z-10 transform-gpu transition-all duration-1000 ease-out ${
                introDone ? "scale-100 opacity-100" : "scale-[2.2] opacity-0"
              } animate-[float_6s_ease-in-out_infinite]`}
            />
          </div>

          <div
            className={`text-center max-w-5xl transition-all duration-1000 delay-300 ${
              introDone
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="mb-4">
              <span className="px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold tracking-[0.3em] uppercase">
                Enterprise Workforce Platform
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight text-slate-900 dark:text-white">
              Workforce
              <span className="block bg-gradient-to-r from-brand-primary via-orange-400 to-orange-500 bg-clip-text text-transparent">
                Engine
              </span>
            </h1>

            <p className="max-w-2xl mx-auto mt-8 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Adamma Info Services is a Bengaluru-based ISO 27001 certified
              background verification company specializing in end-to-end
              employee screening, identity validation, and workforce risk
              intelligence. We help organizations hire with confidence through
              verified, data-backed insights across employment, education,
              criminal, and identity checks.
            </p>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Attendance Management
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Mark daily attendance, track working hours, shifts, and
                  real-time presence monitoring.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Leave & Holiday Management
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Apply, approve, and track leaves with automated balance
                  calculation and holiday calendar sync.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Payroll & Salary Processing
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Automated salary calculation, payslips, deductions, and
                  monthly payroll management.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Employee Self Service (ESS)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Employees can view profiles, download payslips, update
                  details, and manage requests.
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                document
                  .getElementById("login-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-12 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-primary to-orange-500 text-white font-bold shadow-xl hover:scale-105 transition-all duration-300"
            >
              Access Console
            </button>
          </div>

          <div className="absolute bottom-10 animate-bounce text-slate-400">
            ↓
          </div>
        </section>

        {/* RIGHT PANE: Interactive Authentication Form Panel */}
        <div className="lg:col-span-7 flex items-center justify-center p-6 md: relative transition-colors duration-300">
          {/* Central Core Branding Message */}
          <div className="my-auto space-y-6 relative z-10 max-w-sm">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.30]">
              The Enterprise <br />
              <span className="bg-gradient-to-r from-brand-primary to-orange-400 bg-clip-text text-transparent">
                Workforce Engine
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              A state-of-the-art console configured to orchestrate company
              directories, dynamic shift policies, monthly leave accruals, and
              performance calibration with unified RBAC.
            </p>
          </div>

          {/* Authentication Card Panel */}
          <section id="login-section" className="reveal-section">
            <div className="w-full max-w-md glass-panel bg-white/80 dark:bg-slate-900/40 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl relative z-10 transition-all duration-300 hover:border-brand-primary/20 animate-fadeIn">
              {showForgotPassword ? (
                <>
                  {/* Recovery Headline */}
                  <div className="mb-8 text-center sm:text-left animate-fadeIn">
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Password Recovery
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Enter your registered corporate email ID. The system will
                      automatically generate a new secure temporary password and
                      dispatch it via Microsoft Graph.
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

                  <form
                    onSubmit={handleForgotPasswordSubmit}
                    className="space-y-6"
                  >
                    {/* Email Address */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                        Email Address
                      </label>
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
                        <>
                          Generate & Email Password{" "}
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </button>

                    {/* Back to login credentials */}
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setError("");
                          setSuccessMessage("");
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
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      System Authorization
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Enter your corporate credentials to access the engine
                      console.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-xs text-red-200 animate-shake">
                      <div>{error}</div>
                      {error.includes("credentials") && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(true);
                            setError("");
                            setSuccessMessage("");
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
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                        Email Address
                      </label>
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
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(true);
                            setError("");
                            setSuccessMessage("");
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
                          title={
                            showPassword ? "Hide password" : "Show password"
                          }
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
                        <>
                          Authorize Access{" "}
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* OTP Headline */}
                  <div className="mb-8 text-center sm:text-left animate-fadeIn">
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Security Verification
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      We have dispatched a 6-digit verification code to{" "}
                      <b>{email}</b> via Microsoft Graph. Enter it below to
                      authorize this session.
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
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                        Verification Code (OTP)
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, ""))
                          }
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
                        <>
                          Verify & Access Console{" "}
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </button>

                    {/* Back to credentials */}
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOtpInput(false);
                          setOtp("");
                          setError("");
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
          </section>
        </div>

        {/* Live System Performance KPIs */}
        <div
          id="stats-section"
          className="border-t border-slate-200 dark:border-white/5 pt-8 relative z-10"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-white/10 hover:bg-white/70 dark:hover:bg-white/[0.05] group">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Activity className="h-3.5 w-3.5 text-brand-primary group-hover:animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">
                  Headcount
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
                  120+ Employees Managed
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-white/10 hover:bg-white/70 dark:hover:bg-white/[0.05] group">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Cpu className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">
                  Platform
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
                  System Reliability
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-white/10 hover:bg-white/70 dark:hover:bg-white/[0.05] group">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Globe className="h-3.5 w-3.5 text-brand-primary" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">
                  Payroll
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
                  Monthly Processed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
