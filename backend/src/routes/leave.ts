import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { LeaveModel } from '../models/Leave';
import { UserModel } from '../models/User';

const router = Router();

// Apply for Leave
router.post('/apply', requirePermission('LEAVE_APPLY'), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { type, startDate, endDate, remarks, doc } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'Employee profile not resolved.' });
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const diffMs = eDate.getTime() - sDate.getTime();
    if (diffMs < 0) {
      return res.status(400).json({ code: 'INVALID_DATES', message: 'End date must occur after start date.' });
    }
    const days = Math.ceil(diffMs / (1000 * 3600 * 24)) + 1;

    // Probation EL rule check
    if (type === 'EL' && user.status === 'PROBATION') {
      return res.status(400).json({ code: 'PROBATION_BLOCK', message: 'Earned Leave (EL) accruals are locked during probation.' });
    }

    // Sick leave document constraint checks
    if (type === 'SL' && days > 3 && !doc) {
      return res.status(400).json({ 
        code: 'PROOF_REQUIRED', 
        message: 'Sick leaves exceeding 3 days require a medical certificate upload.' 
      });
    }

    // Check Leave Balance
    let balance = 0;
    if (type === 'CL') balance = user.clBalance;
    else if (type === 'EL') balance = user.elBalance;
    else if (type === 'SL') balance = user.slBalance;
    else if (type === 'COMP_OFF') balance = user.compOffBalance;

    if (type !== 'LOP' && type !== 'BEREAVEMENT') {
      if (days > balance) {
        return res.status(400).json({ 
          code: 'INSUFFICIENT_BALANCE', 
          message: `Insufficient ${type} balance. Requested: ${days}, Available: ${balance}.` 
        });
      }
      
      // Deduct balance immediately
      if (type === 'CL') user.clBalance -= days;
      else if (type === 'EL') user.elBalance -= days;
      else if (type === 'SL') user.slBalance -= days;
      else if (type === 'COMP_OFF') user.compOffBalance -= days;
      
      await user.save();
    }

    const leave = new LeaveModel({
      userId,
      type,
      startDate: sDate,
      endDate: eDate,
      days,
      remarks,
      status: 'PENDING',
      documents: doc ? [doc] : []
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to process leave application.' });
  }
});

// Approvals / Supervisor actions
router.post('/:id/approve', requirePermission('LEAVE_APPROVE'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const supervisorId = req.user?.id;
  const role = req.user?.role;

  try {
    const leave = await LeaveModel.findById(id);
    if (!leave) {
      return res.status(404).json({ code: 'LEAVE_NOT_FOUND', message: 'Requested leave record not resolved.' });
    }

    // Progression workflow checks
    if (role === 'TL') {
      leave.status = 'TL_APPROVED';
    } else if (role === 'MANAGER' || role === 'ADMIN') {
      leave.status = 'APPROVED';
    }

    leave.approvedBy.push({
      role: role as string,
      userId: supervisorId as any,
      date: new Date()
    });

    await leave.save();
    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Leave sign-off failed.' });
  }
});

// Personal logs
router.get('/my', requirePermission('LEAVE_APPLY'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await LeaveModel.find({ userId: req.user?.id }).sort({ appliedAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to load personal logs.' });
  }
});

export default router;
