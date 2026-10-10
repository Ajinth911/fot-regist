import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'fot.db');
export const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

function ensureColumnExists(table: string, column: string, type: string) {
  try {
    const info = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    const exists = info.some((col) => col.name === column);
    if (!exists) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
      console.log(`[DB MIGRATION] Added column ${column} to table ${table}`);
    }
  } catch (err) {
    console.warn(`[DB MIGRATION] Column check for ${table}.${column}:`, err);
  }
}

export function initDatabase() {
  // 1. Admins Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 1b. Attendees & Builders Users Table (Sign In / Sign Up)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Event Configuration Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      banner_url TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      genlab_logo_url TEXT NOT NULL DEFAULT '',
      date_text TEXT NOT NULL,
      time_text TEXT NOT NULL,
      venue_name TEXT NOT NULL,
      venue_address TEXT NOT NULL,
      price_per_person INTEGER NOT NULL DEFAULT 99,
      upi_id TEXT NOT NULL,
      upi_name TEXT NOT NULL,
      gpay_qr_url TEXT NOT NULL,
      guidelines_json TEXT NOT NULL DEFAULT '[]',
      schedule_json TEXT NOT NULL DEFAULT '[]',
      prizes_json TEXT NOT NULL DEFAULT '[]',
      faq_json TEXT NOT NULL DEFAULT '[]',
      contact_json TEXT NOT NULL DEFAULT '[]',
      google_sheet_url TEXT DEFAULT '',
      google_sheet_status TEXT DEFAULT 'Unconfigured',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure all columns exist on event_config
  ensureColumnExists('event_config', 'genlab_logo_url', "TEXT DEFAULT ''");
  ensureColumnExists('event_config', 'guidelines_json', "TEXT DEFAULT '[]'");
  ensureColumnExists('event_config', 'schedule_json', "TEXT DEFAULT '[]'");
  ensureColumnExists('event_config', 'prizes_json', "TEXT DEFAULT '[]'");
  ensureColumnExists('event_config', 'faq_json', "TEXT DEFAULT '[]'");
  ensureColumnExists('event_config', 'contact_json', "TEXT DEFAULT '[]'");
  ensureColumnExists('event_config', 'google_sheet_url', "TEXT DEFAULT ''");
  ensureColumnExists('event_config', 'google_sheet_status', "TEXT DEFAULT 'Unconfigured'");

  // 3. Registrations (Payment Group) Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      payer_name TEXT NOT NULL,
      payer_email TEXT NOT NULL,
      payer_phone TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      attendee_count INTEGER NOT NULL,
      payment_screenshot_url TEXT NOT NULL,
      utr_number TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      confirmed_at DATETIME
    );
  `);

  ensureColumnExists('registrations', 'utr_number', 'TEXT');

  // 4. Attendees Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendees (
      id TEXT PRIMARY KEY,
      ticket_code TEXT UNIQUE,
      registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      requested_category TEXT NOT NULL,
      assigned_category TEXT NOT NULL,
      team_identifier TEXT,
      signed_token TEXT,
      qr_data_url TEXT,
      id_card_url TEXT,
      email_sent INTEGER DEFAULT 0,
      email_sent_at DATETIME,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Check-Ins Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attendee_id TEXT NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
      ticket_code TEXT NOT NULL,
      scanned_by TEXT DEFAULT 'Main Gate Scanner',
      scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced_to_sheets INTEGER DEFAULT 0
    );
  `);

  // Seed default Admin if not exists
  const initialAdminEmail = process.env.ADMIN_EMAIL?.trim() || 'admin@fot.org';
  let initialAdminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!initialAdminPassword) {
    if (process.env.NODE_ENV === 'production') {
      // Zero-Trust: Never use static fallback credentials in production
      const crypto = require('crypto');
      initialAdminPassword = crypto.randomBytes(16).toString('hex');
      console.warn(`[SECURITY ALERT] Production started without ADMIN_PASSWORD. Generated temporary password: ${initialAdminPassword}`);
    } else {
      initialAdminPassword = 'fotadmin2026';
    }
  }

  const existingAdmin = db.prepare('SELECT * FROM admins WHERE email = ?').get(initialAdminEmail);
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(initialAdminPassword, salt);
    db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(initialAdminEmail, hash);
    console.log(`[DB] Seeded initial admin account: ${initialAdminEmail}`);
  }

  // Refresh or Seed Event Config
  const existingConfig = db.prepare('SELECT * FROM event_config WHERE id = 1').get();

  const defaultSchedule = JSON.stringify([
    { time: '08:30 AM', title: 'Check-in & Morning Coffee', description: 'Badge collection, breakfast, and meet other builders.', tag: 'Registration' },
    { time: '09:30 AM', title: 'Opening & Welcome', description: 'Opening thoughts from the Friends of Tech and GenLab teams.', tag: 'Main Stage' },
    { time: '10:45 AM', title: 'Builder Keynote: Scaling Modern Apps', description: 'Practical lessons on engineering high-scale products.', tag: 'Keynote' },
    { time: '12:00 PM', title: 'Team Sprint Kickoff', description: 'Hands-on building track for Solo and 2-person teams.', tag: 'Building' },
    { time: '01:30 PM', title: 'Lunch & Networking', description: 'Curated lunch and casual discussions with peers.', tag: 'Break' },
    { time: '02:30 PM', title: 'Lightning Talks & Demos', description: 'Short product demos and engineering showcases from the community.', tag: 'Showcase' },
    { time: '05:00 PM', title: 'Community Awards & Wrap-Up', description: 'Celebrating standout projects, giveaways, and closing remarks.', tag: 'Wrap-up' }
  ]);

  const defaultGuidelines = JSON.stringify([
    'All attendees must have a valid QR pass sent to their registered email.',
    'Teams must have exactly 2 people. Odd group submissions are registered as Solo.',
    'Please attach a clear payment screenshot showing the reference or UTR number.',
    'Tickets are non-transferable at the gate without prior notification.'
  ]);

  const defaultPrizes = JSON.stringify([
    { rank: 'First Place', amount: '₹ 25,000', description: 'Championship Trophy, GenLab fast-track grant, and exclusive developer swag' },
    { rank: 'Runner Up', amount: '₹ 15,000', description: 'Runner-up plaque, cloud infrastructure credits, and community gear' },
    { rank: 'Community Choice', amount: '₹ 7,500', description: 'Special recognition award and sponsor gifts' }
  ]);

  const defaultFaq = JSON.stringify([
    { question: 'What is Friends of Tech (FOT)?', answer: 'FOT is an annual community event presented by GenLab Pvt Ltd where software engineers, product designers, and founders come together to build, learn, and connect.' },
    { question: 'How does team registration work?', answer: 'Teams must have exactly 2 people. When you register, pair team attendees in multiples of 2. Any single extra team selection will be registered as Solo.' },
    { question: 'When will I receive my ticket pass?', answer: 'Your QR pass will be emailed to each registered attendee after payment verification by our team.' },
    { question: 'What should I bring on the day?', answer: 'Please bring your laptop, charger, government or college ID, and the digital QR pass on your phone.' }
  ]);

  const defaultContact = JSON.stringify([
    { role: 'Event Lead', name: 'Community Desk', phone: '+91 98450 11223', email: 'hello@genlab.in' },
    { role: 'Registrations', name: 'Support Team', phone: '+91 98765 43210', email: 'team@fot.community' }
  ]);

  const abstractBannerUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=80';
  const sampleLogoUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';

  if (!existingConfig) {
    db.prepare(`
      INSERT INTO event_config (
        id, name, tagline, description, banner_url, logo_url, genlab_logo_url,
        date_text, time_text, venue_name, venue_address,
        price_per_person, upi_id, upi_name, gpay_qr_url,
        guidelines_json, schedule_json, prizes_json, faq_json, contact_json,
        google_sheet_url, google_sheet_status
      ) VALUES (
        1,
        'Friends of Tech',
        'Where builders meet.',
        'A full day of hands-on building, keynote talks, team sprints, and honest conversations with India’s best tech community. Presented by GenLab Pvt Ltd.',
        ?, ?, ?,
        'Saturday, October 24, 2026',
        '08:30 AM - 06:00 PM IST',
        'Auditorium 01, Tech Innovation Center',
        '100 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka 560034',
        99,
        'genlab.fot@upi',
        'GenLab Pvt Ltd - Friends of Tech',
        'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=genlab.fot@upi%26pn=GenLab%20Pvt%20Ltd%26cu=INR',
        ?, ?, ?, ?, ?,
        'https://docs.google.com/spreadsheets/d/1sample_fot_event_checkins/edit',
        'Ready (Simulated Sync)'
      )
    `).run(
      abstractBannerUrl,
      sampleLogoUrl,
      sampleLogoUrl,
      defaultGuidelines,
      defaultSchedule,
      defaultPrizes,
      defaultFaq,
      defaultContact
    );
  } else {
    db.prepare(`
      UPDATE event_config
      SET
        name = 'Friends of Tech',
        tagline = 'Where builders meet.',
        description = 'A full day of hands-on building, keynote talks, team sprints, and honest conversations with India’s best tech community. Presented by GenLab Pvt Ltd.',
        date_text = 'Saturday, October 24, 2026',
        time_text = '08:30 AM - 06:00 PM IST',
        venue_name = 'Auditorium 01, Tech Innovation Center',
        venue_address = '100 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka 560034',
        price_per_person = 99,
        upi_id = 'genlab.fot@upi',
        upi_name = 'GenLab Pvt Ltd - Friends of Tech',
        guidelines_json = ?,
        schedule_json = ?,
        prizes_json = ?,
        faq_json = ?,
        contact_json = ?
      WHERE id = 1
    `).run(
      defaultGuidelines,
      defaultSchedule,
      defaultPrizes,
      defaultFaq,
      defaultContact
    );
  }

  // Ensure uploads directory exists
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}
