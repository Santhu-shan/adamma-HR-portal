import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { startDeletionScheduler } from './utils/deletionScheduler';
import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';
import leaveRoutes from './routes/leave';
import appraisalRoutes from './routes/appraisal';
import announcementRoutes from './routes/announcement';
import payrollRoutes from './routes/payroll';
import directoryRoutes from './routes/directory';
import documentsRoutes from './routes/documents';
import helpdeskRoutes from './routes/helpdesk';
import resignationRoutes from './routes/resignation';
import recruitmentRoutes from './routes/recruitment';
import trainingRoutes from './routes/training';
import reportsRoutes from './routes/reports';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

connectDB();
startDeletionScheduler();

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/appraisal', appraisalRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/helpdesk', helpdeskRoutes);
app.use('/api/resignation', resignationRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ONLINE', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Core server error:', err);
  res.status(err.status || 500).json({
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected operational failure occurred on the server.',
    details: err.details || {}
  });
});

app.listen(port, () => {
  console.log(`ADAMMA HRMS Engine active on port ${port}`);
});

export default app;
