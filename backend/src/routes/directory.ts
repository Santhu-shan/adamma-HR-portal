import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { UserModel } from '../models/User';

const router = Router();

router.get('/', requirePermission('DIRECTORY_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, department, role, status } = req.query;
    const filter: any = {};
    if (department) filter.department = department;
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { designation: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
    const employees = await UserModel.find(filter)
      .select('-password -otp -otpExpires -twoFactorSecret -bankDetails -deductions')
      .sort({ name: 1 });
    res.status(200).json(employees);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch directory.' });
  }
});

router.get('/meta', requirePermission('DIRECTORY_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departments = await UserModel.distinct('department');
    const locations = await UserModel.distinct('location');
    res.status(200).json({ departments: departments.filter(Boolean), locations: locations.filter(Boolean) });
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch directory metadata.' });
  }
});

router.get('/:id', requirePermission('DIRECTORY_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const emp = await UserModel.findById(req.params.id)
      .select('-password -otp -otpExpires -twoFactorSecret -bankDetails -deductions')
      .populate('managerId', 'name designation email')
      .populate('tlId', 'name designation email');
    if (!emp) return res.status(404).json({ code: 'NOT_FOUND', message: 'Employee not found.' });
    res.status(200).json(emp);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch employee.' });
  }
});

export default router;
