import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import logoImg from "../assets/logo.png";
import { motion } from "framer-motion";

import {
  FileText,
  Users,
  Briefcase,
  DollarSign,
  ClipboardList,
  FileMinus,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  CalendarCheck,
  CalendarOff,
  Award,
  Settings,
  LogOut,
  Bell,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  LayoutGrid,
} from "lucide-react";

export const Layout = ({ children }) => {
  const { user, logout, unreadAnnouncementsCount, fetchAnnouncements } =
    useAuthStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  const Reveal = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      {children}
    </motion.div>
  );

  const applyTheme = (t) => {
    document.documentElement.classList.remove("dark", "theme-violet");
    if (t === "dark") document.documentElement.classList.add("dark");
    else if (t === "violet")
      document.documentElement.classList.add("theme-violet");
  };
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    if (!user) return;

    const hasSeenIntro = localStorage.getItem(`intro_seen_${user.id}`);

    if (!hasSeenIntro) {
      setShowIntro(true);
    }
  }, [user]);
  const handleCloseIntro = () => {
    if (user?.id) {
      localStorage.setItem(`intro_seen_${user.id}`, "true");
    }
    setShowIntro(false);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (user) fetchAnnouncements().catch(console.error);
  }, [user]);

  const cycleTheme = () => {
    const nextTheme =
      theme === "dark" ? "violet" : theme === "violet" ? "light" : "dark";

    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ["ADMIN", "MANAGER", "TL", "EMPLOYEE"],
    },
    {
      name: "My Profile",
      icon: User,
      path: "/profile",
      roles: ["ADMIN", "MANAGER", "TL", "EMPLOYEE"],
    },
    {
      name: "Attendance",
      icon: CalendarCheck,
      path: "/attendance",
      roles: ["ADMIN", "MANAGER", "TL", "EMPLOYEE"],
    },
    {
      name: "Leaves & Holidays",
      icon: CalendarOff,
      path: "/leaves",
      roles: ["ADMIN", "MANAGER", "TL", "EMPLOYEE"],
    },
    {
      name: "Performance Appraisal",
      icon: Award,
      path: "/appraisals",
      roles: ["ADMIN", "MANAGER", "TL", "EMPLOYEE"],
    },
    {
      name: "System Settings",
      icon: Settings,
      path: "/settings",
      roles: ["ADMIN"],
    },
    {
      name: "Documents",
      icon: FileText,
      path: "/documents",
      roles: ["ADMIN", "MANAGER", "TL", "EMPLOYEE"],
    },
    {
      name: "Employee Directory",
      icon: Users,
      path: "/employees",
      roles: ["ADMIN", "MANAGER", "TL", "EMPLOYEE"],
    },
    {
      name: "Helpdesk",
      icon: HelpCircle,
      path: "/helpdesk",
      roles: ["ADMIN", "MANAGER", "TL", "EMPLOYEE"],
    },
    {
      name: "Payroll",
      icon: DollarSign,
      path: "/payroll",
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Recruitment",
      icon: Briefcase,
      path: "/recruitment",
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Reports",
      icon: ClipboardList,
      path: "/reports",
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Resignation",
      icon: FileMinus,
      path: "/resignation",
      roles: ["ADMIN", "MANAGER", "TL", "EMPLOYEE"],
    },
    {
      name: "Training",
      icon: GraduationCap,
      path: "/training",
      roles: ["ADMIN", "MANAGER", "TL", "EMPLOYEE"],
    },
  ];

  const allowedMenuItems = user
    ? menuItems.filter((item) => item.roles.includes(user.role))
    : [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-white/5 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={logoImg} className="h-8 w-8" />
          <div className="leading-tight">
            <p className="font-bold text-sm">ADAMMA</p>
            <p className="text-[10px] text-brand-primary tracking-widest">
              HRMS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={cycleTheme} className="p-2">
            {theme === "light" && <Sun className="h-5 w-5 text-orange-400" />}
            {theme === "dark" && (
              <Moon className="h-5 w-5 text-brand-primary" />
            )}
            {theme === "violet" && (
              <Sparkles className="h-5 w-5 text-fuchsia-400" />
            )}
          </button>

          <button
            onClick={() => navigate("/announcements")}
            className="relative p-2"
          >
            <Bell className="h-5 w-5" />
            {unreadAnnouncementsCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 px-1 rounded-full">
                {unreadAnnouncementsCount}
              </span>
            )}
          </button>

          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-slate-950 overflow-y-auto">
          <div className="flex flex-col p-4">
            {allowedMenuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 p-4 rounded-lg hover:bg-white/5"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-[1600px] mx-auto w-full overflow-y-auto">
          {/* HEADER SECTION */}
          
          <div className="px-6 py-8 border-b border-white/5 relative overflow-hidden">
            <div className="absolute right-6 top-6 flex items-center gap-3">
              <div className="text-right">
                <p className="font-bold tracking-wide">ADAMMA</p>
                <p className="text-[10px] text-brand-primary">HR WORKFORCE</p>
              </div>
              <img src={logoImg} className="h-12 w-12" />
            </div>
          </div>

          {children}
          {/* Bottom spacer for floating taskbar */}
          <div className="h-28 md:h-20" />

          {/* FLOATING TASKBAR */}
          <nav
            className={`hidden md:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-50 backdrop-blur-md border shadow-lg rounded-2xl px-3 py-2 transition-colors duration-300 ${
              theme === "light"
                ? "bg-white/80 border-slate-200"
                : "bg-slate-950/80 border-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              {/* MENU ITEMS */}
              <button
                onClick={() => navigate("/modules")}
                className="relative w-14 h-14 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
              >
                <LayoutGrid className="h-6 w-6" />
                <span className="absolute bottom-[-18px] text-[10px] text-slate-400">
                  Modules
                </span>
              </button>
              {allowedMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`relative group flex items-center justify-center w-14 h-14 rounded-xl transition ${
                      isActive
                        ? theme === "light"
                          ? "bg-slate-200 text-blue-600"
                          : "bg-white/10 text-brand-primary"
                        : theme === "light"
                          ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    
                    <Icon className="h-6 w-6" />

                    <span
                      className={`absolute bottom-16 scale-0 group-hover:scale-100 transition px-2 py-1 text-[10px] rounded-md whitespace-nowrap shadow-lg ${
                        theme === "light"
                          ? "bg-white text-slate-800 border border-slate-200"
                          : "bg-black text-white"
                      }`}
                    >
                      {item.name}
                    </span>
                    

                    {isActive && (
                      <span
                        className={`absolute -bottom-1 h-1.5 w-1.5 rounded-full ${
                          theme === "light" ? "bg-blue-600" : "bg-brand-primary"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
              

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-14 h-14 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut className="h-6 w-6" />
                Exit
              </button>

              {/* THEME + NOTIFICATIONS */}
              <button
                onClick={cycleTheme}
                className="w-14 h-14 flex items-center justify-center"
              >
                {theme === "dark" && <Moon />}
                {theme === "light" && <Sun />}
                {theme === "violet" && <Sparkles />}
              </button>

              <button
                onClick={() => navigate("/announcements")}
                className="relative w-14 h-14 flex items-center justify-center"
              >
                <Bell />
                {unreadAnnouncementsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] px-1 rounded-full">
                    {unreadAnnouncementsCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    {user?.role}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-md bg-slate-800 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              </div>
            </div>
          </nav>
        </main>
      </div>
    </div>
  );
};
