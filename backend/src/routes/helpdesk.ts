import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { TicketModel } from '../models/Ticket';

const router = Router();

router.get('/my', requirePermission('TICKET_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = { employee: req.user?.id };
    if (status && status !== 'ALL') filter.status = status;
    const tickets = await TicketModel.find(filter).sort({ updatedAt: -1 });
    res.status(200).json(tickets);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch tickets.' });
  }
});

router.get('/all', requirePermission('TICKET_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, category, priority } = req.query;
    const filter: any = {};
    if (status && status !== 'ALL') filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    const tickets = await TicketModel.find(filter)
      .populate('employee', 'name employeeId department')
      .sort({ updatedAt: -1 });
    res.status(200).json(tickets);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to fetch all tickets.' });
  }
});

router.post('/', requirePermission('TICKET_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, category, priority, description } = req.body;
    if (!subject || !category || !description) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'subject, category, and description are required.' });
    const ticket = await TicketModel.create({
      employee: req.user?.id,
      subject, category,
      priority: priority || 'MEDIUM',
      comments: [{ by: 'You', userId: req.user?.id, text: description, time: new Date() }],
    });
    res.status(201).json(ticket);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to create ticket.' });
  }
});

router.post('/:id/comment', requirePermission('TICKET_VIEW'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Comment text is required.' });
    const ticket = await TicketModel.findById(req.params.id);
    if (!ticket) return res.status(404).json({ code: 'NOT_FOUND', message: 'Ticket not found.' });
    const isOwner = ticket.employee.toString() === req.user?.id;
    const isAdmin = ['ADMIN', 'MANAGER'].includes(req.user?.role || '');
    if (!isOwner && !isAdmin) return res.status(403).json({ code: 'FORBIDDEN', message: 'Cannot comment on this ticket.' });
    ticket.comments.push({ by: isAdmin ? req.user?.role || 'Support' : 'You', userId: req.user?.id as any, text, time: new Date() });
    await ticket.save();
    res.status(200).json(ticket);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to add comment.' });
  }
});

router.patch('/:id/status', requirePermission('TICKET_ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, assignedTo } = req.body;
    const ticket = await TicketModel.findByIdAndUpdate(req.params.id, { status, ...(assignedTo && { assignedTo }) }, { new: true });
    if (!ticket) return res.status(404).json({ code: 'NOT_FOUND', message: 'Ticket not found.' });
    res.status(200).json(ticket);
  } catch {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Failed to update ticket status.' });
  }
});

export default router;
