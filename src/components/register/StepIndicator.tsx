import React from 'react';
import { motion } from 'framer-motion';

interface Step {
  step: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto select-none">
      <div className={`grid gap-2 sm:gap-4 relative ${steps.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {steps.map((s) => {
          const isCompleted = s.step < currentStep;
          const isActive = s.step === currentStep;

          return (
            <button
              key={s.step}
              type="button"
              disabled={s.step > currentStep}
              onClick={() => onStepClick && onStepClick(s.step)}
              className={`p-3 sm:p-4 rounded-xl text-left border transition-all relative overflow-hidden flex flex-col justify-between min-h-[72px] ${
                isActive
                  ? 'bg-[#FFFFFF] border-[#0A0A0A] shadow-studio'
                  : isCompleted
                  ? 'bg-[#FFFFFF] border-[#E6E6DF] hover:border-[#0A0A0A]/40 cursor-pointer'
                  : 'bg-[#F2F2EC] border-[#E6E6DF] opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Sliding Active Lime Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeStepIndicator"
                  className="absolute top-0 left-0 right-0 h-1 bg-[#C2E600]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#8C8C85]">
                  0{s.step}
                </span>
                {isCompleted && (
                  <span className="w-4 h-4 rounded-full bg-[#0A0A0A] text-[#FAFAF7] text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
              </div>

              <div>
                <div className="text-xs sm:text-sm font-bold text-[#0A0A0A] tracking-tight">
                  {s.title}
                </div>
                <div className="text-[10px] text-[#8C8C85] hidden sm:block truncate">
                  {s.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
