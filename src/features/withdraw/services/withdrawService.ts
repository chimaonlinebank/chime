import apiClient from '../../../lib/apiClient';
import {
  WithdrawalRequest,
  WithdrawalResponse,
  WithdrawLimits,
} from '../types';

export const withdrawService = {
  /**
   * Initiate a withdrawal request
   */
  async initiateWithdraw(request: WithdrawalRequest): Promise<WithdrawalResponse> {
    try {
      const response = await apiClient.post<WithdrawalResponse>(
        '/withdrawals/initiate',
        request
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to initiate withdrawal');
    }
  },

  /**
   * Validate withdrawal before submission
   */
  async validateWithdraw(request: WithdrawalRequest): Promise<{ valid: boolean; fee: number }> {
    try {
      const response = await apiClient.post<{ valid: boolean; fee: number }>(
        '/withdrawals/validate',
        request
      );
      return response.data;
    } catch (error) {
      throw new Error('Validation failed');
    }
  },

  /**
   * Confirm and process withdrawal
   */
  async confirmWithdraw(
    transactionId: string,
    otp?: string
  ): Promise<WithdrawalResponse> {
    try {
      const response = await apiClient.post<WithdrawalResponse>(
        `/withdrawals/${transactionId}/confirm`,
        { otp }
      );
      return response.data;
    } catch (error) {
      throw new Error('Confirmation failed');
    }
  },

  /**
   * Get withdrawal history
   */
  async getWithdrawHistory(
    limit: number = 10,
    offset: number = 0
  ): Promise<WithdrawalResponse[]> {
    try {
      const response = await apiClient.get<WithdrawalResponse[]>(
        '/withdrawals/history',
        {
          params: { limit, offset },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch withdrawal history');
    }
  },

  /**
   * Get current withdrawal limits
   */
  async getWithdrawLimits(): Promise<WithdrawLimits> {
    try {
      const response = await apiClient.get<WithdrawLimits>(
        '/withdrawals/limits'
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch withdrawal limits');
    }
  },

  /**
   * Cancel a pending withdrawal
   */
  async cancelWithdraw(transactionId: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        `/withdrawals/${transactionId}/cancel`
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to cancel withdrawal');
    }
  },

  /**
   * Get withdrawal details
   */
  async getWithdrawDetails(transactionId: string): Promise<WithdrawalResponse> {
    try {
      const response = await apiClient.get<WithdrawalResponse>(
        `/withdrawals/${transactionId}`
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch withdrawal details');
    }
  },
};
