import React, { useState } from 'react';
import type { Registration } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { IconSearch, IconEye, IconCheck, IconTrash, IconMail, IconFilter, IconLoader } from '../../lib/icons';

interface SoloRegistrationsViewProps {
  registrations: Registration[];
  onConfirm: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onResendEmail: (attendeeId: string) => Promise<void>;
  onPreviewScreenshot: (url: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const SoloRegistrationsView: React.FC<SoloRegistrationsViewProps> = ({
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

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Payment screenshot unreadable or transaction reference not found.');

  // Filter solo registrations (attendee_count === 1)
  const soloRegistrations = registrations.filter((r) => r.attendee_count === 1);

  const filtered = soloRegistrations.filter((reg) => {
    const att = reg.attendees?.[0];
    const matchSearch =
      reg.id.toLowerCase().includes(search.toLowerCase()) ||
      reg.payer_name.toLowerCase().includes(search.toLowerCase()) ||
      reg.payer_email.toLowerCase().includes(search.toLowerCase()) ||
      reg.payer_phone.includes(search) ||
      (att && (att.name.toLowerCase().includes(search.toLowerCase()) || att.ticket_code?.toLowerCase().includes(search.toLowerCase())));

    const matchStatus = statusFilter === 'all' || reg.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleConfirmAction = async (id: string) => {
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

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-studio">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, email, or code..."
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

      {/* Registrations Table Card */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] overflow-hidden shadow-studio">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF7] border-b border-[#E6E6DF] text-[#8C8C85] uppercase tracking-wider font-mono font-bold">
              <tr>
                <th className="py-3.5 px-4 font-bold">Reference / Attendee</th>
                <th className="py-3.5 px-4 font-bold">Contact</th>
                <th className="py-3.5 px-4 font-bold">Payment Proof</th>
                <th className="py-3.5 px-4 font-bold">Amount</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6DF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C8C85]">
                    Loading attendee registrations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C8C85]">
                    No solo registrations matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((reg) => {
                  const attendee = reg.attendees?.[0];
                  const inProgress = actionInProgress === reg.id;

                  return (
                    <tr key={reg.id} className="hover:bg-[#FAFAF7] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-mono text-[11px] font-bold text-[#0A0A0A]">
                          {reg.id}
                        </div>
                        <div className="font-bold text-[#0A0A0A] text-sm mt-0.5">
                          {attendee?.name || reg.payer_name}
                        </div>
                        {attendee?.ticket_code && (
                          <div className="text-[10px] font-mono text-[#8C8C85] mt-0.5">
                            Pass: {attendee.ticket_code}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-[#55554F]">
                        <div className="text-xs font-medium text-[#0A0A0A]">{reg.payer_email}</div>
                        <div className="text-[11px] text-[#8C8C85] mt-0.5">+91 {reg.payer_phone}</div>
                      </td>

                      <td className="py-4 px-4">
                        {reg.payment_screenshot_url ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onPreviewScreenshot(reg.payment_screenshot_url!)}
                              className="relative group cursor-pointer"
                            >
                              <img
                                src={reg.payment_screenshot_url}
                                alt="Payment proof"
                                className="w-10 h-10 object-cover rounded-lg border border-[#E6E6DF] group-hover:border-[#0A0A0A] transition-colors"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center text-[9px] text-white font-bold">
                                View
                              </div>
                            </button>
                            {reg.utr_number && (
                              <span className="font-mono text-[10px] text-[#8C8C85] block truncate max-w-[100px]">
                                {reg.utr_number}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#8C8C85]">No screenshot</span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-[#0A0A0A] text-sm">
                        ₹{reg.total_amount}
                      </td>

                      <td className="py-4 px-4">
                        {reg.status === 'confirmed' && (
                          <Badge variant="success">Confirmed</Badge>
                        )}
                        {reg.status === 'pending' && (
                          <Badge variant="warning">Pending</Badge>
                        )}
                        {reg.status === 'rejected' && (
                          <Badge variant="danger">Rejected</Badge>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {reg.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                disabled={inProgress}
                                onClick={() => handleConfirmAction(reg.id)}
                                className={`p-2 rounded-lg font-bold transition-all shadow-sm ${
                                  inProgress
                                    ? 'bg-[#E6E6DF] text-[#8C8C85] cursor-not-allowed'
                                    : 'bg-[#C2E600] hover:bg-[#b5db00] text-[#0A0A0A] cursor-pointer'
                                }`}
                                title={inProgress ? 'Confirming and issuing pass...' : 'Confirm registration & email pass'}
                              >
                                {inProgress ? <IconLoader size={14} /> : <IconCheck size={14} />}
                              </button>
                              <button
                                type="button"
                                disabled={inProgress}
                                onClick={() => handleOpenRejectModal(reg.id)}
                                className="p-2 rounded-lg bg-[#FFF5F5] hover:bg-[#FEE2E2] text-[#E53935] border border-[#E53935]/20 font-bold transition-colors cursor-pointer"
                                title="Reject payment"
                              >
                                <IconTrash size={14} />
                              </button>
                            </>
                          )}

                          {reg.status === 'confirmed' && attendee && (
                            <button
                              type="button"
                              onClick={() => onResendEmail(attendee.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#FAFAF7] hover:bg-[#F2F2EC] border border-[#E6E6DF] text-[#0A0A0A] font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="Resend entry pass email"
                            >
                              <IconMail size={12} />
                              <span>Resend pass</span>
                            </button>
                          )}

                          {reg.payment_screenshot_url && (
                            <button
                              type="button"
                              onClick={() => onPreviewScreenshot(reg.payment_screenshot_url!)}
                              className="p-2 rounded-lg bg-[#FAFAF7] hover:bg-[#F2F2EC] border border-[#E6E6DF] text-[#55554F] hover:text-[#0A0A0A] transition-colors cursor-pointer"
                              title="Preview screenshot"
                            >
                              <IconEye size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Registration"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#55554F]">
              Specify the reason for rejecting registration <strong className="text-[#0A0A0A] font-mono">{selectedRegId}</strong>.
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
