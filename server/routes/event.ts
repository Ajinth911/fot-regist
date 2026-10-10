import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/uploader';
import { syncConfigToSupabase } from '../db/supabase';

const router = Router();

interface RawEventConfig {
  id: number;
  name: string;
  tagline: string;
  description: string;
  banner_url: string;
  logo_url: string;
  genlab_logo_url: string;
  date_text: string;
  time_text: string;
  venue_name: string;
  venue_address: string;
  price_per_person: number;
  upi_id: string;
  upi_name: string;
  gpay_qr_url: string;
  guidelines_json: string;
  schedule_json: string;
  prizes_json: string;
  faq_json: string;
  contact_json: string;
  google_sheet_url: string;
  google_sheet_status: string;
  updated_at: string;
}

function parseConfig(raw: RawEventConfig) {
  return {
    id: raw.id,
    name: raw.name,
    tagline: raw.tagline,
    description: raw.description,
    banner_url: raw.banner_url,
    logo_url: raw.logo_url,
    genlab_logo_url: raw.genlab_logo_url,
    date_text: raw.date_text,
    time_text: raw.time_text,
    venue_name: raw.venue_name,
    venue_address: raw.venue_address,
    price_per_person: raw.price_per_person,
    upi_id: raw.upi_id,
    upi_name: raw.upi_name,
    gpay_qr_url: raw.gpay_qr_url,
    guidelines: JSON.parse(raw.guidelines_json || '[]'),
    schedule: JSON.parse(raw.schedule_json || '[]'),
    prizes: JSON.parse(raw.prizes_json || '[]'),
    faq: JSON.parse(raw.faq_json || '[]'),
    contact: JSON.parse(raw.contact_json || '[]'),
    google_sheet_url: raw.google_sheet_url,
    google_sheet_status: raw.google_sheet_status,
    updated_at: raw.updated_at,
  };
}

// GET /api/event (Public)
router.get('/', (_req: Request, res: Response): void => {
  const row = db.prepare('SELECT * FROM event_config WHERE id = 1').get() as RawEventConfig | undefined;
  if (!row) {
    res.status(404).json({ error: 'Event configuration not found.' });
    return;
  }
  res.json(parseConfig(row));
});

// PUT /api/event (Admin only)
router.put('/', requireAdmin, (req: Request, res: Response): void => {
  const {
    name,
    tagline,
    description,
    banner_url,
    logo_url,
    genlab_logo_url,
    date_text,
    time_text,
    venue_name,
    venue_address,
    price_per_person,
    upi_id,
    upi_name,
    gpay_qr_url,
    guidelines,
    schedule,
    prizes,
    faq,
    contact,
    google_sheet_url,
  } = req.body;

  db.prepare(`
    UPDATE event_config
    SET
      name = COALESCE(?, name),
      tagline = COALESCE(?, tagline),
      description = COALESCE(?, description),
      banner_url = COALESCE(?, banner_url),
      logo_url = COALESCE(?, logo_url),
      genlab_logo_url = COALESCE(?, genlab_logo_url),
      date_text = COALESCE(?, date_text),
      time_text = COALESCE(?, time_text),
      venue_name = COALESCE(?, venue_name),
      venue_address = COALESCE(?, venue_address),
      price_per_person = COALESCE(?, price_per_person),
      upi_id = COALESCE(?, upi_id),
      upi_name = COALESCE(?, upi_name),
      gpay_qr_url = COALESCE(?, gpay_qr_url),
      guidelines_json = COALESCE(?, guidelines_json),
      schedule_json = COALESCE(?, schedule_json),
      prizes_json = COALESCE(?, prizes_json),
      faq_json = COALESCE(?, faq_json),
      contact_json = COALESCE(?, contact_json),
      google_sheet_url = COALESCE(?, google_sheet_url),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    name,
    tagline,
    description,
    banner_url,
    logo_url,
    genlab_logo_url,
    date_text,
    time_text,
    venue_name,
    venue_address,
    price_per_person ? Number(price_per_person) : null,
    upi_id,
    upi_name,
    gpay_qr_url,
    guidelines ? JSON.stringify(guidelines) : null,
    schedule ? JSON.stringify(schedule) : null,
    prizes ? JSON.stringify(prizes) : null,
    faq ? JSON.stringify(faq) : null,
    contact ? JSON.stringify(contact) : null,
    google_sheet_url
  );

  const updated = db.prepare('SELECT * FROM event_config WHERE id = 1').get() as RawEventConfig;
  
  // Background mirror to Supabase cloud
  syncConfigToSupabase(updated).catch(err => console.warn('[SUPABASE] Config sync error:', err));

  res.json({
    success: true,
    message: 'Event parameters updated successfully.',
    config: parseConfig(updated),
  });
});

// POST /api/event/upload (Upload image assets)
router.post('/upload', requireAdmin, upload.single('image'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file uploaded.' });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
  });
});

export default router;
