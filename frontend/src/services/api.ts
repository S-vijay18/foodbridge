import {
  User, Donation, DonationRequest, DeliveryAssignment,
  NotificationItem, DashboardMetrics, ImpactMetrics,
  AIChatResponse, PortionEstimateResponse, SmartMatchRecommendation
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('foodbridge_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const errData = await response.json();
      errorDetail = errData.detail || errData.message || errorDetail;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  register: (data: any) => request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: () => request<User>('/auth/me'),
  getDemoUsers: () => request<any[]>('/auth/demo-users'),

  // Donations
  getDonations: (params?: { category?: string; diet_type?: string; urgent_only?: boolean; my_donations?: boolean; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.diet_type) q.append('diet_type', params.diet_type);
    if (params?.urgent_only) q.append('urgent_only', 'true');
    if (params?.my_donations) q.append('my_donations', 'true');
    if (params?.search) q.append('search', params.search);
    return request<Donation[]>(`/donations?${q.toString()}`);
  },
  getDonation: (id: number) => request<Donation>(`/donations/${id}`),
  createDonation: (data: any) => request<Donation>('/donations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateDonation: (id: number, data: any) => request<Donation>(`/donations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  cancelDonation: (id: number) => request<{ message: string }>(`/donations/${id}`, {
    method: 'DELETE',
  }),

  // Requests
  getRequests: (params?: { donation_id?: number; status_filter?: string }) => {
    const q = new URLSearchParams();
    if (params?.donation_id) q.append('donation_id', params.donation_id.toString());
    if (params?.status_filter) q.append('status_filter', params.status_filter);
    return request<DonationRequest[]>(`/requests?${q.toString()}`);
  },
  createRequest: (data: any) => request<DonationRequest>('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  approveRequest: (id: number) => request<DonationRequest>(`/requests/${id}/approve`, {
    method: 'PUT',
  }),
  rejectRequest: (id: number, reason?: string) => request<DonationRequest>(`/requests/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'REJECTED', rejection_reason: reason }),
  }),

  // Deliveries
  getDeliveries: (params?: { available_only?: boolean; my_deliveries?: boolean; status_filter?: string }) => {
    const q = new URLSearchParams();
    if (params?.available_only) q.append('available_only', 'true');
    if (params?.my_deliveries) q.append('my_deliveries', 'true');
    if (params?.status_filter) q.append('status_filter', params.status_filter);
    return request<DeliveryAssignment[]>(`/deliveries?${q.toString()}`);
  },
  getDelivery: (id: number) => request<DeliveryAssignment>(`/deliveries/${id}`),
  acceptDelivery: (id: number) => request<DeliveryAssignment>(`/deliveries/${id}/accept`, {
    method: 'PUT',
  }),
  updateDeliveryStatus: (id: number, data: any) => request<DeliveryAssignment>(`/deliveries/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getTracking: (id: number) => request<any>(`/deliveries/${id}/tracking`),

  // Notifications
  getNotifications: (unread_only?: boolean) => request<NotificationItem[]>(`/notifications${unread_only ? '?unread_only=true' : ''}`),
  getUnreadCount: () => request<{ unread_count: number }>('/notifications/unread-count'),
  markNotificationRead: (id: number) => request<NotificationItem>(`/notifications/${id}/read`, {
    method: 'PUT',
  }),
  markAllNotificationsRead: () => request<{ message: string }>('/notifications/read-all', {
    method: 'PUT',
  }),

  // Analytics & Impact
  getDashboardMetrics: () => request<DashboardMetrics>('/analytics/dashboard'),
  getDonationAnalytics: () => request<{ categories: any[]; monthly_trends: any[] }>('/analytics/donations'),
  getImpactMetrics: () => request<ImpactMetrics>('/analytics/impact'),

  // AI Service
  chatWithAI: (message: string) => request<AIChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),
  estimatePortions: (data: { category: string; quantity: number; quantity_unit: string }) =>
    request<PortionEstimateResponse>('/ai/estimate-portions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSmartMatches: (ngo_id?: number) => request<SmartMatchRecommendation[]>(`/ai/smart-match${ngo_id ? `?ngo_id=${ngo_id}` : ''}`),
  getWasteInsights: () => request<any>('/ai/waste-insights'),

  // Admin
  getAdminUsers: () => request<User[]>('/admin/users'),
  updateUserVerification: (id: number, statusVal: string, notes?: string) =>
    request<any>(`/admin/users/${id}/verification?status_val=${statusVal}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`, {
      method: 'PUT',
    }),
  toggleUserActive: (id: number, isActive: boolean) =>
    request<any>(`/admin/users/${id}/status?is_active=${isActive}`, {
      method: 'PUT',
    }),
  getAdminDonations: () => request<Donation[]>('/admin/donations'),
  getAdminLogs: () => request<any[]>('/admin/logs'),
  getDatabaseStatus: () => request<any>('/admin/database-status'),
  exportReportUrl: (type: 'donations' | 'users' | 'deliveries') => `${API_BASE}/admin/export-report?type=${type}`,

  // Reviews
  createReview: (data: any) => request<any>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getUserReviews: (userId: number) => request<any>(`/reviews/target/${userId}`),

  // Users
  getProfile: () => request<User>('/users/profile'),
  updateProfile: (data: any) => request<User>('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  submitComplaint: (data: { subject: string; description: string; donation_id?: number }) =>
    request<any>('/users/complaint', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

