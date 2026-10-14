import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { DocumentModel } from '../models/Document';

const router = Router();

router.get('/my', requirePermission('DOCS_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category } = req.query;
    const filter: any = { employee: req.user?.id };
    if (category) filter.category = category;
    const docs = await DocumentModel.find(filter).sort({ createdAt: -1 });
    res.status(200).json(docs);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch documents.' });
  }
});

router.get('/shared', requirePermission('DOCS_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const docs = await DocumentModel.find({ access: 'SHARED' }).sort({ createdAt: -1 });
    res.status(200).json(docs);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch shared documents.' });
  }
});

router.get('/employee/:id', requirePermission('DOCS_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const docs = await DocumentModel.find({ employee: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(docs);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch employee documents.' });
  }
});

router.post('/upload', requirePermission('DOCS_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, url, size, access } = req.body;
    if (!name || !category || !url) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'name, category, and url are required.' });
    const doc = await DocumentModel.create({
      employee: req.user?.id,
      name, category, url, size,
      access: access || 'PRIVATE',
      owner: 'Employee',
      uploadedBy: req.user?.id,
    });
    res.status(201).json(doc);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to upload document.' });
  }
});

router.post('/hr-upload', requirePermission('DOCS_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId, name, category, url, size, access } = req.body;
    if (!employeeId || !name || !category || !url) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'employeeId, name, category, url are required.' });
    const doc = await DocumentModel.create({
      employee: employeeId,
      name, category, url, size,
      access: access || 'PRIVATE',
      owner: 'HR',
      uploadedBy: req.user?.id,
    });
    res.status(201).json(doc);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to upload HR document.' });
  }
});

router.delete('/:id', requirePermission('DOCS_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ code: 'NOT_FOUND', message: 'Document not found.' });
    const isOwner = doc.employee.toString() === req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isOwner && !isAdmin) return res.status(403).json({ code: 'FORBIDDEN', message: 'Cannot delete this document.' });
    if (doc.owner === 'HR' && !isAdmin) return res.status(403).json({ code: 'FORBIDDEN', message: 'HR documents cannot be deleted by employees.' });
    await doc.deleteOne();
    res.status(200).json({ message: 'Document deleted.' });
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to delete document.' });
  }
});

export default router;
