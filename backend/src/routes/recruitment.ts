import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { JobOpeningModel } from '../models/JobOpening';

const router = Router();

router.get('/', requirePermission('RECRUITMENT_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, department, search } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
    ];
    const jobs = await JobOpeningModel.find(filter)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch job openings.' });
  }
});

router.get('/stats', requirePermission('RECRUITMENT_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [open, onHold, closed] = await Promise.all([
      JobOpeningModel.countDocuments({ status: 'OPEN' }),
      JobOpeningModel.countDocuments({ status: 'ON_HOLD' }),
      JobOpeningModel.countDocuments({ status: 'CLOSED' }),
    ]);
    const jobs = await JobOpeningModel.find();
    const totalApplicants = jobs.reduce((s, j) => s + j.applicants.length, 0);
    res.status(200).json({ open, onHold, closed, totalApplicants });
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch recruitment stats.' });
  }
});

router.post('/', requirePermission('RECRUITMENT_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, department, location, type, openings, deadline, jd } = req.body;
    if (!title || !department || !location || !deadline) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'title, department, location, deadline are required.' });
    const job = await JobOpeningModel.create({ title, department, location, type, openings, deadline, jd, postedBy: req.user?.id });
    res.status(201).json(job);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to create job opening.' });
  }
});

router.patch('/:id/status', requirePermission('RECRUITMENT_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = await JobOpeningModel.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!job) return res.status(404).json({ code: 'NOT_FOUND', message: 'Job not found.' });
    res.status(200).json(job);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to update job status.' });
  }
});

router.post('/:id/applicants', requirePermission('RECRUITMENT_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, experience } = req.body;
    if (!name || !email) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'name and email are required.' });
    const job = await JobOpeningModel.findById(req.params.id);
    if (!job) return res.status(404).json({ code: 'NOT_FOUND', message: 'Job not found.' });
    job.applicants.push({ name, email, phone, experience, stage: 'SCREENING', appliedAt: new Date() });
    await job.save();
    res.status(201).json(job);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to add applicant.' });
  }
});

router.patch('/:id/applicants/:appId/stage', requirePermission('RECRUITMENT_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = await JobOpeningModel.findById(req.params.id);
    if (!job) return res.status(404).json({ code: 'NOT_FOUND', message: 'Job not found.' });
    const applicant = job.applicants.find(a => a._id?.toString() === req.params.appId);
    if (!applicant) return res.status(404).json({ code: 'NOT_FOUND', message: 'Applicant not found.' });
    applicant.stage = req.body.stage;
    await job.save();
    res.status(200).json(job);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to update applicant stage.' });
  }
});

export default router;
