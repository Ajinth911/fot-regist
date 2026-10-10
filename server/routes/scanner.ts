import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { requireAdmin } from '../middleware/auth';
import { TokenService } from '../services/tokenService';
import { SheetsService } from '../services/sheetsService';
import { syncCheckInToSupabase } from '../db/supabase';

const router = Router();

interface AttendeeScanRow {
  id: string;
  ticket_code: string;
  name: string;
  email: string;
  phone: string;
  assigned_category: string;
  team_identifier: string | null;
  status: string;
  id_card_url: string;
}

interface CheckInRow {
  id: number;
  scanned_at: string;
  scanned_by: string;
}

// POST /api/scanner/verify (Admin protected QR / Manual Code Scanner)
router.post('/verify', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, manualCode } = req.body;

    let targetTicketCode: string | null = null;
    let targetAttendeeId: string | null = null;

    if (token) {
      // 1. Verify token signature
      const verification = TokenService.verifyToken(token);
      if (verification.valid && verification.payload) {
        targetTicketCode = verification.payload.ticketCode;
        targetAttendeeId = verification.payload.attendeeId;
      } else {
        // Fallback A: Check if token directly matches attendee's stored signed_token
        const dbAttendee = db.prepare('SELECT id, ticket_code FROM attendees WHERE signed_token = ?').get(token) as { id: string; ticket_code: string } | undefined;
        if (dbAttendee) {
          targetAttendeeId = dbAttendee.id;
          targetTicketCode = dbAttendee.ticket_code;
        } else {
          // Fallback B: Extract ticket code pattern (e.g. FOT-0001) from URL or string
          const ticketMatch = token.match(/FOT-[A-Z0-9-]+/i);
          if (ticketMatch) {
            targetTicketCode = ticketMatch[0].toUpperCase();
          } else {
            res.status(200).json({
              status: 'INVALID',
              message: 'Invalid pass. Not issued by FOT.',
              error: verification.error || 'Verification check failed.',
            });
            return;
          }
        }
      }
    } else if (manualCode) {
      targetTicketCode = manualCode.trim().toUpperCase();
    } else {
      res.status(400).json({ error: 'Either token or manualCode is required.' });
      return;
    }

    // 2. Query Attendee from Database
    let attendee: AttendeeScanRow | undefined;
    if (targetAttendeeId) {
      attendee = db.prepare('SELECT * FROM attendees WHERE id = ?').get(targetAttendeeId) as AttendeeScanRow | undefined;
    } else if (targetTicketCode) {
      attendee = db.prepare('SELECT * FROM attendees WHERE ticket_code = ?').get(targetTicketCode) as AttendeeScanRow | undefined;
    }

    if (!attendee || attendee.status !== 'confirmed') {
      res.status(200).json({
        status: 'INVALID',
        message: 'Invalid pass. Not issued by FOT.',
        error: 'Ticket not found or registration not confirmed.',
      });
      return;
    }

    // 3. Check for Existing Check-In (Prevent Duplicates)
    const existingCheckIn = db.prepare(`
      SELECT * FROM check_ins WHERE attendee_id = ? ORDER BY scanned_at ASC LIMIT 1
    `).get(attendee.id) as CheckInRow | undefined;

    if (existingCheckIn) {
      const formattedTime = new Date(existingCheckIn.scanned_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      res.json({
        status: 'ALREADY_CHECKED_IN',
        message: `Already checked in at ${formattedTime}`,
        scannedAt: existingCheckIn.scanned_at,
        attendee: {
          id: attendee.id,
          ticketCode: attendee.ticket_code,
          name: attendee.name,
          email: attendee.email,
          phone: attendee.phone,
          category: attendee.assigned_category,
          team: attendee.team_identifier,
        },
      });
      return;
    }

    // 4. Valid First Scan: Record Check-In
    const now = new Date().toISOString();
    const insertResult = db.prepare(`
      INSERT INTO check_ins (attendee_id, ticket_code, scanned_by, scanned_at, synced_to_sheets)
      VALUES (?, ?, ?, ?, 0)
    `).run(attendee.id, attendee.ticket_code, 'Gate Scanner', now);

    const checkInId = insertResult.lastInsertRowid;

    // Background mirror to Supabase cloud
    syncCheckInToSupabase({
      attendee_id: attendee.id,
      ticket_code: attendee.ticket_code,
      scanned_by: 'Gate Scanner',
      created_at: now,
    }).catch(err => console.warn('[SUPABASE] Check-in sync error:', err));

    // 5. Append to Google Sheets asynchronously (non-blocking for instant scanner response)
    SheetsService.appendCheckIn({
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ticketCode: attendee.ticket_code,
      name: attendee.name,
      phone: attendee.phone,
      email: attendee.email,
      category: attendee.assigned_category,
      team: attendee.team_identifier || 'N/A',
      status: 'Reached',
    }).then((sheetResult) => {
      if (sheetResult.success) {
        db.prepare('UPDATE check_ins SET synced_to_sheets = 1 WHERE id = ?').run(checkInId);
      }
    }).catch((sheetErr) => {
      console.warn('[SCANNER] Google Sheet append warning:', sheetErr);
    });

    res.json({
      status: 'VALID',
      message: 'Check-in confirmed',
      checkedInAt: now,
      attendee: {
        id: attendee.id,
        ticketCode: attendee.ticket_code,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        category: attendee.assigned_category,
        team: attendee.team_identifier,
      },
    });
  } catch (err: unknown) {
    console.error('Scanner verification error:', err);
    res.status(500).json({ error: 'Server error during scan verification.' });
  }
});

// GET /api/scanner/history (List all check-ins)
router.get('/history', requireAdmin, (_req: Request, res: Response): void => {
  const checkIns = db.prepare(`
    SELECT
      c.id,
      c.ticket_code,
      c.scanned_at,
      c.scanned_by,
      c.synced_to_sheets,
      a.id as attendee_id,
      a.name as attendee_name,
      a.email as attendee_email,
      a.phone as attendee_phone,
      a.assigned_category,
      a.team_identifier
    FROM check_ins c
    JOIN attendees a ON c.attendee_id = a.id
    ORDER BY c.scanned_at DESC
  `).all();

  res.json({ checkIns });
});

export default router;
