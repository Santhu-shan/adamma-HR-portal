import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { PayrollModel } from '../models/Payroll';
import { UserModel } from '../models/User';

const router = Router();

router.get('/my', requirePermission('PAYROLL_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { year } = req.query;
    const filter: any = { employee: req.user?.id };
    if (year) filter.year = Number(year);
    const slips = await PayrollModel.find(filter).sort({ year: -1, month: -1 });
    res.status(200).json(slips);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch payslips.' });
  }
});

router.get('/my/ytd', requirePermission('PAYROLL_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const slips = await PayrollModel.find({ employee: req.user?.id, year, status: 'PAID' });
    const ytd = slips.reduce((acc, s) => ({
      gross: acc.gross + s.gross,
      net: acc.net + s.net,
      tds: acc.tds + s.tds,
      pf: acc.pf + s.pf,
      totalDeductions: acc.totalDeductions + s.totalDeductions,
    }), { gross: 0, net: 0, tds: 0, pf: 0, totalDeductions: 0 });
    res.status(200).json({ year, ytd, months: slips.length });
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to compute YTD.' });
  }
});

router.get('/employee/:id', requirePermission('PAYROLL_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const slips = await PayrollModel.find({ employee: req.params.id }).sort({ year: -1, month: -1 });
    res.status(200).json(slips);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch employee payslips.' });
  }
});

router.post('/generate', requirePermission('PAYROLL_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId, month, year } = req.body;
    const user = await UserModel.findById(employeeId);
    if (!user) return res.status(404).json({ code: 'NOT_FOUND', message: 'Employee not found.' });

    const { baseSalary, hra = 0, conveyance = 0, otherAllowance = 0 } = user.salary;
    const { epf = 0, tds = 0, profTax = 0 } = user.deductions;
    const gross = baseSalary + hra + conveyance + otherAllowance;
    const totalDeductions = epf + tds + profTax;
    const net = gross - totalDeductions;

    const slip = await PayrollModel.findOneAndUpdate(
      { employee: employeeId, month, year },
      { basic: baseSalary, hra, conveyance, specialAllowance: otherAllowance, gross, pf: epf, tds, professionalTax: profTax, totalDeductions, net, generatedBy: req.user?.id },
      { upsert: true, new: true }
    );
    res.status(201).json(slip);
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ code: 'DUPLICATE', message: 'Payslip already exists for this month.' });
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to generate payslip.' });
  }
});

router.patch('/:id/mark-paid', requirePermission('PAYROLL_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const slip = await PayrollModel.findByIdAndUpdate(req.params.id, { status: 'PAID', paidOn: new Date() }, { new: true });
    if (!slip) return res.status(404).json({ code: 'NOT_FOUND', message: 'Payslip not found.' });
    res.status(200).json(slip);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to mark payslip as paid.' });
  }
});

export default router;
