import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AttendeeInput } from '../../types';
import { computePairing } from '../../lib/teamPairing';
import { api } from '../../lib/api';
import { IconPlus, IconTrash, IconUser, IconUsers, IconAlertCircle, IconArrowRight, IconShield } from '../../lib/icons';

interface Step1AttendeesProps {
  attendees: AttendeeInput[];
  pricePerPerson: number;
  onUpdateAttendee: (id: string, field: keyof AttendeeInput, value: string) => void;
  onAddAttendee: () => void;
  onRemoveAttendee: (id: string) => void;
  onNext: () => void;
}

interface AttendeeErrors {
  name?: string;
  email?: string;
  phone?: string;
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
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [honeypot, setHoneypot] = useState<string>('');

  // Field-level error tracking and touched state
  const [fieldErrors, setFieldErrors] = useState<Record<string, AttendeeErrors>>({});
  const [touched, setTouched] = useState<Record<string, Record<string, boolean>>>({});

  // Single field validation rule
  const validateField = (_id: string, field: keyof AttendeeErrors, value: string): string | undefined => {
    const val = value.trim();
    if (field === 'name') {
      if (!val) return 'Full name is required.';
      if (val.length < 2) return 'Name must be at least 2 characters.';
      if (val.length > 100) return 'Name must be under 100 characters.';
      if (!/^[\p{L}\s.'-]+$/u.test(val)) return 'Name contains invalid characters.';
    }
    if (field === 'email') {
      if (!val) return 'Email address is required.';
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(val)) return 'Please enter a valid email address.';
    }
    if (field === 'phone') {
      const clean = value.replace(/\D/g, '').slice(-10);
      if (clean.length !== 10) return 'Please enter a valid 10-digit mobile number.';
      if (!/^[6-9]\d{9}$/.test(clean)) return 'Mobile number must start with 6, 7, 8, or 9.';
    }
    return undefined;
  };

  const handleBlur = (id: string, field: keyof AttendeeErrors, value: string) => {
    setTouched((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: true },
    }));

    const error = validateField(id, field, value);
    setFieldErrors((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: error },
    }));
  };

  const handleChange = (id: string, field: keyof AttendeeInput, value: string) => {
    onUpdateAttendee(id, field, value);

    // If already touched, validate live
    if (touched[id]?.[field as keyof AttendeeErrors]) {
      const error = validateField(id, field as keyof AttendeeErrors, value);
      setFieldErrors((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), [field]: error },
      }));
    }
  };

  // Validate all fields across all attendees
  const validateForm = (): boolean => {
    const newErrors: Record<string, AttendeeErrors> = {};
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    let hasError = false;

    for (let i = 0; i < attendees.length; i++) {
      const a = attendees[i];
      const attErr: AttendeeErrors = {};

      const nameErr = validateField(a.id, 'name', a.name);
      if (nameErr) {
        attErr.name = nameErr;
        hasError = true;
      }

      const emailErr = validateField(a.id, 'email', a.email);
      if (emailErr) {
        attErr.email = emailErr;
        hasError = true;
      } else {
        const cleanEmail = a.email.trim().toLowerCase();
        if (seenEmails.has(cleanEmail)) {
          attErr.email = 'Duplicate email. Each attendee must have a unique email.';
          hasError = true;
        }
        seenEmails.add(cleanEmail);
      }

      const phoneErr = validateField(a.id, 'phone', a.phone);
      if (phoneErr) {
        attErr.phone = phoneErr;
        hasError = true;
      } else {
        const cleanPhone = a.phone.replace(/\D/g, '').slice(-10);
        if (seenPhones.has(cleanPhone)) {
          attErr.phone = 'Duplicate mobile number. Each attendee must have a unique phone.';
          hasError = true;
        }
        seenPhones.add(cleanPhone);
      }

      if (Object.keys(attErr).length > 0) {
        newErrors[a.id] = attErr;
      }
    }

    setFieldErrors(newErrors);
    return !hasError;
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot bot protection
    if (honeypot.trim() !== '') {
      console.warn('Bot submission blocked via honeypot.');
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      setValidationError('Please fix the highlighted errors before continuing.');
      return;
    }

    setValidationError(null);
    setIsChecking(true);

    try {
      const checkRes = await api.checkAttendees(attendees);
      if (!checkRes.valid) {
        setValidationError(checkRes.error || 'One or more attendees are already registered.');
        setIsChecking(false);
        return;
      }
      setIsChecking(false);
      onNext();
    } catch (err: unknown) {
      const status = (err as any)?.status;
      if (status === 409 || status === 400 || status === 429) {
        const msg = (err as Error).message || 'One or more attendees are already registered.';
        setValidationError(msg);
        setIsChecking(false);
        return;
      }
      console.warn('Attendee pre-check skipped due to network or non-fatal status:', err);
      setIsChecking(false);
      onNext();
    }
  };

  return (
    <form onSubmit={handleContinue} className="space-y-8" noValidate>
      {/* Bot defense honeypot (Invisible to genuine users & screen readers) */}
      <div
        className="opacity-0 absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
        tabIndex={-1}
      >
        <label htmlFor="hp_website">Leave this field blank</label>
        <input
          type="text"
          id="hp_website"
          name="hp_website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Header */}
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">
          Attendee Details
        </h2>
        <p className="text-[#44443F] text-sm mt-1 leading-relaxed">
          Person 1 is the primary contact and will complete payment for this booking.
        </p>
      </div>

      {/* Global Alert Notification with Accessible Live Region */}
      {validationError && (
        <motion.div
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[#FFF5F5] border border-[#E53935]/40 text-[#D32F2F] text-sm flex items-center gap-3 shadow-xs"
        >
          <IconAlertCircle size={18} className="shrink-0 text-[#D32F2F]" />
          <span className="font-medium leading-relaxed">{validationError}</span>
        </motion.div>
      )}

      {/* Attendees list */}
      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {attendees.map((attendee, index) => {
            const isPayer = index === 0;
            const oddNotice = pairingResult.oddPersonNotice && pairingResult.oddPersonId === attendee.id;
            const errors = fieldErrors[attendee.id] || {};

            // Find if this attendee is part of a paired team
            const teamPair = pairingResult.teams.find((t) =>
              t.members.some((m) => m.id === attendee.id)
            );

            return (
              <motion.fieldset
                key={attendee.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-studio space-y-6 relative border-l-4 border-l-[#C2E600]"
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
                  <legend className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#F2F2EC] text-[#0A0A0A] text-xs font-bold font-mono flex items-center justify-center border border-[#E6E6DF]">
                      {index + 1}
                    </span>
                    <span className="text-base font-bold text-[#0A0A0A]">
                      {isPayer ? 'Primary Attendee (Payer)' : `Attendee ${index + 1}`}
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#44443F] bg-[#FAFAF7] px-2.5 py-0.5 rounded-full border border-[#E6E6DF]">
                      ₹{pricePerPerson}
                    </span>
                  </legend>

                  {!isPayer && (
                    <button
                      type="button"
                      onClick={() => onRemoveAttendee(attendee.id)}
                      aria-label={`Remove Attendee ${index + 1}`}
                      className="min-h-[44px] min-w-[44px] text-xs font-semibold text-[#55554F] hover:text-[#D32F2F] transition-colors flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-[#FFF5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F]"
                    >
                      <IconTrash size={14} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`name-${attendee.id}`}
                      className="block text-xs font-bold text-[#33332D] tracking-wide"
                    >
                      Full Name <span className="text-[#D32F2F]">*</span>
                    </label>
                    <input
                      id={`name-${attendee.id}`}
                      name={`name_${attendee.id}`}
                      type="text"
                      inputMode="text"
                      autoComplete="name"
                      maxLength={100}
                      placeholder="e.g. Rohan Sharma"
                      value={attendee.name}
                      onBlur={(e) => handleBlur(attendee.id, 'name', e.target.value)}
                      onChange={(e) => handleChange(attendee.id, 'name', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? `err-name-${attendee.id}` : undefined}
                      className={`field-input w-full text-base sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
                        errors.name ? '!border-[#D32F2F] !bg-[#FFF5F5]' : ''
                      }`}
                      required
                    />
                    {errors.name && (
                      <p
                        id={`err-name-${attendee.id}`}
                        className="text-xs text-[#D32F2F] font-medium flex items-center gap-1 mt-1"
                      >
                        <IconAlertCircle size={12} className="shrink-0" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`email-${attendee.id}`}
                      className="block text-xs font-bold text-[#33332D] tracking-wide"
                    >
                      Email Address <span className="text-[#D32F2F]">*</span>
                    </label>
                    <input
                      id={`email-${attendee.id}`}
                      name={`email_${attendee.id}`}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      maxLength={120}
                      placeholder="e.g. rohan@example.com"
                      value={attendee.email}
                      onBlur={(e) => handleBlur(attendee.id, 'email', e.target.value)}
                      onChange={(e) => handleChange(attendee.id, 'email', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? `err-email-${attendee.id}` : undefined}
                      className={`field-input w-full text-base sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
                        errors.email ? '!border-[#D32F2F] !bg-[#FFF5F5]' : ''
                      }`}
                      required
                    />
                    {errors.email && (
                      <p
                        id={`err-email-${attendee.id}`}
                        className="text-xs text-[#D32F2F] font-medium flex items-center gap-1 mt-1"
                      >
                        <IconAlertCircle size={12} className="shrink-0" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`phone-${attendee.id}`}
                      className="block text-xs font-bold text-[#33332D] tracking-wide"
                    >
                      Phone Number <span className="text-[#D32F2F]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs text-[#44443F] font-bold pointer-events-none select-none">
                        +91
                      </span>
                      <input
                        id={`phone-${attendee.id}`}
                        name={`phone_${attendee.id}`}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={attendee.phone}
                        onBlur={(e) => handleBlur(attendee.id, 'phone', e.target.value)}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleChange(attendee.id, 'phone', val);
                        }}
                        aria-required="true"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? `err-phone-${attendee.id}` : undefined}
                        className={`field-input w-full !pl-12 text-base sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
                          errors.phone ? '!border-[#D32F2F] !bg-[#FFF5F5]' : ''
                        }`}
                        required
                      />
                    </div>
                    {errors.phone && (
                      <p
                        id={`err-phone-${attendee.id}`}
                        className="text-xs text-[#D32F2F] font-medium flex items-center gap-1 mt-1"
                      >
                        <IconAlertCircle size={12} className="shrink-0" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Solo vs Team Segmented Control */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E6E6DF]">
                  <span className="text-xs text-[#44443F] font-semibold">
                    Participation track:
                  </span>

                  <div
                    role="radiogroup"
                    aria-label={`Participation track for ${isPayer ? 'Primary Attendee' : `Attendee ${index + 1}`}`}
                    className="relative inline-flex bg-[#F2F2EC] p-1 rounded-xl border border-[#E6E6DF] self-start sm:self-auto"
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute top-1 bottom-1 rounded-lg bg-[#FFFFFF] shadow-xs"
                      style={{
                        left: attendee.category === 'SOLO' ? '4px' : '50%',
                        right: attendee.category === 'SOLO' ? '50%' : '4px',
                      }}
                    />

                    <button
                      type="button"
                      role="radio"
                      aria-checked={attendee.category === 'SOLO'}
                      onClick={() => onUpdateAttendee(attendee.id, 'category', 'SOLO')}
                      className={`min-h-[44px] relative z-10 px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
                        attendee.category === 'SOLO' ? 'text-[#0A0A0A]' : 'text-[#55554F] hover:text-[#0A0A0A]'
                      }`}
                    >
                      <IconUser size={13} />
                      <span>Solo</span>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={attendee.category === 'TEAM'}
                      onClick={() => onUpdateAttendee(attendee.id, 'category', 'TEAM')}
                      className={`min-h-[44px] relative z-10 px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] ${
                        attendee.category === 'TEAM' ? 'text-[#0A0A0A]' : 'text-[#55554F] hover:text-[#0A0A0A]'
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
                    className="text-xs text-[#44443F] bg-[#FAFAF7] p-3.5 rounded-xl border border-[#E6E6DF] flex items-start gap-2.5"
                  >
                    <IconAlertCircle size={15} className="text-[#0A0A0A] shrink-0 mt-0.5" />
                    <span>
                      Teams need exactly 2 people, so <strong className="text-[#0A0A0A]">{attendee.name || 'this attendee'}</strong> will be registered as Solo unless another team member is added.
                    </span>
                  </motion.div>
                )}
              </motion.fieldset>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add another person button */}
      <div>
        <button
          type="button"
          onClick={onAddAttendee}
          className="min-h-[52px] w-full py-4 px-6 rounded-2xl border-2 border-dashed border-[#E6E6DF] hover:border-[#0A0A0A] text-[#0A0A0A] text-sm font-bold transition-all flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#FAFAF7] shadow-card-subtle cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]"
        >
          <IconPlus size={16} />
          <span>Add another person (₹{pricePerPerson})</span>
        </button>
      </div>



      {/* Trust Footnote */}
      <div className="flex items-center gap-2 text-xs text-[#55554F] px-1">
        <IconShield size={14} className="text-[#0A0A0A] shrink-0" />
        <span>Your data is securely processed with 256-bit encryption. No spam, ever.</span>
      </div>

      {/* Continue Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isChecking}
          className="min-h-[48px] h-12 px-8 bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] text-sm font-bold rounded-xl inline-flex items-center gap-2.5 shadow-md transition-all hover:scale-105 group cursor-pointer disabled:opacity-75 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2E600]"
        >
          {isChecking ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying availability...</span>
            </>
          ) : (
            <>
              <span>Continue to review</span>
              <span className="w-5 h-5 rounded-full bg-[#C2E600] text-[#0A0A0A] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <IconArrowRight size={12} />
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
