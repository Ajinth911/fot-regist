import React, { useState } from 'react';
import type { AttendeeInput } from '../../types';
import { computePairing } from '../../lib/teamPairing';
import { IconUser, IconUsers, IconAlertCircle, IconArrowRight } from '../../lib/icons';
import { Lightbox } from '../common/Lightbox';

interface Step3ReviewProps {
  attendees: AttendeeInput[];
  totalAmount: number;
  screenshotPreview: string | null;
  utrNumber: string;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export const Step3Review: React.FC<Step3ReviewProps> = ({
  attendees,
  totalAmount,
  screenshotPreview,
  utrNumber,
  isSubmitting,
  onSubmit,
  onBack,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  const pairingResult = computePairing(attendees);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please accept the event terms and conditions to proceed.');
      return;
    }
    setError(null);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#0A0A0A]">
          Review your registration
        </h2>
        <p className="text-[#55554F] text-sm mt-1">
          Please confirm all details before submitting. Passes will be issued to each email after payment verification.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FFF5F5] border border-[#E53935]/30 text-[#E53935] text-sm flex items-center gap-3">
          <IconAlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Booking Overview Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-studio space-y-8">
        {/* Attendees Section */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E6DF] mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C8C85] font-mono">
              Attendees ({attendees.length})
            </h3>
            <span className="text-xs text-[#0A0A0A] font-bold font-mono bg-[#F2F2EC] px-3 py-1 rounded-full">
              {pairingResult.summaryText}
            </span>
          </div>

          {/* Teams Grouping */}
          {pairingResult.teams.length > 0 && (
            <div className="space-y-3 mb-4">
              {pairingResult.teams.map((team) => (
                <div key={team.teamNumber} className="p-5 rounded-xl bg-[#FAFAF7] border border-[#E6E6DF]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0A0A0A] mb-3">
                    <IconUsers size={15} />
                    <span>Team {team.teamNumber} (2 People)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {team.members.map((m) => (
                      <div key={m.id} className="space-y-0.5 p-3 rounded-lg bg-[#FFFFFF] border border-[#E6E6DF]">
                        <div className="text-[#0A0A0A] font-bold">{m.name}</div>
                        <div className="text-[#55554F]">{m.email} · +91 {m.phone}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Solos Grouping */}
          {pairingResult.solos.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#8C8C85] flex items-center gap-1.5 font-mono uppercase">
                <IconUser size={13} />
                <span>Solo Attendees</span>
              </div>
              <div className="space-y-2">
                {pairingResult.solos.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E6E6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[#0A0A0A] font-bold">{s.name}</span>
                      <span className="text-[#55554F] ml-2">{s.email} · +91 {s.phone}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#8C8C85] bg-[#FFFFFF] border border-[#E6E6DF] px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      Solo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Confirmation Proof */}
        <div className="pt-6 border-t border-[#E6E6DF]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C8C85] font-mono mb-4">
            Payment summary
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#FAFAF7] border border-[#E6E6DF]">
            <div className="flex items-center gap-4">
              {screenshotPreview && (
                <button
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  className="relative group shrink-0 cursor-pointer"
                >
                  <img
                    src={screenshotPreview}
                    alt="Payment Proof"
                    className="w-16 h-16 object-cover rounded-lg border border-[#E6E6DF] group-hover:border-[#0A0A0A] transition-colors"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-[10px] text-white font-medium">
                    View
                  </div>
                </button>
              )}
              <div>
                <div className="text-xs text-[#8C8C85]">Total Paid</div>
                <div className="text-2xl font-bold font-mono text-[#0A0A0A]">₹{totalAmount}</div>
                {utrNumber && (
                  <div className="text-xs text-[#55554F] mt-0.5">
                    UTR: <span className="text-[#0A0A0A] font-mono font-semibold">{utrNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-[#55554F] bg-[#FFFFFF] px-3.5 py-2 rounded-lg border border-[#E6E6DF]">
              Method: <strong className="text-[#0A0A0A]">Direct UPI Transfer</strong>
            </div>
          </div>
        </div>

        {/* Terms Consent Checkbox */}
        <div className="pt-6 border-t border-[#E6E6DF]">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded bg-[#FAFAF7] border-[#E6E6DF] text-[#0A0A0A] focus:ring-[#0A0A0A] accent-[#0A0A0A] cursor-pointer"
            />
            <span className="text-xs text-[#55554F] leading-relaxed select-none group-hover:text-[#0A0A0A] transition-colors">
              I agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#0A0A0A] font-bold underline underline-offset-2">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0A0A0A] font-bold underline underline-offset-2">
                Privacy Policy
              </a>
              . I confirm that all provided attendee information is accurate.
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-12 px-6 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] hover:bg-[#F2F2EC] text-sm font-semibold text-[#0A0A0A] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          &larr; Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-8 bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] text-sm font-semibold rounded-xl inline-flex items-center gap-2.5 shadow-md transition-all hover:scale-105 group cursor-pointer disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting registration...</span>
            </>
          ) : (
            <>
              <span>Complete registration</span>
              <span className="w-5 h-5 rounded-full bg-[#C2E600] text-[#0A0A0A] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <IconArrowRight size={12} />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && screenshotPreview && (
        <Lightbox
          isOpen={showLightbox}
          imageUrl={screenshotPreview}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </form>
  );
};
