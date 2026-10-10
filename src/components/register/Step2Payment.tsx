import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { IconCopy, IconCheck, IconUpload, IconTrash, IconAlertCircle, IconArrowRight } from '../../lib/icons';

interface Step2PaymentProps {
  totalAmount: number;
  upiId: string;
  upiName: string;
  gpayQrUrl?: string;
  screenshotFile: File | null;
  screenshotPreview: string | null;
  utrNumber: string;
  onScreenshotChange: (file: File | null, preview: string | null) => void;
  onUtrChange: (utr: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Payment: React.FC<Step2PaymentProps> = ({
  totalAmount,
  upiId,
  upiName,
  gpayQrUrl,
  screenshotFile,
  screenshotPreview,
  utrNumber,
  onScreenshotChange,
  onUtrChange,
  onNext,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveUpiId = upiId || 'genlab.fot@upi';
  const effectiveUpiName = upiName || 'GenLab Pvt Ltd - Friends of Tech';

  const handleCopy = () => {
    navigator.clipboard.writeText(effectiveUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFiles = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onScreenshotChange(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotFile) {
      setError('Please upload your payment screenshot before proceeding.');
      return;
    }
    setError(null);
    onNext();
  };

  // UPI deep link for mobile apps
  const upiDeepLink = `upi://pay?pa=${effectiveUpiId}&pn=${encodeURIComponent(effectiveUpiName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('FOT Event Pass')}`;

  return (
    <form onSubmit={handleContinue} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#0A0A0A]">
          Payment
        </h2>
        <p className="text-[#55554F] text-sm mt-1">
          Scan the QR or copy the UPI ID below, complete payment, and attach the receipt screenshot.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[#FFF5F5] border border-[#E53935]/30 text-[#E53935] text-sm flex items-center gap-3"
        >
          <IconAlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Main Payment Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-studio space-y-8">
        {/* Total Due Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E6DF]">
          <div>
            <span className="text-xs text-[#8C8C85] uppercase tracking-wider block font-mono font-semibold">Total Amount</span>
            <div className="text-4xl font-bold text-[#0A0A0A] mt-1 font-mono tracking-tight">
              ₹{totalAmount}
            </div>
          </div>
          <div className="text-xs text-[#55554F] bg-[#F2F2EC] px-3.5 py-2 rounded-xl border border-[#E6E6DF]">
            Payee: <strong className="text-[#0A0A0A]">{effectiveUpiName}</strong>
          </div>
        </div>

        {/* QR & UPI ID Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: QR Code Box */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#FAFAF7] rounded-xl border border-[#E6E6DF] space-y-4 text-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-[#FFFFFF] p-3 rounded-xl border border-[#E6E6DF] shadow-sm flex items-center justify-center">
              {gpayQrUrl ? (
                <img
                  src={gpayQrUrl}
                  alt="UPI Payment QR"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-[#E6E6DF] text-center p-2 rounded-lg">
                  <span className="text-xs font-mono font-bold text-[#0A0A0A]">UPI QR</span>
                  <span className="text-[10px] text-[#8C8C85] font-mono mt-1">{effectiveUpiId}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-[#55554F]">
              Scan with Google Pay, PhonePe, Paytm, or any UPI app.
            </p>
          </div>

          {/* Right: UPI ID & Mobile Deep link */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#8C8C85]">
                UPI ID / VPA
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={effectiveUpiId}
                  className="field-input w-full font-mono text-xs text-[#0A0A0A] bg-[#FAFAF7] select-all"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="h-[52px] px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F2EC] border border-[#E6E6DF] text-[#0A0A0A] text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
                >
                  {copied ? (
                    <>
                      <IconCheck size={14} className="text-[#0A0A0A]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <IconCopy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Open UPI App */}
            <div className="sm:hidden pt-2">
              <a
                href={upiDeepLink}
                className="w-full py-3.5 px-4 rounded-xl bg-[#C2E600] text-[#0A0A0A] text-sm font-bold flex items-center justify-center gap-2 text-center shadow-md"
              >
                <span>Open UPI app (₹{totalAmount})</span>
                <IconArrowRight size={14} />
              </a>
            </div>

            {/* Optional UTR */}
            <div className="space-y-1.5">
              <label htmlFor="utr-number" className="block text-xs font-semibold text-[#8C8C85]">
                UTR / Transaction ID <span className="text-[#8C8C85] font-normal">(Optional)</span>
              </label>
              <input
                id="utr-number"
                type="text"
                placeholder="e.g. 428901234567"
                value={utrNumber}
                onChange={(e) => onUtrChange(e.target.value.trim())}
                className="field-input w-full font-mono text-xs"
              />
              <p className="text-[11px] text-[#8C8C85]">
                Entering your 12-digit UTR helps us speed up confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot Upload Dropzone */}
        <div className="space-y-3 pt-6 border-t border-[#E6E6DF]">
          <div>
            <label className="block text-xs font-semibold text-[#0A0A0A]">
              Payment screenshot <span className="text-[#E53935]">*</span>
            </label>
            <p className="text-xs text-[#8C8C85] mt-0.5">
              Your screenshot should clearly show the completed transaction.
            </p>
          </div>

          {!screenshotPreview ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-[#0A0A0A] bg-[#C2E600]/10'
                  : 'border-[#E6E6DF] hover:border-[#0A0A0A] bg-[#FAFAF7] hover:bg-[#FFFFFF]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFiles(e.target.files[0]);
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-11 h-11 rounded-full bg-[#FFFFFF] border border-[#E6E6DF] shadow-sm flex items-center justify-center text-[#0A0A0A]">
                  <IconUpload size={20} />
                </div>
                <div className="text-sm font-semibold text-[#0A0A0A] mt-2">
                  Drop screenshot here or click to browse
                </div>
                <div className="text-xs text-[#8C8C85]">
                  PNG, JPG or WebP up to 5MB
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E6E6DF] flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={screenshotPreview}
                  alt="Payment Screenshot Preview"
                  className="w-14 h-14 object-cover rounded-lg border border-[#E6E6DF] shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#0A0A0A] truncate">
                    {screenshotFile?.name || 'Screenshot attached'}
                  </div>
                  <div className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1 mt-0.5">
                    <IconCheck size={12} />
                    <span>Ready to submit</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F2F2EC] border border-[#E6E6DF] text-xs font-bold text-[#0A0A0A] transition-colors cursor-pointer"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onScreenshotChange(null, null)}
                  className="p-2 rounded-lg text-[#8C8C85] hover:text-[#E53935] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
                  aria-label="Remove screenshot"
                >
                  <IconTrash size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFiles(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-6 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] hover:bg-[#F2F2EC] text-sm font-semibold text-[#0A0A0A] shadow-sm transition-colors cursor-pointer"
        >
          &larr; Back
        </button>
        <button
          type="submit"
          className="h-12 px-8 bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] text-sm font-semibold rounded-xl inline-flex items-center gap-2.5 shadow-md transition-all hover:scale-105 group cursor-pointer"
        >
          <span>Review and submit</span>
          <span className="w-5 h-5 rounded-full bg-[#C2E600] text-[#0A0A0A] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
            <IconArrowRight size={12} />
          </span>
        </button>
      </div>
    </form>
  );
};
