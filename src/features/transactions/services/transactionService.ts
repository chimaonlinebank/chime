import apiClient from '../../../lib/apiClient';
import { Transaction } from '../../../types';

export const transactionService = {
  getTransactions: async (limit = 20, offset = 0) => {
    const res = await apiClient.get('/transactions', {
      params: { limit, offset },
    });
    return res.data as { transactions: Transaction[]; total: number };
  },

  getTransaction: async (id: string) => {
    const res = await apiClient.get(`/transactions/${id}`);
    return res.data as Transaction;
  },

  sendMoney: async (recipientEmail: string, amount: number, description?: string) => {
    const res = await apiClient.post('/transactions/send', {
      recipientEmail,
      amount,
      description,
    });
    return res.data;
  },
};
