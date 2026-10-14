import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { CourseModel, EnrollmentModel } from '../models/Training';

const router = Router();

router.get('/courses', requirePermission('TRAINING_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category } = req.query;
    const filter: any = { isActive: true };
    if (category) filter.category = category;
    const courses = await CourseModel.find(filter).sort({ mandatory: -1, createdAt: -1 });
    res.status(200).json(courses);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch courses.' });
  }
});

router.get('/my', requirePermission('TRAINING_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const enrollments = await EnrollmentModel.find({ employee: req.user?.id })
      .populate('course')
      .sort({ updatedAt: -1 });
    res.status(200).json(enrollments);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch enrollments.' });
  }
});

router.get('/certificates', requirePermission('TRAINING_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const certs = await EnrollmentModel.find({ employee: req.user?.id, progress: 100 })
      .populate('course', 'title category hasCertificate');
    res.status(200).json(certs.filter((e: any) => e.course?.hasCertificate));
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch certificates.' });
  }
});

router.post('/enroll/:courseId', requirePermission('TRAINING_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const course = await CourseModel.findById(req.params.courseId);
    if (!course) return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found.' });
    const enrollment = await EnrollmentModel.findOneAndUpdate(
      { employee: req.user?.id, course: req.params.courseId },
      { $setOnInsert: { employee: req.user?.id, course: req.params.courseId, progress: 0 } },
      { upsert: true, new: true }
    );
    res.status(201).json(enrollment);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to enroll.' });
  }
});

router.patch('/progress/:enrollmentId', requirePermission('TRAINING_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { progress } = req.body;
    if (progress === undefined || progress < 0 || progress > 100) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'progress must be 0-100.' });
    const update: any = { progress };
    if (progress === 100) update.completedAt = new Date();
    const enrollment = await EnrollmentModel.findOneAndUpdate(
      { _id: req.params.enrollmentId, employee: req.user?.id },
      update, { new: true }
    ).populate('course');
    if (!enrollment) return res.status(404).json({ code: 'NOT_FOUND', message: 'Enrollment not found.' });
    res.status(200).json(enrollment);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to update progress.' });
  }
});

router.post('/courses', requirePermission('TRAINING_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, description, duration, level, mandatory, hasCertificate } = req.body;
    if (!title || !category) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'title and category are required.' });
    const course = await CourseModel.create({ title, category, description, duration, level, mandatory, hasCertificate, createdBy: req.user?.id });
    res.status(201).json(course);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to create course.' });
  }
});

export default router;
