import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { AttendeeInput, EventConfig } from '../types';
import { api } from '../lib/api';
import { StepIndicator } from '../components/register/StepIndicator';
import { Step1Attendees } from '../components/register/Step1Attendees';
import { Step2Payment } from '../components/register/Step2Payment';
import { Step3Review } from '../components/register/Step3Review';
import { OrderSummaryCard } from '../components/register/OrderSummaryCard';
import { PublicFooter } from '../components/public/PublicFooter';

const STEPS = [
  { step: 1, title: 'Attendees', description: 'Participant details' },
  { step: 2, title: 'Payment', description: 'UPI & verification' },
  { step: 3, title: 'Review', description: 'Confirm booking' },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [attendees, setAttendees] = useState<AttendeeInput[]>([
    {
      id: 'att-1',
      name: '',
      email: '',
      phone: '',
      category: 'SOLO',
    },
  ]);

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  useEffect(() => {
    api.getEventConfig()
      .then((data) => {
        setConfig(data);
        setLoadingConfig(false);
      })
      .catch((err) => {
        console.error('Failed to load event config:', err);
        setLoadingConfig(false);
      });
  }, []);

  const activeConfig: EventConfig = config || {
    id: 1,
    name: 'Friends of Tech',
    tagline: 'Where builders meet.',
    description: 'A full day of hands-on building, keynote talks, team sprints, and honest conversations with India’s best tech community. Presented by GenLab Pvt Ltd.',
    banner_url: '',
    logo_url: '',
    genlab_logo_url: '',
    date_text: 'Saturday, October 24, 2026',
    time_text: '08:30 AM - 06:00 PM IST',
    venue_name: 'Auditorium 01, Tech Innovation Center',
    venue_address: '100 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka 560034',
    price_per_person: 99,
    upi_id: 'genlab.fot@upi',
    upi_name: 'GenLab Pvt Ltd - Friends of Tech',
    gpay_qr_url: '',
    guidelines: [],
    schedule: [],
    prizes: [],
    faq: [],
    contact: [],
    google_sheet_url: '',
    google_sheet_status: 'Unconfigured',
  };

  const handleUpdateAttendee = (id: string, field: keyof AttendeeInput, value: string) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleAddAttendee = () => {
    const newId = `att-${Date.now()}`;
    setAttendees((prev) => [
      ...prev,
      {
        id: newId,
        name: '',
        email: '',
        phone: '',
        category: 'TEAM',
      },
    ]);
  };

  const handleRemoveAttendee = (id: string) => {
    if (attendees.length <= 1) return;
    setAttendees((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async () => {
    if (!screenshotFile) {
      setSubmitError('Please attach your payment screenshot.');
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('payer_name', attendees[0].name.trim());
      formData.append('payer_email', attendees[0].email.trim());
      formData.append('payer_phone', attendees[0].phone.trim());
      formData.append('attendees', JSON.stringify(attendees));
      formData.append('screenshot', screenshotFile);
      if (utrNumber.trim()) {
        formData.append('utr_number', utrNumber.trim());
      }

      const res = await api.submitRegistration(formData);
      if (res.success) {
        navigate(`/register/success?ref=${res.registrationId}&email=${encodeURIComponent(attendees[0].email.trim())}`);
      } else {
        setSubmitError(res.message || 'Registration could not be completed. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Submission error:', err);
      setSubmitError((err as Error).message || 'Server error while submitting registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingConfig && !config) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center text-sm text-[#8C8C85]">
        Loading event details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-[#E6E6DF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <span className="font-display font-bold text-2xl tracking-tight text-[#0A0A0A]">
              FOT<span className="text-[#C2E600]">.</span>
            </span>
            <span className="hidden sm:inline-block text-xs text-[#8C8C85] font-medium border-l border-[#E6E6DF] pl-3">
              Presented by GenLab
            </span>
          </Link>

          <Link
            to="/"
            className="text-xs font-semibold text-[#55554F] hover:text-[#0A0A0A] transition-colors flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Back to event</span>
          </Link>
        </div>
      </header>

      {/* Main Registration Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full flex-1">
        {/* Progress Stepper */}
        <div className="mb-10 sm:mb-14">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep) {
                setCurrentStep(step);
              }
            }}
          />
        </div>

        {submitError && (
          <div className="mb-8 p-4 rounded-xl bg-[#FFF5F5] border border-[#E53935] text-[#E53935] text-sm">
            {submitError}
          </div>
        )}

        {/* 2-Column Grid: Form (7 cols) + Summary (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start pb-20 lg:pb-0">
          <div className="lg:col-span-7">
            {currentStep === 1 && (
              <Step1Attendees
                attendees={attendees}
                pricePerPerson={activeConfig.price_per_person || 99}
                onUpdateAttendee={handleUpdateAttendee}
                onAddAttendee={handleAddAttendee}
                onRemoveAttendee={handleRemoveAttendee}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <Step2Payment
                totalAmount={attendees.length * (activeConfig.price_per_person || 99)}
                upiId={activeConfig.upi_id}
                upiName={activeConfig.upi_name}
                gpayQrUrl={activeConfig.gpay_qr_url}
                screenshotFile={screenshotFile}
                screenshotPreview={screenshotPreview}
                utrNumber={utrNumber}
                onScreenshotChange={(file, preview) => {
                  setScreenshotFile(file);
                  setScreenshotPreview(preview);
                }}
                onUtrChange={setUtrNumber}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <Step3Review
                attendees={attendees}
                totalAmount={attendees.length * (activeConfig.price_per_person || 99)}
                screenshotPreview={screenshotPreview}
                utrNumber={utrNumber}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onBack={() => setCurrentStep(2)}
              />
            )}
          </div>

          <div className="lg:col-span-5">
            <OrderSummaryCard
              attendees={attendees}
              config={activeConfig}
              step={currentStep}
            />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
