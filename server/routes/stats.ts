import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/overview', requireAdmin, (_req: Request, res: Response): void => {
  const totalRegistrations = (db.prepare('SELECT COUNT(*) as count FROM registrations').get() as { count: number }).count;
  const totalAttendees = (db.prepare('SELECT COUNT(*) as count FROM attendees').get() as { count: number }).count;
  const soloAttendees = (db.prepare("SELECT COUNT(*) as count FROM attendees WHERE assigned_category = 'SOLO'").get() as { count: number }).count;
  const teamAttendees = (db.prepare("SELECT COUNT(*) as count FROM attendees WHERE assigned_category = 'TEAM'").get() as { count: number }).count;
  const teamGroupsCount = (db.prepare("SELECT COUNT(DISTINCT team_identifier) as count FROM attendees WHERE team_identifier IS NOT NULL").get() as { count: number }).count;

  const pendingRegistrations = (db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status = 'pending'").get() as { count: number }).count;
  const confirmedRegistrations = (db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status = 'confirmed'").get() as { count: number }).count;
  const rejectedRegistrations = (db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status = 'rejected'").get() as { count: number }).count;

  const revenueRow = db.prepare("SELECT SUM(total_amount) as total FROM registrations WHERE status = 'confirmed'").get() as { total: number | null };
  const totalRevenue = revenueRow.total || 0;

  const checkedInCount = (db.prepare('SELECT COUNT(*) as count FROM check_ins').get() as { count: number }).count;

  // Compute registration timeline (grouped by day/hour for chart)
  interface TimelineRow {
    dateLabel: string;
    count: number;
    cumulative: number;
  }

  const recentRows = db.prepare(`
    SELECT
      strftime('%m/%d', created_at) as date_label,
      COUNT(*) as count
    FROM registrations
    GROUP BY strftime('%m/%d', created_at)
    ORDER BY created_at ASC
    LIMIT 14
  `).all() as { date_label: string; count: number }[];

  let runningTotal = 0;
  const timeline: TimelineRow[] = recentRows.map(r => {
    runningTotal += r.count;
    return {
      dateLabel: r.date_label || 'Today',
      count: r.count,
      cumulative: runningTotal,
    };
  });

  // If empty timeline, generate baseline starter points
  if (timeline.length === 0) {
    timeline.push(
      { dateLabel: '10/01', count: 0, cumulative: 0 },
      { dateLabel: '10/05', count: 2, cumulative: 2 },
      { dateLabel: '10/09', count: totalRegistrations, cumulative: totalRegistrations }
    );
  }

  res.json({
    metrics: {
      totalRegistrations,
      totalAttendees,
      soloAttendees,
      teamAttendees,
      teamGroupsCount,
      pendingRegistrations,
      confirmedRegistrations,
      rejectedRegistrations,
      totalRevenue,
      checkedInCount,
    },
    timeline,
  });
});

export default router;
