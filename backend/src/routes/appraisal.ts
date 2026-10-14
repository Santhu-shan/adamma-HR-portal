import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middlewares/rbac';
import { AppraisalRecordModel } from '../models/AppraisalRecord';

const router = Router();

// Submit Employee Self Appraisal
router.post('/submit', requirePermission('APPRAISAL_SUBMIT'), async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { ratings, feedback, cycleId } = req.body;

  try {
    if (!ratings || ratings.length !== 8) {
      return res.status(400).json({ code: 'INVALID_RATINGS', message: 'Evaluation requires 8 numeric scores.' });
    }

    let record = await AppraisalRecordModel.findOne({ userId, cycleId });
    if (record && record.status !== 'DRAFT') {
      return res.status(400).json({ code: 'PHASE_LOCKED', message: 'Self evaluation already finalized and locked.' });
    }

    if (!record) {
      record = new AppraisalRecordModel({
        userId,
        cycleId,
        status: 'SELF_SUBMITTED',
        ratings: {
          employee: { scores: ratings, feedback },
          tl: { scores: [], feedback: '' },
          manager: { scores: [], feedback: '' },
          admin: { scores: [], feedback: '' }
        },
        sectionWeights: Array(8).fill(12.5),
        history: [{ fromStatus: 'DRAFT', toStatus: 'SELF_SUBMITTED', timestamp: new Date(), actor: userId as any, comments: 'Self Submit' }]
      });
    } else {
      record.ratings.employee = { scores: ratings, feedback };
      record.status = 'SELF_SUBMITTED';
      record.history.push({ fromStatus: 'DRAFT', toStatus: 'SELF_SUBMITTED', timestamp: new Date(), actor: userId as any, comments: 'Self Submit' });
    }

    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Self submission failed.' });
  }
});

// TL Review Calibration
router.post('/:id/tl-review', requirePermission('APPRAISAL_REVIEW_TL'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const supervisorId = req.user?.id;
  const { ratings, feedback } = req.body;

  try {
    const record = await AppraisalRecordModel.findById(id);
    if (!record) {
      return res.status(404).json({ code: 'RECORD_NOT_FOUND', message: 'Appraisal record not resolved.' });
    }

    record.ratings.tl = { scores: ratings, feedback };
    const oldStatus = record.status;
    record.status = 'TL_REVIEWED';
    record.history.push({ 
      fromStatus: oldStatus, 
      toStatus: 'TL_REVIEWED', 
      timestamp: new Date(),
      actor: supervisorId as any, 
      comments: feedback 
    });

    await record.save();
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'TL calibration submission failed.' });
  }
});

// Manager Review Calibration & Finalize Scoring
router.post('/:id/finalize', requirePermission('APPRAISAL_FINALIZE'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const adminId = req.user?.id;
  const { ratings, feedback } = req.body;

  try {
    const record = await AppraisalRecordModel.findById(id);
    if (!record) {
      return res.status(404).json({ code: 'RECORD_NOT_FOUND', message: 'Appraisal record not resolved.' });
    }

    // Set Admin Score
    record.ratings.admin = { scores: ratings, feedback };

    // Compute composite weighted aggregate
    const selfWeight = 0.30;
    const tlWeight = 0.30;
    const mgrWeight = 0.30;
    const admWeight = 0.10;

    const calcTierPercent = (scores: number[]) => {
      if (!scores || scores.length !== 8) return 50; // Neutral default
      const sum = scores.reduce((a, b) => a + b, 0);
      return (sum / 40) * 100;
    };

    const finalScore = parseFloat((
      calcTierPercent(record.ratings.employee.scores) * selfWeight +
      calcTierPercent(record.ratings.tl.scores) * tlWeight +
      calcTierPercent(record.ratings.manager.scores) * mgrWeight +
      calcTierPercent(record.ratings.admin.scores) * admWeight
    ).toFixed(2));

    record.finalAggregatedScore = finalScore;

    // Direct Hike Action Recommends mapping
    let recommendation: 'PROMOTION' | 'HIKE_A' | 'HIKE_B' | 'PIP' | 'RETAIN' = 'RETAIN';
    if (finalScore >= 90) recommendation = 'PROMOTION';
    else if (finalScore >= 75) recommendation = 'HIKE_A';
    else if (finalScore >= 60) recommendation = 'HIKE_B';
    else if (finalScore < 45) recommendation = 'PIP';

    record.systemRecommendation = recommendation;
    const oldStatus = record.status;
    record.status = 'COMPLETED';
    record.history.push({ 
      fromStatus: oldStatus, 
      toStatus: 'COMPLETED', 
      timestamp: new Date(),
      actor: adminId as any, 
      comments: `Appraisal Finalized: Score: ${finalScore}, Action: ${recommendation}` 
    });

    await record.save();
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ code: 'SERVER_EXCEPTION', message: 'Calibration finalization failed.' });
  }
});

export default router;
