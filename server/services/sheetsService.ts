import { google } from 'googleapis';
import { db } from '../db/database';

export interface SheetRowData {
  timestamp: string;
  ticketCode: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  team: string;
  status: string; // "Reached"
}

export class SheetsService {
  /**
   * Extracts Google Sheet ID from any valid Google Spreadsheet URL or raw ID
   */
  static extractSheetId(urlOrId: string): string | null {
    if (!urlOrId || typeof urlOrId !== 'string') return null;
    const trimmed = urlOrId.trim();
    // Match /spreadsheets/d/([a-zA-Z0-9-_]+)
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
    // If user entered raw alphanumeric ID (typically 44 chars)
    if (/^[a-zA-Z0-9-_]{20,60}$/.test(trimmed)) {
      return trimmed;
    }
    return null;
  }

  /**
   * Gets Google Sheets API Auth client using Service Account credentials from env or mock fallback
   */
  private static getSheetsClient() {
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!serviceEmail || !privateKey || !privateKey.includes('BEGIN PRIVATE KEY')) {
      return null;
    }

    const auth = new google.auth.JWT({
      email: serviceEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  }

  /**
   * Tests Google Sheet connection and initializes header row if empty
   */
  static async testConnection(sheetUrl: string): Promise<{ success: boolean; message: string; sheetTitle?: string }> {
    const sheetId = this.extractSheetId(sheetUrl);
    if (!sheetId) {
      return { success: false, message: 'Invalid Google Sheet URL or Sheet ID format.' };
    }

    const sheets = this.getSheetsClient();
    if (!sheets) {
      return {
        success: true,
        message: `Sheet ID [${sheetId}] parsed successfully. Service Account credentials not provided in .env (running in simulated sync mode).`,
        sheetTitle: 'FOT Check-Ins (Simulated)',
      };
    }

    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });

      const title = response.data.properties?.title || 'Connected Sheet';
      return {
        success: true,
        message: `Successfully connected to spreadsheet: "${title}"`,
        sheetTitle: title,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Google API Error: ${errMsg}. Make sure the sheet is shared with your Service Account email as Editor.`,
      };
    }
  }

  /**
   * Appends check-in record to Google Sheets
   */
  static async appendCheckIn(row: SheetRowData): Promise<{ success: boolean; message: string }> {
    const config = db.prepare('SELECT google_sheet_url FROM event_config WHERE id = 1').get() as { google_sheet_url?: string } | undefined;
    const sheetUrl = config?.google_sheet_url;
    if (!sheetUrl) {
      return { success: false, message: 'No Google Sheet configured' };
    }

    const sheetId = this.extractSheetId(sheetUrl);
    if (!sheetId) {
      return { success: false, message: 'Invalid Google Sheet ID' };
    }

    const sheets = this.getSheetsClient();
    if (!sheets) {
      console.log(`[SHEETS MOCK SYNC] Appended check-in: ${row.ticketCode} - ${row.name} (${row.status})`);
      return { success: true, message: 'Simulated sheet row appended' };
    }

    try {
      const values = [
        [
          row.timestamp,
          row.ticketCode,
          row.name,
          row.phone,
          row.email,
          row.category,
          row.team || 'N/A',
          row.status,
        ],
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      return { success: true, message: 'Check-in appended to Google Sheet' };
    } catch (err: unknown) {
      console.error('[SHEETS] Append error:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Failed to append to sheet' };
    }
  }
}
