import React, { useState } from 'react';
import type { AttendeeInput, EventConfig } from '../../types';
import { computePairing } from '../../lib/teamPairing';
import { IconChevronDown, IconCalendar, IconMapPin, IconShield } from '../../lib/icons';

interface OrderSummaryCardProps {
  attendees: AttendeeInput[];
  config: EventConfig;
  step: number;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  attendees,
  config,
  step,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const pairing = computePairing(attendees);
  const totalAmount = attendees.length * (config.price_per_person || 99);

  return (
    <>
      {/* Desktop Sticky Card */}
      <div className="hidden lg:block sticky top-24 space-y-6">
        <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-studio space-y-6">
          <div className="pb-5 border-b border-[#E6E6DF]">
            <span className="text-xs uppercase tracking-wider text-[#8C8C85] font-bold font-mono block">
              Booking Summary
            </span>
            <div className="text-3xl font-bold font-mono text-[#0A0A0A] mt-1">
              ₹{totalAmount}
            </div>
            <div className="text-xs text-[#55554F] font-medium mt-1">
              {pairing.summaryText}
            </div>
          </div>

          {/* Breakdown items */}
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between text-[#55554F]">
              <span>Ticket price</span>
              <span className="text-[#0A0A0A] font-semibold">₹{config.price_per_person || 99} per person</span>
            </div>
            <div className="flex items-center justify-between text-[#55554F]">
              <span>Attendees</span>
              <span className="text-[#0A0A0A] font-mono font-bold">{attendees.length}</span>
            </div>
            <div className="flex items-center justify-between text-[#55554F]">
              <span>Team allocation</span>
              <span className="text-[#0A0A0A] font-semibold">
                {pairing.teams.length > 0 ? `${pairing.teams.length} team${pairing.teams.length > 1 ? 's' : ''}` : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#55554F]">
              <span>Solo allocation</span>
              <span className="text-[#0A0A0A] font-semibold">
                {pairing.solos.length > 0 ? `${pairing.solos.length} solo` : 'None'}
              </span>
            </div>

            <div className="pt-4 border-t border-[#E6E6DF] flex items-center justify-between font-bold">
              <span className="text-[#0A0A0A] text-sm">Total due</span>
              <span className="text-[#0A0A0A] font-mono text-lg">₹{totalAmount}</span>
            </div>
          </div>

          {/* Event Quick Details */}
          <div className="pt-5 border-t border-[#E6E6DF] space-y-3 text-xs text-[#55554F]">
            <div className="flex items-start gap-2.5">
              <IconCalendar size={16} className="text-[#0A0A0A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#0A0A0A] font-semibold block">{config.date_text}</span>
                <span className="text-[#8C8C85]">{config.time_text}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <IconMapPin size={16} className="text-[#0A0A0A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#0A0A0A] font-semibold block">{config.venue_name}</span>
                <span className="text-[#8C8C85] line-clamp-2">{config.venue_address}</span>
              </div>
            </div>
          </div>

          {/* Trust badge */}
          <div className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E6E6DF] flex items-center gap-3 text-[11px] text-[#55554F]">
            <IconShield size={16} className="text-[#0A0A0A] shrink-0" />
            <span>Passes are emailed immediately after payment verification.</span>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] border-t border-[#E6E6DF] shadow-studio">
        {/* Expanded Drawer */}
        {mobileExpanded && (
          <div className="p-5 space-y-3 text-xs border-b border-[#E6E6DF] bg-[#FAFAF7]">
            <div className="flex items-center justify-between text-[#55554F]">
              <span>Ticket price:</span>
              <span className="text-[#0A0A0A] font-semibold">₹{config.price_per_person || 99} each</span>
            </div>
            <div className="flex items-center justify-between text-[#55554F]">
              <span>Attendees:</span>
              <span className="text-[#0A0A0A] font-semibold">{pairing.summaryText}</span>
            </div>
            <div className="flex items-center justify-between text-[#55554F]">
              <span>Event Date:</span>
              <span className="text-[#0A0A0A] font-semibold">{config.date_text}</span>
            </div>
            <div className="flex items-center justify-between text-[#55554F]">
              <span>Venue:</span>
              <span className="text-[#0A0A0A] font-semibold truncate max-w-[200px]">{config.venue_name}</span>
            </div>
          </div>
        )}

        {/* Collapsed Bar */}
        <div className="px-5 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div>
              <div className="text-[10px] uppercase text-[#8C8C85] font-bold tracking-wider font-mono">
                Total · {pairing.summaryText}
              </div>
              <div className="text-xl font-bold font-mono text-[#0A0A0A]">
                ₹{totalAmount}
              </div>
            </div>
            <IconChevronDown
              size={16}
              className={`text-[#8C8C85] transition-transform ${mobileExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          <span className="text-xs text-[#8C8C85] font-bold font-mono">
            Step {step} of 3
          </span>
        </div>
      </div>
    </>
  );
};
