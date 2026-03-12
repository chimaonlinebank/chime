import apiClient from '../../../lib/apiClient';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (fullName: string, email: string, phone: string, password: string) => {
    const res = await apiClient.post('/auth/register', { fullName, email, phone, password });
    return res.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout', {});
  },

  refreshToken: async () => {
    const res = await apiClient.post('/auth/refresh', {});
    return res.data;
  },
};
