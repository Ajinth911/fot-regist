import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { IconSearch, IconDownload, IconRefresh } from '../../lib/icons';

interface CheckInItem {
  id: number;
  ticket_code: string;
  scanned_at: string;
  scanned_by: string;
  synced_to_sheets: number;
  attendee_id: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  assigned_category: string;
  team_identifier: string | null;
}

export const CheckInsView: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckInItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCheckIns = () => {
    setLoading(true);
    api.getCheckInsHistory()
      .then((data) => setCheckIns((data.checkIns as CheckInItem[]) || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCheckIns();
  }, []);

  const filtered = checkIns.filter(
    (c) =>
      c.ticket_code.toLowerCase().includes(search.toLowerCase()) ||
      c.attendee_name.toLowerCase().includes(search.toLowerCase()) ||
      c.attendee_email.toLowerCase().includes(search.toLowerCase()) ||
      c.attendee_phone.includes(search) ||
      (c.team_identifier && c.team_identifier.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExportCSV = () => {
    window.open('/api/export/csv?type=checkins', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6E6DF] pb-6">
        <div>
          <span className="text-xs text-[#8C8C85] font-mono uppercase tracking-wider font-bold block mb-1">
            Entrance Records
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#0A0A0A]">
            Check-ins Log
          </h1>
          <p className="text-xs text-[#55554F] mt-1 font-medium">
            Realtime record of on-site attendee arrivals and verified gate entries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCheckIns}
            className="h-10 px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F2EC] border border-[#E6E6DF] text-xs font-bold text-[#0A0A0A] inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <IconRefresh size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-10 px-5 bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <IconDownload size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by ticket code, name, or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input h-10 w-full pl-9 text-xs"
          />
          <span className="absolute left-3 top-3 text-[#8C8C85]">
            <IconSearch size={14} />
          </span>
        </div>

        <span className="text-xs text-[#8C8C85] font-medium font-mono">
          {filtered.length} verified arrivals recorded
        </span>
      </div>

      {/* Check-ins Table Card */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] overflow-hidden shadow-studio">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF7] border-b border-[#E6E6DF] text-[#8C8C85] uppercase tracking-wider font-mono font-bold">
              <tr>
                <th className="py-3.5 px-4 font-bold">Ticket Code</th>
                <th className="py-3.5 px-4 font-bold">Attendee</th>
                <th className="py-3.5 px-4 font-bold">Contact</th>
                <th className="py-3.5 px-4 font-bold">Format</th>
                <th className="py-3.5 px-4 font-bold">Timestamp</th>
                <th className="py-3.5 px-4 font-bold text-right">Gate Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6DF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C8C85]">
                    Loading check-ins history...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C8C85]">
                    No check-in entries recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAFAF7] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#0A0A0A]">
                      {c.ticket_code}
                    </td>

                    <td className="py-4 px-4 font-bold text-[#0A0A0A]">
                      {c.attendee_name}
                    </td>

                    <td className="py-4 px-4 text-[#55554F]">
                      <div>{c.attendee_email}</div>
                      <div className="text-[11px] text-[#8C8C85]">+91 {c.attendee_phone}</div>
                    </td>

                    <td className="py-4 px-4">
                      {c.team_identifier ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F2F2EC] text-[#0A0A0A] font-bold text-[10px] border border-[#E6E6DF]">
                          {c.team_identifier}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAFAF7] text-[#8C8C85] font-mono text-[10px] border border-[#E6E6DF]">
                          Solo
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-[#55554F] font-mono text-[11px]">
                      {new Date(c.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    <td className="py-4 px-4 text-right text-[#8C8C85] font-mono text-[11px]">
                      {c.scanned_by}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
