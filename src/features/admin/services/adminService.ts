import apiClient from '../../../lib/apiClient';

export const adminService = {
  // User Management
  getUsers: async (filters?: Record<string, any>) => {
    const res = await apiClient.get('/admin/users', { params: filters });
    return res.data;
  },

  getUserDetails: async (id: string) => {
    const res = await apiClient.get(`/admin/users/${id}`);
    return res.data;
  },

  suspendUser: async (id: string) => {
    const res = await apiClient.post(`/admin/users/${id}/suspend`, {});
    return res.data;
  },

  // Transaction Monitoring
  getTransactions: async (filters?: Record<string, any>) => {
    const res = await apiClient.get('/admin/transactions', { params: filters });
    return res.data;
  },

  blockTransaction: async (id: string, reason: string) => {
    const res = await apiClient.post(`/admin/transactions/${id}/block`, { reason });
    return res.data;
  },

  // Risk Management
  getFraudCases: async (filters?: Record<string, any>) => {
    const res = await apiClient.get('/admin/fraud', { params: filters });
    return res.data;
  },

  // Analytics & Reports
  getReports: async () => {
    const res = await apiClient.get('/admin/reports');
    return res.data;
  },

  getAnalytics: async (period: string) => {
    const res = await apiClient.get(`/admin/analytics/${period}`);
    return res.data;
  },
};
