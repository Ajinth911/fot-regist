import { db } from '../db/database';
import { TokenService } from './tokenService';
import { CardGenerator } from './cardGenerator';
import { EmailService } from './emailService';
import { syncRegistrationToSupabase } from '../db/supabase';

export function getNextTicketCode(): string {
  const row = db.prepare(`
    SELECT ticket_code FROM attendees
    WHERE ticket_code LIKE 'FOT-%'
    ORDER BY id DESC LIMIT 1
  `).get() as { ticket_code?: string } | undefined;

  let nextNum = 1;
  if (row?.ticket_code) {
    const match = row.ticket_code.match(/FOT-(\d+)/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM attendees WHERE ticket_code IS NOT NULL`).get() as { count: number };
  if (countRow.count >= nextNum) {
    nextNum = countRow.count + 1;
  }

  return `FOT-${String(nextNum).padStart(4, '0')}`;
}

export async function confirmRegistrationAndIssuePasses(registrationId: string) {
  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(registrationId) as {
    id: string;
    status: string;
    payer_name: string;
    payer_email: string;
  } | undefined;

  if (!registration) {
    throw new Error('Registration not found');
  }

  const eventConfig = db.prepare('SELECT name, date_text, venue_name FROM event_config WHERE id = 1').get() as {
    name: string;
    date_text: string;
    venue_name: string;
  };

  interface AttendeeRow {
    id: string;
    name: string;
    email: string;
    phone: string;
    assigned_category: string;
    team_identifier: string | null;
    ticket_code: string | null;
    signed_token: string | null;
    id_card_url: string | null;
    qr_data_url: string | null;
  }

  const attendees = db.prepare('SELECT * FROM attendees WHERE registration_id = ?').all(registrationId) as AttendeeRow[];
  const updatedAttendees = [];

  for (const att of attendees) {
    let ticketCode = att.ticket_code;
    if (!ticketCode) {
      ticketCode = getNextTicketCode();
    }

    // Generate signed token
    const signedToken = TokenService.signToken({
      attendeeId: att.id,
      ticketCode,
      name: att.name,
      event: 'Friends of Tech',
    });

    // Generate ID card pass graphic
    const { svgString, passUrl, qrDataUrl } = await CardGenerator.generatePassCard({
      attendeeId: att.id,
      ticketCode,
      name: att.name,
      category: att.assigned_category,
      teamIdentifier: att.team_identifier,
      signedToken,
      eventName: eventConfig.name,
      dateText: eventConfig.date_text,
      venueName: eventConfig.venue_name,
    });

    // Update attendee in DB immediately
    db.prepare(`
      UPDATE attendees
      SET
        ticket_code = ?,
        signed_token = ?,
        qr_data_url = ?,
        id_card_url = ?,
        status = 'confirmed'
      WHERE id = ?
    `).run(ticketCode, signedToken, qrDataUrl, passUrl, att.id);

    updatedAttendees.push({
      id: att.id,
      name: att.name,
      email: att.email,
      ticketCode,
      passUrl,
      emailPayload: {
        toEmail: att.email,
        name: att.name,
        ticketCode,
        category: att.assigned_category,
        teamIdentifier: att.team_identifier,
        eventName: eventConfig.name,
        dateText: eventConfig.date_text,
        venueName: eventConfig.venue_name,
        passUrl,
        svgString,
      },
    });
  }

  // Update registration status immediately
  db.prepare(`
    UPDATE registrations
    SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP, rejection_reason = NULL
    WHERE id = ?
  `).run(registrationId);

  // Background mirror updated registration to Supabase
  const fullReg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(registrationId) as Record<string, unknown>;
  const fullAtts = db.prepare('SELECT * FROM attendees WHERE registration_id = ?').all(registrationId) as Array<Record<string, unknown>>;
  if (fullReg) {
    syncRegistrationToSupabase(fullReg as any, fullAtts as any).catch(err => console.warn('[SUPABASE] Confirmation sync error:', err));
  }

  // Asynchronously dispatch attendee ticket emails in background
  (async () => {
    for (const item of updatedAttendees) {
      try {
        const emailResult = await EmailService.sendTicketEmail(item.emailPayload);
        db.prepare(`
          UPDATE attendees
          SET email_sent = ?, email_sent_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(emailResult.success ? 1 : 0, item.id);
        console.log(`[PASS DISPATCH] Ticket pass dispatched to ${item.email} (Email Sent: ${emailResult.success})`);
      } catch (emailErr) {
        console.error(`[BACKGROUND EMAIL] Error sending ticket email to ${item.name}:`, emailErr);
      }
    }
  })();

  return {
    registrationId,
    attendeesCount: updatedAttendees.length,
    attendees: updatedAttendees.map(({ emailPayload, ...rest }) => rest),
  };
}
