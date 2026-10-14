import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { AttendanceModel } from '../models/Attendance';
import { PolicySettingsModel } from '../models/PolicySettings';

const router = Router();

// Mark Punch (Clock-In / Clock-Out)
router.post('/mark', requirePermission('ATTENDANCE_MARK'), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { action } = req.body;
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Fetch active policy rules
    let policy = await PolicySettingsModel.findOne().sort({ version: -1 });
    if (!policy) {
      // Setup dynamic fallback defaults
      policy = new PolicySettingsModel({
        version: 1,
        shiftStartTime: "09:30",
        shiftEndTime: "18:30",
        gracePeriodMinutes: 15,
        lateAllowanceDays: 3,
        lateMinutesCap: 50,
        workingSaturdays: [1, 3, 5]
      });
      await policy.save();
    }

    let record = await AttendanceModel.findOne({ userId, date: today });

    if (action === 'CLOCK_IN') {
      if (record && record.clockIn) {
        return res.status(400).json({ code: 'ALREADY_CLOCKED_IN', message: 'Work session already initiated for today.' });
      }

      // Calculate check-in latency
      const [shiftHours, shiftMins] = policy.shiftStartTime.split(':').map(Number);
      const graceLimitMinutes = shiftHours * 60 + shiftMins + policy.gracePeriodMinutes;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let isLate = false;
      let lateMinutes = 0;

      if (currentMinutes > graceLimitMinutes) {
        isLate = true;
        lateMinutes = currentMinutes - (shiftHours * 60 + shiftMins);
      }

      if (!record) {
        record = new AttendanceModel({
          userId,
          date: today,
          clockIn: now,
          status: 'PRESENT',
          isLate,
          lateMinutes,
          source: 'WEB'
        });
      } else {
        record.clockIn = now;
        record.status = 'PRESENT';
        record.isLate = isLate;
        record.lateMinutes = lateMinutes;
      }

      await record.save();
      return res.status(201).json(record);
    } 
    
    if (action === 'CLOCK_OUT') {
      if (!record || !record.clockIn) {
        return res.status(400).json({ code: 'NOT_CLOCKED_IN', message: 'No active clock-in session found for today.' });
      }
      if (record.clockOut) {
        return res.status(400).json({ code: 'ALREADY_CLOCKED_OUT', message: 'Work session already completed for today.' });
      }

      record.clockOut = now;
      
      // Calculate working hours in decimal hours
      const diffMs = now.getTime() - record.clockIn.getTime();
      record.workingHours = parseFloat((diffMs / 3600000).toFixed(2));

      await record.save();
      return res.status(200).json(record);
    }

    res.status(400).json({ code: 'INVALID_ACTION', message: 'Operational action must be CLOCK_IN or CLOCK_OUT.' });
  } catch (error) {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Attendance marking encountered a database error.' });
  }
});

// Break cycle requests
router.post('/break', requirePermission('ATTENDANCE_MARK'), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { action } = req.body;
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const record = await AttendanceModel.findOne({ userId, date: today });
    if (!record || !record.clockIn || record.clockOut) {
      return res.status(400).json({ code: 'SESSION_INACTIVE', message: 'Must be clocked in to request break locks.' });
    }

    if (action === 'OUT') {
      if (record.isLocked) {
        return res.status(400).json({ code: 'BREAK_ACTIVE', message: 'Break cycle already active.' });
      }
      record.isLocked = true;
      record.breakSlots.push({ outTime: now });
      await record.save();
      return res.status(200).json({ locked: true, record });
    }

    if (action === 'IN') {
      if (!record.isLocked) {
        return res.status(400).json({ code: 'BREAK_INACTIVE', message: 'No active break cycle found.' });
      }
      const activeSlot = record.breakSlots[record.breakSlots.length - 1];
      activeSlot.inTime = now;
      activeSlot.durationMinutes = Math.round((now.getTime() - activeSlot.outTime.getTime()) / 60000);
      
      record.isLocked = false;
      await record.save();
      return res.status(200).json({ locked: false, record });
    }

    res.status(400).json({ code: 'INVALID_ACTION', message: 'Action must be OUT or IN.' });
  } catch (error) {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Break request failed.' });
  }
});

// Get personal punches
router.get('/my', requirePermission('ATTENDANCE_MARK'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await AttendanceModel.find({ userId: req.user?.id }).sort({ date: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to retrieve Timesheet history.' });
  }
});

export default router;
