import { useState, useCallback } from 'react';
import { accountService } from '../services/accountService';
import { Account } from '../../../types';

export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountService.getBalance();
      setAccount(data);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const deposit = useCallback(async (amount: number, method: string) => {
    setLoading(true);
    try {
      const result = await accountService.addMoney(amount, method);
      await fetchBalance(); // Refresh balance
      return result;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fetchBalance]);

  const withdraw = useCallback(async (amount: number, destination: string) => {
    setLoading(true);
    try {
      const result = await accountService.withdraw(amount, destination);
      await fetchBalance(); // Refresh balance
      return result;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fetchBalance]);

  return { account, loading, error, fetchBalance, deposit, withdraw };
}
