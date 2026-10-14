import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { AttendanceModel } from '../models/Attendance';
import { UserModel } from '../models/User';
import { PayrollModel } from '../models/Payroll';
import { EnrollmentModel } from '../models/Training';

const router = Router();

router.get('/attendance', requirePermission('REPORTS_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { month, year, department } = req.query;
    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    let userFilter: any = {};
    if (department) userFilter.department = department;
    const users = await UserModel.find(userFilter).select('_id name department');
    const userIds = users.map(u => u._id);

    const records = await AttendanceModel.find({ userId: { $in: userIds }, date: { $gte: startDate, $lt: endDate } });

    const summary = users.map(user => {
      const userRecords = records.filter(r => r.userId.toString() === user._id.toString());
      return {
        employee: { id: user._id, name: user.name, department: user.department },
        present: userRecords.filter(r => r.status === 'PRESENT').length,
        absent: userRecords.filter(r => r.status === 'ABSENT').length,
        late: userRecords.filter(r => r.isLate).length,
        totalHours: userRecords.reduce((s, r) => s + r.workingHours, 0).toFixed(2),
      };
    });
    res.status(200).json({ month, year, department, summary });
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to generate attendance report.' });
  }
});

router.get('/headcount', requirePermission('REPORTS_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const total = await UserModel.countDocuments({ status: { $nin: ['TERMINATED'] } });
    const byDept = await UserModel.aggregate([
      { $match: { status: { $nin: ['TERMINATED'] } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const byRole = await UserModel.aggregate([
      { $match: { status: { $nin: ['TERMINATED'] } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const recentJoins = await UserModel.countDocuments({ dateOfJoining: { $gte: new Date(Date.now() - 30 * 86400000) } });
    res.status(200).json({ total, byDepartment: byDept, byRole, recentJoins });
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to generate headcount report.' });
  }
});

router.get('/payroll-mis', requirePermission('REPORTS_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { month, year } = req.query;
    const filter: any = {};
    if (month) filter.month = month;
    if (year) filter.year = Number(year);
    const slips = await PayrollModel.find(filter).populate('employee', 'name department designation');
    const totals = slips.reduce((acc, s) => ({
      gross: acc.gross + s.gross,
      net: acc.net + s.net,
      tds: acc.tds + s.tds,
      pf: acc.pf + s.pf,
      totalDeductions: acc.totalDeductions + s.totalDeductions,
    }), { gross: 0, net: 0, tds: 0, pf: 0, totalDeductions: 0 });
    res.status(200).json({ month, year, employees: slips.length, totals, slips });
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to generate payroll MIS.' });
  }
});

router.get('/training-completion', requirePermission('REPORTS_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const byDept = await EnrollmentModel.aggregate([
      { $lookup: { from: 'users', localField: 'employee', foreignField: '_id', as: 'emp' } },
      { $unwind: '$emp' },
      { $group: { _id: '$emp.department', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$progress', 100] }, 1, 0] } } } },
      { $project: { department: '$_id', total: 1, completed: 1, rate: { $multiply: [{ $divide: ['$completed', '$total'] }, 100] } } },
    ]);
    res.status(200).json(byDept);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to generate training report.' });
  }
});

export default router;
