import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { requireAdmin } from '../middleware/auth';
import { SheetsService } from '../services/sheetsService';
import { EmailService } from '../services/emailService';

const router = Router();

// POST /api/sheets/test-email
router.post('/test-email', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Recipient email address is required.' });
    return;
  }

  const result = await EmailService.testSmtpConnection(email);
  res.json(result);
});

// POST /api/sheets/test
router.post('/test', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { sheetUrl } = req.body;
  if (!sheetUrl) {
    res.status(400).json({ error: 'Sheet URL is required.' });
    return;
  }

  const result = await SheetsService.testConnection(sheetUrl);
  if (result.success) {
    db.prepare('UPDATE event_config SET google_sheet_url = ?, google_sheet_status = ? WHERE id = 1')
      .run(sheetUrl, `Connected (${result.sheetTitle || 'Active'})`);
  }

  res.json(result);
});

// POST /api/sheets/sync (Sync all unsynced check-ins to Google Sheets)
router.post('/sync', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  interface UnsyncedRow {
    id: number;
    scanned_at: string;
    ticket_code: string;
    name: string;
    phone: string;
    email: string;
    assigned_category: string;
    team_identifier: string | null;
  }

  const unsynced = db.prepare(`
    SELECT
      c.id,
      c.scanned_at,
      c.ticket_code,
      a.name,
      a.phone,
      a.email,
      a.assigned_category,
      a.team_identifier
    FROM check_ins c
    JOIN attendees a ON c.attendee_id = a.id
    WHERE c.synced_to_sheets = 0
    ORDER BY c.scanned_at ASC
  `).all() as UnsyncedRow[];

  let syncedCount = 0;
  for (const row of unsynced) {
    const result = await SheetsService.appendCheckIn({
      timestamp: new Date(row.scanned_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ticketCode: row.ticket_code,
      name: row.name,
      phone: row.phone,
      email: row.email,
      category: row.assigned_category,
      team: row.team_identifier || 'N/A',
      status: 'Reached',
    });

    if (result.success) {
      db.prepare('UPDATE check_ins SET synced_to_sheets = 1 WHERE id = ?').run(row.id);
      syncedCount++;
    }
  }

  res.json({
    success: true,
    totalUnsynced: unsynced.length,
    syncedCount,
    message: `Batch sync completed. ${syncedCount}/${unsynced.length} records processed.`,
  });
});

export default router;
