import type { EventConfig, Registration, ScannerScanResult, AdminUser, AttendeeUser, Attendee } from '../types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const adminToken = localStorage.getItem('fot_admin_token');
  const userToken = localStorage.getItem('fot_user_token');
  const isUserEndpoint = url.startsWith('/api/auth/user');
  const isAdminEndpoint = url.startsWith('/api/scanner') || url.startsWith('/api/registrations/confirm') || url.startsWith('/api/registrations/reject') || url.startsWith('/api/export') || url.startsWith('/api/admin');
  const token = isAdminEndpoint ? adminToken : (isUserEndpoint ? userToken : (adminToken || userToken));
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || data.message || `Request failed with status ${res.status}`, res.status);
  }

  return data as T;
}

export const api = {
  // Public Event API
  getEventConfig: () => request<EventConfig>('/api/event'),

  // Public Registration Submission
  submitRegistration: (formData: FormData) =>
    request<{ success: boolean; registrationId: string; totalAmount: number; message: string }>('/api/registrations', {
      method: 'POST',
      body: formData,
    }),

  // Admin Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; admin: AdminUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    request<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
    }),

  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getMe: () =>
    request<{ authenticated: boolean; admin: AdminUser }>('/api/auth/me'),

  // Attendee / User Authentication
  userSignUp: (payload: { name: string; email: string; phone?: string; password: string }) =>
    request<{ success: boolean; user: AttendeeUser; token: string; message: string }>('/api/auth/user/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  userLogin: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; user: AttendeeUser; token: string }>('/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getUserMe: () =>
    request<{
      authenticated: boolean;
      user: AttendeeUser;
      tickets: Attendee[];
      registrations: Registration[];
    }>('/api/auth/user/me'),

  userLogout: () =>
    request<{ success: boolean; message: string }>('/api/auth/user/logout', {
      method: 'POST',
    }),

  // Event Configuration Update
  updateEventConfig: (config: Partial<EventConfig>) =>
    request<{ success: boolean; config: EventConfig; message: string }>('/api/event', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  uploadEventImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<{ success: boolean; url: string }>('/api/event/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Admin Registrations Management
  getRegistrations: (params: { status?: string; search?: string; type?: 'solo' | 'group' | 'all' } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.type && params.type !== 'all') query.set('type', params.type);
    return request<{ registrations: Registration[]; total: number }>(`/api/registrations?${query.toString()}`);
  },

  confirmRegistration: (id: string) =>
    request<{ success: boolean; message: string; attendees: unknown[] }>(`/api/registrations/${id}/confirm`, {
      method: 'POST',
    }),

  rejectRegistration: (id: string, reason?: string) =>
    request<{ success: boolean; message: string }>(`/api/registrations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  resendTicketEmail: (attendeeId: string) =>
    request<{ success: boolean; message: string }>(`/api/registrations/attendees/${attendeeId}/resend-email`, {
      method: 'POST',
    }),

  // Scanner Verification
  verifyScan: (payload: { token?: string; manualCode?: string }) =>
    request<ScannerScanResult>('/api/scanner/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCheckInsHistory: () =>
    request<{ checkIns: unknown[] }>('/api/scanner/history'),

  // Google Sheets
  testSheetsConnection: (sheetUrl: string) =>
    request<{ success: boolean; message: string; sheetTitle?: string }>('/api/sheets/test', {
      method: 'POST',
      body: JSON.stringify({ sheetUrl }),
    }),

  syncSheets: () =>
    request<{ success: boolean; totalUnsynced: number; syncedCount: number; message: string }>('/api/sheets/sync', {
      method: 'POST',
    }),

  testEmail: (email: string) =>
    request<{ success: boolean; message: string }>('/api/sheets/test-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Stats
  getStatsOverview: () =>
    request<{
      metrics: {
        totalRegistrations: number;
        totalAttendees: number;
        soloAttendees: number;
        teamAttendees: number;
        teamGroupsCount: number;
        pendingRegistrations: number;
        confirmedRegistrations: number;
        rejectedRegistrations: number;
        totalRevenue: number;
        checkedInCount: number;
      };
      timeline: { dateLabel: string; count: number; cumulative: number }[];
    }>('/api/stats/overview'),
};
