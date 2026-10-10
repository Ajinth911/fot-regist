import React, { useState } from 'react';
import type { Registration, Attendee } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { IconSearch, IconEye, IconCheck, IconTrash, IconUsers, IconFilter, IconUser, IconLoader } from '../../lib/icons';

interface GroupRegistrationsViewProps {
  registrations: Registration[];
  onConfirm: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onResendEmail: (attendeeId: string) => Promise<void>;
  onPreviewScreenshot: (url: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const GroupRegistrationsView: React.FC<GroupRegistrationsViewProps> = ({
  registrations,
  onConfirm,
  onReject,
  onResendEmail,
  onPreviewScreenshot,
  loading,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Payment screenshot unreadable or transaction reference not found.');

  // Filter groups: attendee_count > 1
  const groupRegistrations = registrations.filter((r) => r.attendee_count > 1);

  const filtered = groupRegistrations.filter((reg) => {
    const matchSearch =
      reg.id.toLowerCase().includes(search.toLowerCase()) ||
      reg.payer_name.toLowerCase().includes(search.toLowerCase()) ||
      reg.payer_email.toLowerCase().includes(search.toLowerCase()) ||
      reg.attendees?.some(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase()) ||
          a.ticket_code?.toLowerCase().includes(search.toLowerCase())
      );

    const matchStatus = statusFilter === 'all' || reg.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleConfirmGroup = async (id: string) => {
    setActionInProgress(id);
    try {
      await onConfirm(id);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenRejectModal = (id: string) => {
    setSelectedRegId(id);
    setRejectionReason('Payment screenshot unreadable or transaction reference not found.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRegId) return;
    setActionInProgress(selectedRegId);
    try {
      await onReject(selectedRegId, rejectionReason);
      setRejectModalOpen(false);
    } finally {
      setActionInProgress(null);
      setSelectedRegId(null);
    }
  };

  // Group attendees by team identifier
  const getGroupedAttendees = (attendees: Attendee[] = []) => {
    const teamsMap = new Map<string, Attendee[]>();
    const solosList: Attendee[] = [];

    attendees.forEach((a) => {
      if (a.team_identifier) {
        if (!teamsMap.has(a.team_identifier)) {
          teamsMap.set(a.team_identifier, []);
        }
        teamsMap.get(a.team_identifier)!.push(a);
      } else {
        solosList.push(a);
      }
    });

    return { teams: Array.from(teamsMap.entries()), solos: solosList };
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search group booking or attendee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input h-10 w-full pl-9 text-xs"
          />
          <span className="absolute left-3 top-3 text-[#8C8C85]">
            <IconSearch size={14} />
          </span>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <IconFilter size={14} className="text-[#8C8C85] hidden sm:inline" />
          <div className="inline-flex bg-[#F2F2EC] p-1 rounded-xl border border-[#E6E6DF] w-full sm:w-auto justify-between">
            {(['all', 'pending', 'confirmed', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#FFFFFF] text-[#0A0A0A] shadow-sm'
                    : 'text-[#8C8C85] hover:text-[#0A0A0A]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-[#8C8C85] bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF]">
            Loading group bookings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#8C8C85] bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF]">
            No group registrations matching criteria.
          </div>
        ) : (
          filtered.map((reg) => {
            const { teams, solos } = getGroupedAttendees(reg.attendees);
            const inProgress = actionInProgress === reg.id;

            return (
              <div
                key={reg.id}
                className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E6DF]">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#0A0A0A]">
                        {reg.id}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F2F2EC] text-[#0A0A0A] border border-[#E6E6DF]">
                        {reg.attendee_count} Attendees
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#0A0A0A] mt-1">
                      Payer: {reg.payer_name} · <span className="text-[#55554F] font-normal">{reg.payer_email} · +91 {reg.payer_phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-[#8C8C85] block font-mono">Total Paid</span>
                      <span className="font-mono font-bold text-[#0A0A0A] text-lg">₹{reg.total_amount}</span>
                    </div>

                    <div>
                      {reg.status === 'confirmed' && <Badge variant="success">Confirmed</Badge>}
                      {reg.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                      {reg.status === 'rejected' && <Badge variant="danger">Rejected</Badge>}
                    </div>
                  </div>
                </div>

                {/* Group Breakdown: Teams & Solos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Teams */}
                  {teams.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-[#8C8C85] uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <IconUsers size={14} />
                        <span>Paired 2-Person Teams ({teams.length})</span>
                      </span>

                      {teams.map(([teamName, members]) => (
                        <div key={teamName} className="p-3.5 bg-[#FAFAF7] rounded-xl border border-[#E6E6DF] space-y-2">
                          <span className="text-xs font-bold text-[#0A0A0A] block">
                            {teamName}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {members.map((m) => (
                              <div key={m.id} className="p-2 bg-[#FFFFFF] rounded-lg border border-[#E6E6DF] flex flex-col justify-between">
                                <div>
                                  <div className="font-bold text-[#0A0A0A]">{m.name}</div>
                                  <div className="text-[11px] text-[#55554F] truncate">{m.email}</div>
                                </div>
                                {m.ticket_code && (
                                  <div className="mt-1 flex items-center justify-between text-[10px]">
                                    <span className="font-mono text-[#8C8C85]">{m.ticket_code}</span>
                                    <button
                                      type="button"
                                      onClick={() => onResendEmail(m.id)}
                                      className="text-[#0A0A0A] font-bold hover:underline"
                                    >
                                      Resend
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Solos */}
                  {solos.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-[#8C8C85] uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <IconUser size={14} />
                        <span>Solo Attendees ({solos.length})</span>
                      </span>

                      <div className="space-y-2">
                        {solos.map((s) => (
                          <div key={s.id} className="p-3 bg-[#FAFAF7] rounded-xl border border-[#E6E6DF] flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-[#0A0A0A]">{s.name}</div>
                              <div className="text-[11px] text-[#55554F]">{s.email} · +91 {s.phone}</div>
                            </div>
                            {s.ticket_code && (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-[#8C8C85]">{s.ticket_code}</span>
                                <button
                                  type="button"
                                  onClick={() => onResendEmail(s.id)}
                                  className="text-xs text-[#0A0A0A] font-bold hover:underline"
                                >
                                  Resend
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E6E6DF]">
                  <div className="flex items-center gap-3">
                    {reg.payment_screenshot_url && (
                      <button
                        type="button"
                        onClick={() => onPreviewScreenshot(reg.payment_screenshot_url!)}
                        className="text-xs text-[#0A0A0A] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <IconEye size={14} />
                        <span>View payment screenshot</span>
                      </button>
                    )}
                    {reg.utr_number && (
                      <span className="text-xs font-mono text-[#8C8C85]">
                        UTR: <strong className="text-[#0A0A0A]">{reg.utr_number}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {reg.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          disabled={inProgress}
                          onClick={() => handleConfirmGroup(reg.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all ${
                            inProgress
                              ? 'bg-[#E6E6DF] text-[#8C8C85] cursor-not-allowed'
                              : 'bg-[#C2E600] hover:bg-[#b5db00] text-[#0A0A0A] cursor-pointer'
                          }`}
                        >
                          {inProgress ? <IconLoader size={14} /> : <IconCheck size={14} />}
                          <span>{inProgress ? 'Confirming...' : `Confirm All (${reg.attendee_count})`}</span>
                        </button>
                        <button
                          type="button"
                          disabled={inProgress}
                          onClick={() => handleOpenRejectModal(reg.id)}
                          className="px-4 py-2 rounded-xl bg-[#FFF5F5] hover:bg-[#FEE2E2] text-[#E53935] border border-[#E53935]/20 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <IconTrash size={14} />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Group Booking"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#55554F]">
              Specify the reason for rejecting group booking <strong className="text-[#0A0A0A] font-mono">{selectedRegId}</strong>.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="field-input w-full resize-none text-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#FFFFFF] border border-[#E6E6DF] hover:bg-[#F2F2EC] text-[#0A0A0A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#E53935] hover:bg-[#c62828] text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
