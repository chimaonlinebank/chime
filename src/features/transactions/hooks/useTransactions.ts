import { useState, useCallback } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction } from '../../../types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetch = useCallback(async (limit = 20, offset = 0) => {
    setLoading(true);
    try {
      const data = await transactionService.getTransactions(limit, offset);
      setTransactions(data.transactions);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const send = useCallback(async (recipientEmail: string, amount: number, description?: string) => {
    setLoading(true);
    try {
      const result = await transactionService.sendMoney(recipientEmail, amount, description);
      return result;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { transactions, loading, error, fetch, send };
}
