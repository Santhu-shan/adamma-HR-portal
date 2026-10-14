import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Clock, 
  Play, 
  Coffee, 
  LogOut, 
  CheckCircle, 
  AlertTriangle,
  History,
  CalendarCheck
} from 'lucide-react';

export const Attendance = () => {
  const { user } = useAuthStore();
  
  // Real-time Clock hook
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // System States
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [breakSlots, setBreakSlots] = useState([]);
  const [currentBreakStart, setCurrentBreakStart] = useState(null);
  const [lateMinutes, setLateMinutes] = useState(0);
  const [isLateEntry, setIsLateEntry] = useState(false);
  
  const [punchLogs, setPunchLogs] = useState([
    { date: "2026-05-22", status: "PRESENT", clockIn: "09:24 AM", clockOut: "06:35 PM", hours: "9.18 hrs", late: "0m" },
    { date: "2026-05-23", status: "PRESENT", clockIn: "09:28 AM", clockOut: "06:32 PM", hours: "9.06 hrs", late: "0m" },
    { date: "2026-05-24", status: "WEEK_OFF", clockIn: "--", clockOut: "--", hours: "0.00 hrs", late: "0m" }
  ]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 font-mono">
        Loading attendance desk...
      </div>
    );
  }

  const handlePunch = () => {
    const now = new Date();
    if (!isClockedIn) {
      // Clock In Logic
      const checkInStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Calculate late arrival
      const [shiftHours, shiftMins] = [9, 30]; // 09:30 AM Shift limit
      const currentHours = now.getHours();
      const currentMins = now.getMinutes();
      
      const shiftLimitTotal = shiftHours * 60 + shiftMins;
      const currentTotal = currentHours * 60 + currentMins;
      
      let lateMins = 0;
      let isLate = false;
      if (currentTotal > shiftLimitTotal + 15) { // 15 mins grace period
        lateMins = currentTotal - shiftLimitTotal;
        isLate = true;
      }
      
      setClockInTime(now);
      setIsClockedIn(true);
      setLateMinutes(lateMins);
      setIsLateEntry(isLate);
      setClockOutTime(null);
    } else {
      // Clock Out Logic
      if (isBreakActive) {
        // Automatically close break
        handleBreakToggle();
      }
      setClockOutTime(now);
      setIsClockedIn(false);
      
      // Log punch entry
      const checkInStr = clockInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const checkOutStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const elapsedHours = ((now.getTime() - clockInTime.getTime()) / 3600000).toFixed(2);
      
      const newLog = {
        date: now.toISOString().split('T')[0],
        status: isLateEntry ? "PRESENT" : "PRESENT",
        clockIn: checkInStr,
        clockOut: checkOutStr,
        hours: `${elapsedHours} hrs`,
        late: `${lateMinutes}m`
      };
      
      setPunchLogs([newLog, ...punchLogs]);
      setClockInTime(null);
    }
  };

  const handleBreakToggle = () => {
    const now = new Date();
    if (!isBreakActive) {
      // Start Break
      setIsBreakActive(true);
      setCurrentBreakStart(now);
    } else {
      // End Break
      const breakDuration = Math.round((now.getTime() - currentBreakStart.getTime()) / 60000);
      setBreakSlots([
        ...breakSlots,
        {
          outTime: currentBreakStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: `${breakDuration} mins`
        }
      ]);
      setIsBreakActive(false);
      setCurrentBreakStart(null);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Shift Attendance & Punch Desk</h1>
        <p className="text-sm text-slate-400 mt-1">Manage shift check-ins, record break locks, and trace historical logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Punch Panel Card */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between items-center text-center relative overflow-hidden h-[450px]">
          {/* Glowing Background Ring */}
          <div className={`absolute top-0 inset-x-0 h-1.5 ${isClockedIn ? 'bg-brand-accent glow-dot-green' : 'bg-brand-primary glow-dot-blue'}`}></div>
          
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Shift Clock In/Out</span>
            <h2 className="text-4xl font-extrabold text-white tracking-widest mt-6 font-mono">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>

          {/* Dynamic Punch Button */}
          <div className="my-6">
            <button
              onClick={handlePunch}
              className={`h-40 w-40 rounded-full border-4 flex flex-col items-center justify-center gap-2 transform active:scale-95 duration-200 transition-all ${
                isClockedIn 
                  ? 'border-brand-danger/30 hover:border-brand-danger bg-brand-danger/10 hover:bg-brand-danger/20 text-red-400 hover:shadow-brand-danger/30 hover:shadow-2xl' 
                  : 'border-brand-primary/30 hover:border-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary hover:shadow-brand-primary/30 hover:shadow-2xl'
              }`}
            >
              <Clock className="h-8 w-8" />
              <span className="font-bold text-xs uppercase tracking-widest">{isClockedIn ? 'Punch Out' : 'Punch In'}</span>
            </button>
          </div>

          {/* Shift Details Status Bar */}
          <div className="w-full">
            {isClockedIn ? (
              <div className="p-3.5 rounded-xl bg-brand-accent/5 border border-brand-accent/20 flex items-center justify-center gap-2.5 text-xs text-green-300">
                <CheckCircle className="h-4.5 w-4.5 text-brand-accent shrink-0" />
                <div className="text-left leading-normal">
                  <p className="font-bold text-slate-100">Clocked In</p>
                  <p className="text-[10px] text-slate-400">Punch started at: {clockInTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-center gap-2.5 text-xs text-slate-400">
                <AlertTriangle className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                <div className="text-left leading-normal">
                  <p className="font-bold text-slate-300">Offline</p>
                  <p className="text-[10px]">No active work session detected.</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Break Lock Desk */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between h-[450px]">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Break Slots Monitoring</h3>
            <p className="text-xs text-slate-400">Break locks prevent timesheet punches. Max 2 break cycles per shift.</p>
            
            {/* Break Listing */}
            <div className="space-y-3 mt-6">
              {breakSlots.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-950/40 border border-white/5 text-center text-xs text-slate-500">
                  No breaks recorded for this shift.
                </div>
              ) : (
                breakSlots.map((b, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono">Break Cycle {idx + 1}</span>
                    <span className="text-white font-bold">{b.outTime} - {b.inTime}</span>
                    <span className="px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[10px] font-bold font-mono">{b.duration}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Trigger */}
          <div>
            {isClockedIn ? (
              <button
                onClick={handleBreakToggle}
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-95 duration-200 flex items-center justify-center gap-2 ${
                  isBreakActive 
                    ? 'bg-gradient-to-r from-brand-accent to-emerald-500 hover:shadow-brand-accent/20 hover:shadow-lg text-white' 
                    : 'bg-slate-900 hover:bg-slate-850 border border-white/10 hover:border-brand-primary/30 text-brand-primary'
                }`}
              >
                <Coffee className="h-4.5 w-4.5" />
                {isBreakActive ? 'Complete Break Cycle' : 'Request Break Lock'}
              </button>
            ) : (
              <div className="p-3 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-white/5">
                🔒 Punch in to unlock break controls.
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Alerts / Late Warnings */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between h-[450px]">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Shift Policy Constraints</h3>
            <p className="text-xs text-slate-400">Enforced by active dynamic administration controls.</p>

            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5">
                <span className="text-slate-400">Shift Schedule:</span>
                <span className="text-white font-bold">09:30 AM - 06:30 PM</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5">
                <span className="text-slate-400">Grace Grace Period:</span>
                <span className="text-brand-accent font-bold">15 Minutes</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5">
                <span className="text-slate-400">Monthly Late Allotted:</span>
                <span className="text-white font-bold">3 Days</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Late Action Max:</span>
                <span className="text-brand-danger font-bold">50 Minutes Aggregate</span>
              </div>
            </div>
          </div>

          {isLateEntry && (
            <div className="p-4 rounded-xl bg-brand-danger/10 border border-brand-danger/20 flex gap-3 text-xs leading-relaxed text-red-200">
              <AlertTriangle className="h-5 w-5 text-brand-danger shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-100">Late Check-in Detected</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Punch registered at {clockInTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (+{lateMinutes}m). Please contact supervisor to avoid LOP deduction flags.</p>
              </div>
            </div>
          )}

          <div className="p-3 text-[10px] leading-relaxed text-slate-500 bg-slate-950 rounded-xl border border-white/5 text-center">
            Weekend off-days (2nd / 4th Saturdays) and custom IST Gazetted Holiday parameters seed automatically.
          </div>
        </div>

      </div>

      {/* Historical Timesheet Table */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center gap-2.5 mb-6">
          <History className="h-5 w-5 text-brand-primary" />
          <h3 className="text-lg font-bold text-white">Punch Logs History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs font-mono">
                <th className="pb-3">Reporting Date</th>
                <th className="pb-3">Punctuality Status</th>
                <th className="pb-3">Clock In</th>
                <th className="pb-3">Clock Out</th>
                <th className="pb-3">Working Duration</th>
                <th className="pb-3 text-right">Late Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {punchLogs.map((log, idx) => (
                <tr key={idx} className="text-slate-300">
                  <td className="py-4 font-mono text-slate-400">{log.date}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      log.status === 'WEEK_OFF'
                        ? 'bg-slate-900/60 border-white/5 text-slate-400'
                        : 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 font-mono">{log.clockIn}</td>
                  <td className="py-4 font-mono">{log.clockOut}</td>
                  <td className="py-4 font-mono">{log.hours}</td>
                  <td className="py-4 font-mono text-right text-slate-400">{log.late}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
