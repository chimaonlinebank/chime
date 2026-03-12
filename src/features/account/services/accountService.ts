import apiClient from '../../../lib/apiClient';
import { Account } from '../../../types';

export const accountService = {
  getBalance: async () => {
    const res = await apiClient.get('/account/balance');
    return res.data as Account;
  },

  addMoney: async (amount: number, method: string) => {
    const res = await apiClient.post('/account/deposit', { amount, method });
    return res.data;
  },

  withdraw: async (amount: number, destination: string) => {
    const res = await apiClient.post('/account/withdraw', { amount, destination });
    return res.data;
  },
};
