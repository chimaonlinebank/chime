import apiClient from '../../../lib/apiClient';
import { UserProfile } from '../../../types';

export const userService = {
  getProfile: async () => {
    const res = await apiClient.get('/user/profile');
    return res.data as UserProfile;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const res = await apiClient.put('/user/profile', data);
    return res.data as UserProfile;
  },

  getActivity: async (limit = 20, offset = 0) => {
    const res = await apiClient.get('/user/activity', {
      params: { limit, offset },
    });
    return res.data;
  },
};
