import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";

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

const Reveal = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

export const Modules = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <h2 className="text-5xl font-bold text-center mb-20">HRMS Modules</h2>

      <div className="grid md:grid-cols-4 gap-8">
        {allowedMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Reveal key={item.name}>
              <div
                onClick={() => navigate(item.path)}
                className="cursor-pointer rounded-3xl border border-white/10 p-8 bg-black/50 backdrop-blur-lg hover:bg-white/10 transition"
              >
                <motion.div
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.5 }}
                  className="cursor-pointer rounded-3xl border border-black/50 p-8 bg-black/10 backdrop-blur-lg hover:bg-orange/10 transition duration-50"
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-10 w-10 mb-6 text-brand-primary" />
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-slate-400">Access {item.name}</p>
                </motion.div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
};
