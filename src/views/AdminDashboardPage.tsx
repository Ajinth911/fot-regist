import React, { useState, useEffect } from 'react';
import type { AdminUser, Registration } from '../types';
import { api } from '../lib/api';
import { AdminLayout } from '../components/admin/AdminLayout';
import type { AdminTab } from '../components/admin/AdminLayout';
import { OverviewView } from '../components/admin/OverviewView';
import { EventEditorView } from '../components/admin/EventEditorView';
import { SoloRegistrationsView } from '../components/admin/SoloRegistrationsView';
import { GroupRegistrationsView } from '../components/admin/GroupRegistrationsView';
import { ScannerView } from '../components/admin/ScannerView';
import { CheckInsView } from '../components/admin/CheckInsView';
import { SettingsView } from '../components/admin/SettingsView';
import { Lightbox } from '../components/common/Lightbox';

interface AdminDashboardPageProps {
  admin: AdminUser;
  onLogout: () => void;
  onViewPublic: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  admin,
  onLogout,
  onViewPublic,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [regSubTab, setRegSubTab] = useState<'solo' | 'group'>('solo');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const loadRegistrations = () => {
    setLoadingRegs(true);
    api.getRegistrations()
      .then((data) => setRegistrations(data.registrations || []))
      .catch(console.error)
      .finally(() => setLoadingRegs(false));
  };

  useEffect(() => {
    if (currentTab === 'registrations') {
      loadRegistrations();
    }
  }, [currentTab]);

  const handleConfirm = async (id: string) => {
    await api.confirmRegistration(id);
    loadRegistrations();
  };

  const handleReject = async (id: string, reason: string) => {
    await api.rejectRegistration(id, reason);
    loadRegistrations();
  };

  const handleResendEmail = async (attendeeId: string) => {
    await api.resendTicketEmail(attendeeId);
    alert('Pass re-sent successfully to attendee email.');
  };

  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      admin={admin}
      onLogout={onLogout}
      onViewPublic={onViewPublic}
    >
      {currentTab === 'overview' && <OverviewView />}

      {currentTab === 'event' && <EventEditorView onViewPublic={onViewPublic} />}

      {currentTab === 'registrations' && (
        <div className="space-y-6">
          {/* Header & Subtab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6E6DF] pb-6">
            <div>
              <span className="text-xs text-[#8C8C85] font-mono uppercase tracking-wider font-bold block mb-1">
                Attendee verification
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight text-[#0A0A0A]">
                Registrations
              </h1>
            </div>

            {/* Solo vs Team / Group Tab Switcher */}
            <div className="inline-flex bg-[#FFFFFF] border border-[#E6E6DF] p-1 rounded-xl text-xs shadow-sm">
              <button
                onClick={() => setRegSubTab('solo')}
                className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                  regSubTab === 'solo'
                    ? 'bg-[#0A0A0A] text-[#FAFAF7]'
                    : 'text-[#55554F] hover:text-[#0A0A0A]'
                }`}
              >
                Solo ({registrations.filter((r) => r.attendee_count === 1).length})
              </button>
              <button
                onClick={() => setRegSubTab('group')}
                className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                  regSubTab === 'group'
                    ? 'bg-[#0A0A0A] text-[#FAFAF7]'
                    : 'text-[#55554F] hover:text-[#0A0A0A]'
                }`}
              >
                Team & Group ({registrations.filter((r) => r.attendee_count > 1).length})
              </button>
            </div>
          </div>

          {regSubTab === 'solo' ? (
            <SoloRegistrationsView
              registrations={registrations}
              onConfirm={handleConfirm}
              onReject={handleReject}
              onResendEmail={handleResendEmail}
              onPreviewScreenshot={(url) => setLightboxUrl(url)}
              loading={loadingRegs}
              onRefresh={loadRegistrations}
            />
          ) : (
            <GroupRegistrationsView
              registrations={registrations}
              onConfirm={handleConfirm}
              onReject={handleReject}
              onResendEmail={handleResendEmail}
              onPreviewScreenshot={(url) => setLightboxUrl(url)}
              loading={loadingRegs}
              onRefresh={loadRegistrations}
            />
          )}
        </div>
      )}

      {currentTab === 'scanner' && <ScannerView />}

      {currentTab === 'checkins' && <CheckInsView />}

      {currentTab === 'settings' && <SettingsView />}

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <Lightbox
          isOpen={!!lightboxUrl}
          imageUrl={lightboxUrl}
          onClose={() => setLightboxUrl(null)}
        />
      )}
    </AdminLayout>
  );
};
