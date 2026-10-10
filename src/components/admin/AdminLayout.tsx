import React from 'react';
import type { AdminUser } from '../../types';
import {
  IconUsers,
  IconQrCode,
  IconTicket,
  IconSettings,
  IconExternalLink,
  IconLock,
  IconCamera,
  IconCalendar,
} from '../../lib/icons';

export type AdminTab = 'overview' | 'event' | 'registrations' | 'scanner' | 'checkins' | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  admin: AdminUser;
  onLogout: () => void;
  onViewPublic: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  admin,
  onLogout,
  onViewPublic,
  children,
}) => {
  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <IconTicket size={18} /> },
    { id: 'event', label: 'Event Content', icon: <IconCalendar size={18} /> },
    { id: 'registrations', label: 'Registrations', icon: <IconUsers size={18} /> },
    { id: 'scanner', label: 'Scanner', icon: <IconCamera size={18} /> },
    { id: 'checkins', label: 'Check-ins', icon: <IconQrCode size={18} /> },
    { id: 'settings', label: 'Settings', icon: <IconSettings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col md:flex-row">
      {/* Fixed Left Sidebar */}
      <aside className="w-full md:w-64 lg:w-72 bg-[#FFFFFF] border-r border-[#E6E6DF] flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 z-30 shadow-sm">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#E6E6DF] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight text-[#0A0A0A]">
                  FOT<span className="text-[#C2E600]">.</span>
                </span>
                <span className="text-xs text-[#8C8C85] font-semibold border-l border-[#E6E6DF] pl-2">
                  Organiser
                </span>
              </div>
              <span className="text-[11px] text-[#8C8C85] block mt-0.5 font-medium">
                Presented by GenLab
              </span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#0A0A0A] text-[#FAFAF7] shadow-sm'
                      : 'text-[#55554F] hover:text-[#0A0A0A] hover:bg-[#F2F2EC]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Switchers */}
        <div className="p-4 border-t border-[#E6E6DF] space-y-3">
          <div className="p-3.5 bg-[#FAFAF7] rounded-xl border border-[#E6E6DF]">
            <span className="text-[#8C8C85] block text-[10px] uppercase font-mono font-bold tracking-wider">Logged in as</span>
            <span className="text-[#0A0A0A] text-xs font-semibold truncate block mt-0.5">{admin.email}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onViewPublic}
              className="py-2.5 px-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F2EC] border border-[#E6E6DF] text-[#0A0A0A] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <IconExternalLink size={13} />
              <span>Live site</span>
            </button>
            <button
              onClick={onLogout}
              className="py-2.5 px-3 rounded-xl bg-[#FFF5F5] hover:bg-[#FEE2E2] text-[#E53935] border border-[#E53935]/20 font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <IconLock size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#FAFAF7] overflow-y-auto">
        <div className="p-6 sm:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
