import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { AnnouncementModel } from '../models/Announcement';

const router = Router();

// 1. Fetch all announcements
router.get('/', requirePermission('LEAVE_APPLY'), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const announcements = await AnnouncementModel.find({})
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    // Map each announcement to include whether the current user has read it
    const formatted = announcements.map(ann => {
      const readByStrings = ann.readBy.map(id => id.toString());
      const isRead = readByStrings.includes(userId || '');
      return {
        id: ann._id,
        title: ann.title,
        content: ann.content,
        createdBy: ann.createdBy,
        createdAt: ann.createdAt,
        isRead
      };
    });

    res.status(200).json(formatted);
  } catch (error: any) {
    console.error('Fetch announcements failure:', error);
    res.status(500).json({
      code: 'FETCH_ANNOUNCEMENTS_FAILED',
      message: 'Failed to retrieve announcements.',
      details: error.message
    });
  }
});

// 2. Post a new announcement (ADMIN only)
router.post('/', requirePermission('LEAVE_APPLY'), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const { title, content } = req.body;

  if (userRole !== 'ADMIN') {
    return res.status(403).json({
      code: 'ADMIN_ONLY',
      message: 'Only system Administrators can publish announcements.'
    });
  }

  if (!title || !content) {
    return res.status(400).json({
      code: 'MISSING_FIELDS',
      message: 'Announcement title and content details are required.'
    });
  }

  try {
    const newAnn = new AnnouncementModel({
      title,
      content,
      createdBy: userId,
      readBy: [userId] // The admin already read their own post
    });

    await newAnn.save();
    res.status(201).json(newAnn);
  } catch (error: any) {
    console.error('Post announcement failure:', error);
    res.status(500).json({
      code: 'POST_ANNOUNCEMENT_FAILED',
      message: 'Failed to publish new announcement.',
      details: error.message
    });
  }
});

// 3. Mark an announcement as read
router.post('/:id/read', requirePermission('LEAVE_APPLY'), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id as any;
  const { id } = req.params;

  try {
    const announcement = await AnnouncementModel.findById(id);
    if (!announcement) {
      return res.status(404).json({
        code: 'ANNOUNCEMENT_NOT_FOUND',
        message: 'No announcement found matching this ID.'
      });
    }

    // Add userId to readBy if not already present
    const readByStrings = announcement.readBy.map(rId => rId.toString());
    if (!readByStrings.includes(userId.toString())) {
      announcement.readBy.push(userId);
      await announcement.save();
    }

    res.status(200).json({ success: true, message: 'Announcement marked as read.' });
  } catch (error: any) {
    console.error('Mark read failure:', error);
    res.status(500).json({
      code: 'MARK_READ_FAILED',
      message: 'Failed to mark announcement as read.',
      details: error.message
    });
  }
});

// 4. Mark all announcements as read
router.post('/read-all', requirePermission('LEAVE_APPLY'), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id as any;

  try {
    const announcements = await AnnouncementModel.find({});
    for (const ann of announcements) {
      const readByStrings = ann.readBy.map(rId => rId.toString());
      if (!readByStrings.includes(userId.toString())) {
        ann.readBy.push(userId);
        await ann.save();
      }
    }

    res.status(200).json({ success: true, message: 'All announcements marked as read.' });
  } catch (error: any) {
    console.error('Mark read-all failure:', error);
    res.status(500).json({
      code: 'MARK_READ_ALL_FAILED',
      message: 'Failed to mark all announcements as read.',
      details: error.message
    });
  }
});

export default router;
