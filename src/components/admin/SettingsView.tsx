import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { IconCheck, IconAlertCircle, IconRefresh, IconTrash, IconLoader } from '../../lib/icons';

export const SettingsView: React.FC = () => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [currentStatus, setCurrentStatus] = useState('Unconfigured');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Email SMTP Test State
  const [testRecipient, setTestRecipient] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Reset State
  const [resetting, setResetting] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetResult, setResetResult] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleResetAllData = async () => {
    setResetting(true);
    setResetResult(null);
    setResetError(null);
    try {
      const res = await api.resetAllData();
      setResetResult(res.message);
      setConfirmingReset(false);
    } catch (err: unknown) {
      console.error('Reset error:', err);
      setResetError((err as Error).message || 'Failed to reset data.');
      setConfirmingReset(false);
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    api.getEventConfig().then((cfg) => {
      setSheetUrl(cfg.google_sheet_url || '');
      setCurrentStatus(cfg.google_sheet_status || 'Unconfigured');
    });
  }, []);

  const handleSendTestEmail = async () => {
    if (!testRecipient.trim()) return;
    setSendingEmail(true);
    setEmailResult(null);

    try {
      const res = await api.testEmail(testRecipient.trim());
      setEmailResult(res);
    } catch (err: unknown) {
      setEmailResult({
        success: false,
        message: (err as Error).message || 'Failed to send test email.',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleTestConnection = async () => {
    if (!sheetUrl.trim()) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.testSheetsConnection(sheetUrl.trim());
      setTestResult(res);
      if (res.success) {
        setCurrentStatus(`Connected (${res.sheetTitle || 'Active'})`);
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: (err as Error).message || 'Failed to connect to Google Sheets.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.syncSheets();
      setSyncMessage(res.message);
    } catch (err: unknown) {
      setSyncMessage((err as Error).message || 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E6E6DF] pb-6">
        <span className="text-xs text-[#8C8C85] font-mono uppercase tracking-wider font-bold block mb-1">
          Integrations & Cloud Sync
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#0A0A0A]">
          Settings
        </h1>
        <p className="text-xs text-[#55554F] mt-1 font-medium">
          Connect your Google Spreadsheet to automatically sync attendee check-in rows in realtime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Google Sheet Link Setup */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-6">
            <div className="flex items-center justify-between border-b border-[#E6E6DF] pb-4">
              <h2 className="text-lg font-bold text-[#0A0A0A]">
                Google Sheets Integration
              </h2>
              <span className="text-xs text-[#0A0A0A] font-bold px-3 py-1 bg-[#F2F2EC] rounded-full border border-[#E6E6DF]">
                {currentStatus}
              </span>
            </div>

            <p className="text-[#55554F] text-xs leading-relaxed">
              Paste your Google Sheet link below. On every confirmed gate check-in scan, a row is automatically appended with: <span className="text-[#0A0A0A] font-semibold">Timestamp, Ticket Code, Name, Phone, Email, Category, Team, and Status ("Reached")</span>.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="sheet-url" className="block text-xs font-semibold text-[#8C8C85]">
                Google Spreadsheet URL
              </label>
              <input
                type="url"
                id="sheet-url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="field-input w-full text-xs font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                disabled={testing}
                onClick={handleTestConnection}
                className="h-10 px-5 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                {testing ? 'Testing connection...' : 'Test connection & save'}
              </button>

              <button
                type="button"
                disabled={syncing}
                onClick={handleManualSync}
                className="h-10 px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F2EC] border border-[#E6E6DF] text-xs font-bold text-[#0A0A0A] inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <IconRefresh size={14} className={syncing ? 'animate-spin' : ''} />
                <span>Sync pending records</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-4 text-xs rounded-xl border flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-[#F0FDF4] border-[#10B981]/30 text-[#10B981]'
                    : 'bg-[#FFF5F5] border-[#E53935]/30 text-[#E53935]'
                }`}
              >
                {testResult.success ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}

            {syncMessage && (
              <div className="p-4 bg-[#FAFAF7] rounded-xl border border-[#E6E6DF] text-[#0A0A0A] text-xs font-medium">
                {syncMessage}
              </div>
            )}
          </div>

          {/* Section: Email (SMTP) Dispatcher */}
          <div className="p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-6">
            <div className="flex items-center justify-between border-b border-[#E6E6DF] pb-4">
              <h2 className="text-lg font-bold text-[#0A0A0A]">
                SMTP Email Dispatcher
              </h2>
              <span className="text-xs text-[#0A0A0A] font-bold px-3 py-1 bg-[#F2F2EC] rounded-full border border-[#E6E6DF]">
                Pass Notifications
              </span>
            </div>

            <p className="text-[#55554F] text-xs leading-relaxed">
              When registrations are confirmed by an administrator, the platform automatically generates SVG passes and dispatches them via SMTP.
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="test-email-input" className="block text-xs font-semibold text-[#8C8C85]">
                  Test recipient email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    id="test-email-input"
                    placeholder="your-email@example.com"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="field-input flex-1 text-xs"
                  />
                  <button
                    type="button"
                    disabled={sendingEmail || !testRecipient.trim()}
                    onClick={handleSendTestEmail}
                    className="h-10 px-5 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {sendingEmail ? 'Sending...' : 'Send test pass'}
                  </button>
                </div>
              </div>

              {emailResult && (
                <div
                  className={`p-4 text-xs rounded-xl border flex items-start gap-2.5 ${
                    emailResult.success
                      ? 'bg-[#F0FDF4] border-[#10B981]/30 text-[#10B981]'
                      : 'bg-[#FFF5F5] border-[#E53935]/30 text-[#E53935]'
                  }`}
                >
                  {emailResult.success ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
                  <span>{emailResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Service Account Instructions */}
        <div className="lg:col-span-5 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] p-6 sm:p-8 space-y-4 shadow-studio">
          <span className="text-xs text-[#8C8C85] font-mono uppercase tracking-wider font-bold block">
            Setup Guide
          </span>
          <h2 className="text-base font-bold text-[#0A0A0A]">
            Google Service Account Configuration
          </h2>

          <div className="space-y-3.5 text-xs text-[#55554F] leading-relaxed">
            <div className="p-4 bg-[#FAFAF7] rounded-xl border border-[#E6E6DF] space-y-1">
              <strong className="text-[#0A0A0A] block">1. Enable Google Sheets API</strong>
              <span>In Google Cloud Console, enable "Google Sheets API" under APIs & Services.</span>
            </div>

            <div className="p-4 bg-[#FAFAF7] rounded-xl border border-[#E6E6DF] space-y-1">
              <strong className="text-[#0A0A0A] block">2. Create Service Account Key</strong>
              <span>Generate a Service Account key in JSON format and configure environment secrets:</span>
              <code className="block text-[#0A0A0A] bg-[#FFFFFF] p-2 rounded-lg border border-[#E6E6DF] text-[11px] font-mono mt-1">
                GOOGLE_SERVICE_ACCOUNT_EMAIL=...<br />
                GOOGLE_PRIVATE_KEY=...
              </code>
            </div>

            <div className="p-4 bg-[#FAFAF7] rounded-xl border border-[#E6E6DF] space-y-1">
              <strong className="text-[#0A0A0A] block">3. Share Your Sheet</strong>
              <span>Click "Share" on your Google Sheet and invite the Service Account Email with <strong>Editor</strong> access.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Test Data */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E53935]/20 p-6 sm:p-8 space-y-4 shadow-studio">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-[#E53935] font-mono uppercase tracking-wider font-bold block mb-1">
              Danger Zone
            </span>
            <h2 className="text-base font-bold text-[#0A0A0A]">
              Reset All Test & Registration Data
            </h2>
            <p className="text-xs text-[#55554F] mt-1 max-w-xl">
              Permanently wipe all registrations, attendees, attendee portal accounts, and check-in records.
              Event configuration, schedule, ticket prices, and Admin credentials will remain preserved.
            </p>
          </div>

          {!confirmingReset ? (
            <button
              type="button"
              disabled={resetting}
              onClick={() => setConfirmingReset(true)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all shadow-sm ${
                resetting
                  ? 'bg-[#E6E6DF] text-[#8C8C85] cursor-not-allowed'
                  : 'bg-[#FFF5F5] hover:bg-[#FEE2E2] text-[#E53935] border border-[#E53935]/30 cursor-pointer'
              }`}
            >
              {resetting ? <IconLoader size={14} /> : <IconTrash size={14} />}
              <span>{resetting ? 'Resetting records...' : 'Reset'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={resetting}
                onClick={handleResetAllData}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-[#FAFAF7] inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {resetting ? <IconLoader size={14} /> : <IconTrash size={14} />}
                <span>{resetting ? 'Resetting...' : 'Confirm Reset'}</span>
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={() => setConfirmingReset(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FFFFFF] border border-[#E6E6DF] hover:bg-[#F2F2EC] text-[#55554F] transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {resetResult && (
          <div className="p-3.5 bg-[#F0FDF4] border border-[#10B981]/30 rounded-xl text-xs text-[#10B981] flex items-center gap-2">
            <IconCheck size={16} />
            <span>{resetResult}</span>
          </div>
        )}

        {resetError && (
          <div className="p-3.5 bg-[#FFF5F5] border border-[#E53935]/30 rounded-xl text-xs text-[#E53935] flex items-center gap-2">
            <IconAlertCircle size={16} />
            <span>{resetError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
