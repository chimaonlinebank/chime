export type WithdrawalMethod = 'linked-bank' | 'external-bank' | 'debit-card';
export type WithdrawalStatus = 'pending' | 'completed' | 'failed' | 'processing';

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  saveAsDefault?: boolean;
}

export interface WithdrawalRequest {
  amount: number;
  method: WithdrawalMethod;
  bankDetails?: BankDetails;
}

export interface WithdrawalResponse {
  transactionId: string;
  amount: number;
  fee: number;
  status: WithdrawalStatus;
  estimatedArrival: string;
  createdAt: string;
}

export interface WithdrawState {
  amount: number;
  selectedMethod: WithdrawalMethod | null;
  bankDetails: BankDetails | null;
  fee: number;
  status: WithdrawalStatus | null;
  error: string | null;
  transactionId: string | null;
  estimatedArrival: string | null;
  loading: boolean;
}

export interface WithdrawLimits {
  availableBalance: number;
  withdrawableBalance: number;
  dailyLimit: number;
  dailyWithdrawn: number;
}
