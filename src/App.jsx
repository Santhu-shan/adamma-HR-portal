import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Attendance } from "./pages/Attendance";
import { Appraisal } from "./pages/Appraisal";
import { Leave } from "./pages/Leave";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Announcements } from "./pages/Announcements";
import { Documents } from "./pages/Documents";
import { EmployeeDirectory } from "./pages/EmployeeDirectory";
import { Helpdesk } from "./pages/Helpdesk";
import { Payroll } from "./pages/Payroll";
import { Recruitment } from "./pages/Recruitment";
import { Reports } from "./pages/Reports";
import { Resignation } from "./pages/Resignation";
import { Training } from "./pages/Training";
import { Modules } from "./pages/Modules";

// Route protection component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Layout wrapper for authenticated sessions
const ActiveLayoutWrapper = ({ children }) => {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Routing */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/modules" replace /> : <Login />
          }
        />
        <Route path="/" element={<Navigate to="/modules" replace />} />

        {/* Protected Routing */}
        <Route
          path="/dashboard"
          element={
            <ActiveLayoutWrapper>
              <Dashboard />
            </ActiveLayoutWrapper>
          }
        />

        <Route
          path="/profile"
          element={
            <ActiveLayoutWrapper>
              <Profile />
            </ActiveLayoutWrapper>
          }
        />

        <Route
          path="/attendance"
          element={
            <ActiveLayoutWrapper>
              <Attendance />
            </ActiveLayoutWrapper>
          }
        />

        <Route
          path="/leaves"
          element={
            <ActiveLayoutWrapper>
              <Leave />
            </ActiveLayoutWrapper>
          }
        />

        <Route
          path="/appraisals"
          element={
            <ActiveLayoutWrapper>
              <Appraisal />
            </ActiveLayoutWrapper>
          }
        />

        <Route
          path="/modules"
          element={
            <ActiveLayoutWrapper>
              <Modules />
            </ActiveLayoutWrapper>
          }
        />

        <Route
          path="/settings"
          element={
            <ActiveLayoutWrapper>
              <Settings />
            </ActiveLayoutWrapper>
          }
        />

        <Route
          path="/announcements"
          element={
            <ActiveLayoutWrapper>
              <Announcements />
            </ActiveLayoutWrapper>
          }
        />
        <Route
          path="/documents"
          element={
            <ActiveLayoutWrapper>
              <Documents />
            </ActiveLayoutWrapper>
          }
        />
        <Route
          path="/employees"
          element={
            <ActiveLayoutWrapper>
              <EmployeeDirectory />
            </ActiveLayoutWrapper>
          }
        />
        <Route
          path="/helpdesk"
          element={
            <ActiveLayoutWrapper>
              <Helpdesk />
            </ActiveLayoutWrapper>
          }
        />
        <Route
          path="/payroll"
          element={
            <ActiveLayoutWrapper>
              <Payroll />
            </ActiveLayoutWrapper>
          }
        />
        <Route
          path="/recruitment"
          element={
            <ActiveLayoutWrapper>
              <Recruitment />
            </ActiveLayoutWrapper>
          }
        />
        <Route
          path="/reports"
          element={
            <ActiveLayoutWrapper>
              <Reports />
            </ActiveLayoutWrapper>
          }
        />
        <Route
          path="/resignation"
          element={
            <ActiveLayoutWrapper>
              <Resignation />
            </ActiveLayoutWrapper>
          }
        />
        <Route
          path="/training"
          element={
            <ActiveLayoutWrapper>
              <Training />
            </ActiveLayoutWrapper>
          }
        />
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/modules" : "/login"} replace />
          }
        />

        {/* Fallback Directives */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/modules" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
  );
}
