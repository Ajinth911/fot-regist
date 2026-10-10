import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
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
