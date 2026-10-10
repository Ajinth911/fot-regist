import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { requireAdmin } from '../middleware/auth';

const router = Router();

function sanitizeCsvCell(val: string | null | undefined): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  // Neutralize CSV formula injection: if first char is =, +, -, @, \t, or \r
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
}

// GET /api/export/csv (Export all attendees or check-ins as CSV)
router.get('/csv', requireAdmin, (req: Request, res: Response): void => {
  const { type = 'attendees' } = req.query;

  let filename = `fot-attendees-${new Date().toISOString().split('T')[0]}.csv`;
  let csvContent = '';

  if (type === 'checkins') {
    filename = `fot-checkins-${new Date().toISOString().split('T')[0]}.csv`;
    csvContent = 'Timestamp,Ticket Code,Attendee Name,Phone,Email,Category,Team,Scanned By,Synced To Sheets\n';

    interface CheckInExportRow {
      scanned_at: string;
      ticket_code: string;
      name: string;
      phone: string;
      email: string;
      assigned_category: string;
      team_identifier: string | null;
      scanned_by: string;
      synced_to_sheets: number;
    }

    const rows = db.prepare(`
      SELECT
        c.scanned_at,
        c.ticket_code,
        a.name,
        a.phone,
        a.email,
        a.assigned_category,
        a.team_identifier,
        c.scanned_by,
        c.synced_to_sheets
      FROM check_ins c
      JOIN attendees a ON c.attendee_id = a.id
      ORDER BY c.scanned_at ASC
    `).all() as CheckInExportRow[];

    for (const r of rows) {
      csvContent += `${sanitizeCsvCell(r.scanned_at)},${sanitizeCsvCell(r.ticket_code)},${sanitizeCsvCell(r.name)},${sanitizeCsvCell(r.phone)},${sanitizeCsvCell(r.email)},${sanitizeCsvCell(r.assigned_category)},${sanitizeCsvCell(r.team_identifier || 'N/A')},${sanitizeCsvCell(r.scanned_by)},${r.synced_to_sheets ? 'YES' : 'NO'}\n`;
    }
  } else {
    // All attendees export
    csvContent = 'Ticket Code,Attendee Name,Email,Phone,Registration ID,Payer Name,Category,Team,Registration Status,Check In Status,Registered At\n';

    interface AttendeeExportRow {
      ticket_code: string | null;
      name: string;
      email: string;
      phone: string;
      registration_id: string;
      payer_name: string;
      assigned_category: string;
      team_identifier: string | null;
      status: string;
      is_checked_in: number;
      created_at: string;
    }

    const rows = db.prepare(`
      SELECT
        a.ticket_code,
        a.name,
        a.email,
        a.phone,
        a.registration_id,
        r.payer_name,
        a.assigned_category,
        a.team_identifier,
        a.status,
        (SELECT COUNT(*) FROM check_ins c WHERE c.attendee_id = a.id) as is_checked_in,
        a.created_at
      FROM attendees a
      JOIN registrations r ON a.registration_id = r.id
      ORDER BY a.created_at DESC
    `).all() as AttendeeExportRow[];

    for (const r of rows) {
      csvContent += `${sanitizeCsvCell(r.ticket_code || 'UNISSUED')},${sanitizeCsvCell(r.name)},${sanitizeCsvCell(r.email)},${sanitizeCsvCell(r.phone)},${sanitizeCsvCell(r.registration_id)},${sanitizeCsvCell(r.payer_name)},${sanitizeCsvCell(r.assigned_category)},${sanitizeCsvCell(r.team_identifier || 'SOLO')},${sanitizeCsvCell(r.status)},${r.is_checked_in > 0 ? 'CHECKED_IN' : 'NOT_CHECKED_IN'},${sanitizeCsvCell(r.created_at)}\n`;
    }
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

export default router;
