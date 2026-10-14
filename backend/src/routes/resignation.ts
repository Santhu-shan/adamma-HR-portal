import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { ResignationModel } from '../models/Resignation';

const KT_ITEMS = [
  'Document all active project processes',
  'Transfer client communication threads',
  'Update team wiki / knowledge base',
  'Handover pending BGV case files',
  'Revoke third-party tool access requests',
  'Return company laptop & accessories',
  'Return ID card & access badge',
  'Settle pending expense claims',
];

const router = Router();

router.get('/my', requirePermission('RESIGNATION_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const record = await ResignationModel.findOne({ employee: req.user?.id }).sort({ createdAt: -1 });
    res.status(200).json(record || null);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch resignation.' });
  }
});

router.get('/all', requirePermission('RESIGNATION_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const records = await ResignationModel.find()
      .populate('employee', 'name employeeId department designation')
      .sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch resignations.' });
  }
});

const router2 = Router();

router2.get('/my', requirePermission('RESIGNATION_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const record = await ResignationModel.findOne({ employee: req.user?.id }).sort({ createdAt: -1 });
    res.status(200).json(record || null);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch resignation.' });
  }
});

router2.get('/all', requirePermission('RESIGNATION_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const records = await ResignationModel.find()
      .populate('employee', 'name employeeId department designation')
      .sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch resignations.' });
  }
});

router2.post('/', requirePermission('RESIGNATION_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lastWorkingDay, separationType, reason } = req.body;
    if (!lastWorkingDay || !separationType || !reason) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'lastWorkingDay, separationType, reason are required.' });
    const existing = await ResignationModel.findOne({ employee: req.user?.id, status: { $nin: ['RELIEVED', 'WITHDRAWN'] } });
    if (existing) return res.status(409).json({ code: 'DUPLICATE', message: 'Active resignation already exists.' });
    const lwd = new Date(lastWorkingDay);
    const noticePeriodDays = Math.ceil((lwd.getTime() - Date.now()) / 86400000);
    const record = await ResignationModel.create({
      employee: req.user?.id,
      lastWorkingDay: lwd,
      separationType, reason, noticePeriodDays,
      ktChecklist: KT_ITEMS.map(item => ({ item, done: false })),
    });
    res.status(201).json(record);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to submit resignation.' });
  }
});

router2.patch('/:id/kt', requirePermission('RESIGNATION_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { index, done } = req.body;
    const record = await ResignationModel.findOne({ _id: req.params.id, employee: req.user?.id });
    if (!record) return res.status(404).json({ code: 'NOT_FOUND', message: 'Resignation not found.' });
    if (record.ktChecklist[index] !== undefined) record.ktChecklist[index].done = done;
    await record.save();
    res.status(200).json(record);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to update KT checklist.' });
  }
});

router2.patch('/:id/status', requirePermission('RESIGNATION_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const update: any = { status };
    if (status === 'TL_ACKNOWLEDGED') update.tlAcknowledgedAt = new Date();
    if (status === 'MANAGER_APPROVED') update.managerApprovedAt = new Date();
    if (status === 'RELIEVED') update.relievedAt = new Date();
    if (status === 'WITHDRAWN') update.withdrawnAt = new Date();
    const record = await ResignationModel.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!record) return res.status(404).json({ code: 'NOT_FOUND', message: 'Resignation not found.' });
    res.status(200).json(record);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to update resignation status.' });
  }
});

router2.patch('/:id/withdraw', requirePermission('RESIGNATION_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const record = await ResignationModel.findOne({ _id: req.params.id, employee: req.user?.id });
    if (!record) return res.status(404).json({ code: 'NOT_FOUND', message: 'Resignation not found.' });
    if (['MANAGER_APPROVED', 'RELIEVED'].includes(record.status)) return res.status(400).json({ code: 'INVALID_STATE', message: 'Cannot withdraw after manager approval.' });
    record.status = 'WITHDRAWN';
    record.withdrawnAt = new Date();
    await record.save();
    res.status(200).json(record);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to withdraw resignation.' });
  }
});

export default router2;
