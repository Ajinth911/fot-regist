import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AttendeeInput } from '../../types';
import { computePairing } from '../../lib/teamPairing';
import { IconPlus, IconTrash, IconUser, IconUsers, IconAlertCircle, IconArrowRight } from '../../lib/icons';

interface Step1AttendeesProps {
  attendees: AttendeeInput[];
  pricePerPerson: number;
  onUpdateAttendee: (id: string, field: keyof AttendeeInput, value: string) => void;
  onAddAttendee: () => void;
  onRemoveAttendee: (id: string) => void;
  onNext: () => void;
}

export const Step1Attendees: React.FC<Step1AttendeesProps> = ({
  attendees,
  pricePerPerson,
  onUpdateAttendee,
  onAddAttendee,
  onRemoveAttendee,
  onNext,
}) => {
  const pairingResult = computePairing(attendees);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate step 1 fields
  const validateForm = (): string | null => {
    for (let i = 0; i < attendees.length; i++) {
      const a = attendees[i];
      const personLabel = i === 0 ? 'Person 1 (Payer)' : `Person ${i + 1}`;
      if (!a.name.trim()) {
        return `Please enter full name for ${personLabel}.`;
      }
      if (!a.email.trim() || !/^\S+@\S+\.\S+$/.test(a.email.trim())) {
        return `Please enter a valid email address for ${personLabel}.`;
      }
      const cleanPhone = a.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return `Please enter a valid 10-digit mobile number for ${personLabel}.`;
      }
    }
    return null;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#0A0A0A]">
          Attendee details
        </h2>
        <p className="text-[#55554F] text-sm mt-1">
          Person 1 is the primary contact and will complete payment for this booking.
        </p>
      </div>

      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[#FFF5F5] border border-[#E53935]/30 text-[#E53935] text-sm flex items-center gap-3"
        >
          <IconAlertCircle size={18} className="shrink-0" />
          <span>{validationError}</span>
        </motion.div>
      )}

      {/* Attendees list */}
      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {attendees.map((attendee, index) => {
            const isPayer = index === 0;
            const oddNotice = pairingResult.oddPersonNotice && pairingResult.oddPersonId === attendee.id;

            // Find if this attendee is part of a paired team
            const teamPair = pairingResult.teams.find((t) =>
              t.members.some((m) => m.id === attendee.id)
            );

            return (
              <motion.div
                key={attendee.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-studio space-y-6 relative"
              >
                {/* Team Bracket Chip if paired */}
                {teamPair && attendee.category === 'TEAM' && (
                  <div className="absolute top-4 right-6 hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAF7] border border-[#E6E6DF] text-[11px] font-bold text-[#0A0A0A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C2E600]" />
                    <span>Team {teamPair.teamNumber}</span>
                  </div>
                )}

                {/* Card Title & Remove */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#F2F2EC] text-[#0A0A0A] text-xs font-bold font-mono flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-base font-bold text-[#0A0A0A]">
                      {isPayer ? 'Primary Attendee (Payer)' : `Attendee ${index + 1}`}
                    </span>
                    <span className="text-xs font-mono font-medium text-[#8C8C85] bg-[#FAFAF7] px-2.5 py-0.5 rounded-full border border-[#E6E6DF]">
                      ₹{pricePerPerson}
                    </span>
                  </div>

                  {!isPayer && (
                    <button
                      type="button"
                      onClick={() => onRemoveAttendee(attendee.id)}
                      className="text-xs text-[#8C8C85] hover:text-[#E53935] transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-[#FFF5F5]"
                    >
                      <IconTrash size={14} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor={`name-${attendee.id}`} className="block text-xs font-semibold text-[#8C8C85]">
                      Full name <span className="text-[#E53935]">*</span>
                    </label>
                    <input
                      id={`name-${attendee.id}`}
                      type="text"
                      placeholder="e.g. Rohan Sharma"
                      value={attendee.name}
                      onChange={(e) => onUpdateAttendee(attendee.id, 'name', e.target.value)}
                      className="field-input w-full"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor={`email-${attendee.id}`} className="block text-xs font-semibold text-[#8C8C85]">
                      Email address <span className="text-[#E53935]">*</span>
                    </label>
                    <input
                      id={`email-${attendee.id}`}
                      type="email"
                      placeholder="e.g. rohan@example.com"
                      value={attendee.email}
                      onChange={(e) => onUpdateAttendee(attendee.id, 'email', e.target.value)}
                      className="field-input w-full"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor={`phone-${attendee.id}`} className="block text-xs font-semibold text-[#8C8C85]">
                      Phone number <span className="text-[#E53935]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs text-[#8C8C85] font-semibold pointer-events-none">
                        +91
                      </span>
                      <input
                        id={`phone-${attendee.id}`}
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={attendee.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          onUpdateAttendee(attendee.id, 'phone', val);
                        }}
                        className="field-input w-full pl-12"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Solo vs Team Segmented Control */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E6E6DF]">
                  <div className="text-xs text-[#55554F] font-medium">
                    Participation track:
                  </div>

                  <div className="relative inline-flex bg-[#F2F2EC] p-1 rounded-xl border border-[#E6E6DF] self-start sm:self-auto">
                    {/* Sliding white thumb */}
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute top-1 bottom-1 rounded-lg bg-[#FFFFFF] shadow-sm"
                      style={{
                        left: attendee.category === 'SOLO' ? '4px' : '50%',
                        right: attendee.category === 'SOLO' ? '50%' : '4px',
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => onUpdateAttendee(attendee.id, 'category', 'SOLO')}
                      className={`relative z-10 px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                        attendee.category === 'SOLO' ? 'text-[#0A0A0A]' : 'text-[#8C8C85] hover:text-[#0A0A0A]'
                      }`}
                    >
                      <IconUser size={13} />
                      <span>Solo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateAttendee(attendee.id, 'category', 'TEAM')}
                      className={`relative z-10 px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                        attendee.category === 'TEAM' ? 'text-[#0A0A0A]' : 'text-[#8C8C85] hover:text-[#0A0A0A]'
                      }`}
                    >
                      <IconUsers size={13} />
                      <span>Team (2 people)</span>
                    </button>
                  </div>
                </div>

                {/* Friendly odd-one-out note */}
                {oddNotice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs text-[#55554F] bg-[#FAFAF7] p-3.5 rounded-xl border border-[#E6E6DF] flex items-start gap-2.5"
                  >
                    <IconAlertCircle size={15} className="text-[#0A0A0A] shrink-0 mt-0.5" />
                    <span>
                      Teams need exactly 2 people, so <strong className="text-[#0A0A0A]">{attendee.name || 'this attendee'}</strong> will be registered as Solo unless another team member is added.
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add another person button */}
      <div>
        <button
          type="button"
          onClick={onAddAttendee}
          className="w-full py-4 px-6 rounded-2xl border-2 border-dashed border-[#E6E6DF] hover:border-[#0A0A0A] text-[#0A0A0A] text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#FAFAF7] shadow-card-subtle cursor-pointer"
        >
          <IconPlus size={16} />
          <span>Add another person (₹{pricePerPerson})</span>
        </button>
      </div>

      {/* Continue Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          className="h-12 px-8 bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] text-sm font-semibold rounded-xl inline-flex items-center gap-2.5 shadow-md transition-all hover:scale-105 group"
        >
          <span>Continue to payment</span>
          <span className="w-5 h-5 rounded-full bg-[#C2E600] text-[#0A0A0A] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
            <IconArrowRight size={12} />
          </span>
        </button>
      </div>
    </form>
  );
};
