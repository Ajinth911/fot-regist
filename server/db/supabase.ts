import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { db } from './database';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log(`[SUPABASE] Initialized live cloud client for ${supabaseUrl}`);
  } catch (err) {
    console.error('[SUPABASE] Failed to initialize Supabase client:', err);
  }
} else {
  console.log('[SUPABASE] Cloud credentials not configured. Using local SQLite store.');
}

/**
 * Normalizes password value into a secure bcrypt hash.
 * If entered as plain-text in Supabase dashboard, hashes it with bcrypt.
 */
export function normalizePasswordHash(passwordOrHash: string): string {
  if (!passwordOrHash) return '';
  const trimmed = passwordOrHash.trim();
  if (trimmed.startsWith('$2a$') || trimmed.startsWith('$2b$') || trimmed.startsWith('$2y$')) {
    return trimmed;
  }
  return bcrypt.hashSync(trimmed, 10);
}

/**
 * Safely verifies if an entered plain-text password matches a stored hash or plain-text password.
 */
export function comparePassword(plainPassword: string, storedHashOrPlain: string): boolean {
  if (!plainPassword || !storedHashOrPlain) return false;
  const trimmedStored = storedHashOrPlain.trim();
  if (trimmedStored.startsWith('$2a$') || trimmedStored.startsWith('$2b$') || trimmedStored.startsWith('$2y$')) {
    try {
      return bcrypt.compareSync(plainPassword, trimmedStored);
    } catch {
      return false;
    }
  }
  return plainPassword === trimmedStored;
}

/**
 * Fetches all admins from Supabase and synchronizes them into local SQLite.
 */
export async function syncAdminsFromSupabase(): Promise<{ count: number; error?: string }> {
  if (!supabase) return { count: 0, error: 'Supabase client not initialized' };

  try {
    const { data: remoteAdmins, error } = await supabase
      .from('admins')
      .select('*');

    if (error) {
      console.warn('[SUPABASE SYNC] Failed to fetch admins from Supabase:', error.message);
      return { count: 0, error: error.message };
    }

    if (!remoteAdmins || remoteAdmins.length === 0) {
      return { count: 0 };
    }

    const insertOrUpdate = db.prepare(`
      INSERT INTO admins (email, password_hash)
      VALUES (?, ?)
      ON CONFLICT(email) DO UPDATE SET
        password_hash = excluded.password_hash
    `);

    const transaction = db.transaction(() => {
      for (const adm of remoteAdmins) {
        if (!adm.email) continue;
        const cleanEmail = String(adm.email).trim().toLowerCase();
        const hash = normalizePasswordHash(adm.password_hash);
        insertOrUpdate.run(cleanEmail, hash);
      }
    });

    transaction();
    console.log(`[SUPABASE SYNC] Automatically synchronized ${remoteAdmins.length} admins from Supabase into local database.`);
    return { count: remoteAdmins.length };
  } catch (err: any) {
    console.error('[SUPABASE SYNC] Exception synchronizing admins:', err);
    return { count: 0, error: err.message };
  }
}

/**
 * Realtime subscription to automatically sync when an admin is added, updated, or removed in Supabase
 */
export function initSupabaseAdminRealtime() {
  if (!supabase) return;

  // 1. Initial sync on startup
  syncAdminsFromSupabase().catch(err => {
    console.warn('[SUPABASE SYNC] Initial admin sync failed:', err);
  });

  // 2. Realtime listener for Postgres changes on public.admins
  try {
    supabase
      .channel('supabase-admins-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admins' }, async (payload) => {
        console.log(`[SUPABASE REALTIME] Detected admin ${payload.eventType} event in Supabase. Synchronizing local database...`);
        await syncAdminsFromSupabase();
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ [SUPABASE REALTIME] Connected to live admin updates channel.');
        } else if (err) {
          console.warn('[SUPABASE REALTIME] Subscription error:', err);
        }
      });

    // 3. Periodic fallback poll every 30 seconds to guarantee freshness
    setInterval(() => {
      syncAdminsFromSupabase().catch(() => {});
    }, 30 * 1000).unref();
  } catch (err) {
    console.error('[SUPABASE REALTIME] Failed to set up realtime admin channel:', err);
  }
}

/**
 * Syncs event configuration to Supabase
 */
export async function syncConfigToSupabase(config: Record<string, unknown>) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('event_config').upsert({
      id: 1,
      ...config,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('[SUPABASE SYNC] Error updating event_config:', error.message);
    } else {
      console.log('[SUPABASE SYNC] Event config synced to Supabase cloud.');
    }
  } catch (err) {
    console.warn('[SUPABASE SYNC] Sync failed:', err);
  }
}

/**
 * Syncs a new registration and its attendees to Supabase
 */
export async function syncRegistrationToSupabase(
  reg: {
    id: string;
    payer_name: string;
    payer_email: string;
    payer_phone: string;
    total_amount: number;
    attendee_count: number;
    payment_screenshot_url: string;
    utr_number?: string;
    status: string;
    created_at?: string;
  },
  attendees: Array<{
    id: string;
    ticket_code: string;
    registration_id: string;
    name: string;
    email: string;
    phone: string;
    requested_category: string;
    assigned_category: string;
    team_identifier?: string;
    signed_token?: string;
    qr_data_url?: string;
    id_card_url?: string;
    status: string;
    created_at?: string;
  }>
) {
  if (!supabase) return;
  try {
    const { error: regError } = await supabase.from('registrations').upsert(reg);
    if (regError) {
      console.warn('[SUPABASE SYNC] Error syncing registration:', regError.message);
    }

    if (attendees && attendees.length > 0) {
      const { error: attError } = await supabase.from('attendees').upsert(attendees);
      if (attError) {
        console.warn('[SUPABASE SYNC] Error syncing attendees:', attError.message);
      }
    }
    console.log(`[SUPABASE SYNC] Registration ${reg.id} & ${attendees.length} attendees synced to cloud.`);
  } catch (err) {
    console.warn('[SUPABASE SYNC] Registration sync failed:', err);
  }
}

/**
 * Syncs check-in to Supabase
 */
export async function syncCheckInToSupabase(checkIn: {
  attendee_id: string;
  ticket_code: string;
  scanned_by: string;
  notes?: string;
  created_at?: string;
}) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('check_ins').insert(checkIn);
    if (error) {
      console.warn('[SUPABASE SYNC] Error syncing check-in:', error.message);
    } else {
      console.log(`[SUPABASE SYNC] Check-in for ticket ${checkIn.ticket_code} synced to cloud.`);
    }
  } catch (err) {
    console.warn('[SUPABASE SYNC] Check-in sync failed:', err);
  }
}
