import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#FAFAF7] hairline-t py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block font-display text-2xl font-bold tracking-tight text-[#0A0A0A]">
              Friends of Tech<span className="text-[#C2E600]">.</span>
            </Link>
            <p className="text-sm text-[#55554F] max-w-md leading-relaxed">
              An annual gathering for engineers, designers, and founders building software and hardware. Presented by GenLab Pvt Ltd.
            </p>
          </div>

          {/* Event Quick Details */}
          <div className="space-y-3 text-sm font-medium">
            <span className="text-xs text-[#8C8C85] uppercase tracking-wider block font-semibold font-mono">Event Details</span>
            <div className="text-xs text-[#55554F]">Saturday, October 24, 2026</div>
            <div className="text-xs text-[#55554F]">08:30 AM - 06:00 PM IST</div>
            <div className="text-xs text-[#55554F]">Auditorium 01, Bengaluru</div>
          </div>

          {/* Legal & Organiser Links */}
          <div className="space-y-3 text-sm font-medium">
            <span className="text-xs text-[#8C8C85] uppercase tracking-wider block font-semibold font-mono">Information</span>
            <div><Link to="/" className="text-[#55554F] hover:text-[#0A0A0A] transition-colors">Registration</Link></div>
            <div><Link to="/terms" className="text-[#55554F] hover:text-[#0A0A0A] transition-colors">Terms of Service</Link></div>
            <div><Link to="/privacy" className="text-[#55554F] hover:text-[#0A0A0A] transition-colors">Privacy Policy</Link></div>
            <div className="pt-2">
              <Link to="/admin/login" className="text-xs text-[#8C8C85] hover:text-[#0A0A0A] transition-colors">
                Organiser login &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="hairline-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C8C85]">
          <span>&copy; 2026 GenLab Pvt Ltd. All rights reserved.</span>
          <span>Bengaluru, India · Friends of Tech 2026</span>
        </div>
      </div>
    </footer>
  );
};
