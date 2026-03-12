import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  OverviewStep,
  AmountStep,
  BankDetailsStep,
  ReviewStep,
  StatusStep,
} from './components';
import { withdrawService } from './services/withdrawService';
import { WithdrawAmountInput, BankDetailsInput } from './validation';
import { WithdrawLimits, WithdrawalStatus } from './types';

type WithdrawStep =
  | 'overview'
  | 'amount'
  | 'bank-details'
  | 'review'
  | 'status';

export const Withdraw: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<WithdrawStep>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [limits, setLimits] = useState<WithdrawLimits | null>(null);

  // Withdrawal data
  const [amount, setAmount] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<
    'linked-bank' | 'external-bank' | 'debit-card'
  >('linked-bank');
  const [bankDetails, setBankDetails] = useState<BankDetailsInput | null>(null);
  const [fee, setFee] = useState(0);
  const [status, setStatus] = useState<WithdrawalStatus | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch withdraw limits on mount
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        setIsLoading(true);
        const data = await withdrawService.getWithdrawLimits();
        setLimits(data);
      } catch (err) {
        setError('Failed to load account limits');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLimits();
  }, []);

  const handleStartWithdraw = () => {
    setStep('amount');
    setError(null);
  };

  const handleAmountSubmit = async (data: WithdrawAmountInput) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate the withdrawal
      const validation = await withdrawService.validateWithdraw({
        amount: data.amount,
        method: data.method,
      });

      setAmount(data.amount);
      setSelectedMethod(data.method);
      setFee(validation.fee);

      // Proceed to next step
      if (data.method === 'external-bank') {
        setStep('bank-details');
      } else {
        setStep('review');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to validate withdrawal'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankDetailsSubmit = (data: BankDetailsInput) => {
    setBankDetails(data);
    setStep('review');
  };

  const handleReviewConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStep('status');

      // Initiate the withdrawal
      const response = await withdrawService.initiateWithdraw({
        amount,
        method: selectedMethod,
        bankDetails: selectedMethod === 'external-bank' && bankDetails ? bankDetails : undefined,
      });

      setTransactionId(response.transactionId);
      setStatus(response.status);
      setEstimatedArrival(response.estimatedArrival);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to process withdrawal'
      );
      setStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    switch (step) {
      case 'amount':
        setStep('overview');
        break;
      case 'bank-details':
        setStep('amount');
        break;
      case 'review':
        setStep(selectedMethod === 'external-bank' ? 'bank-details' : 'amount');
        break;
      default:
        navigate('/dashboard/account');
    }
  };

  if (!limits) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#e6f9f4] border-t-[#00b388] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#e6f9f4]/20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ x: 0 }}
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-charcoal-700" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">
              Withdraw Funds
            </h1>
            <p className="text-sm text-charcoal-600">
              Step {step === 'overview' ? 1 : step === 'amount' ? 2 : step === 'bank-details' ? 3 : step === 'review' ? 4 : 5} of 5
            </p>
          </div>
        </div>

        {/* Step Progress */}
        {step !== 'status' && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
            <div className="flex gap-2 items-center justify-start">
              {['overview', 'amount', 'bank-details', 'review'].map((s, idx) => (
                <React.Fragment key={s}>
                  <motion.div
                    animate={{
                      backgroundColor:
                        s === step || (s === 'bank-details' && step === 'review')
                          ? '#00b388'
                          : ['overview', 'amount', 'bank-details', 'review'].indexOf(s) <
                              ['overview', 'amount', 'bank-details', 'review'].indexOf(step)
                            ? '#00b388'
                            : '#e5e7eb',
                    }}
                    className="w-3 h-3 rounded-full"
                  />
                  {idx < 3 && (
                    <motion.div
                      animate={{
                        backgroundColor:
                          ['overview', 'amount', 'bank-details', 'review'].indexOf(s) <
                          ['overview', 'amount', 'bank-details', 'review'].indexOf(step)
                            ? '#00b388'
                            : '#e5e7eb',
                      }}
                      className="h-1 flex-1"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-6"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900">
            {error}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {step === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <OverviewStep
                limits={limits}
                onStartWithdraw={handleStartWithdraw}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AmountStep
                onNext={handleAmountSubmit}
                onBack={handleBackClick}
                isLoading={isLoading}
                availableBalance={limits.availableBalance}
                dailyLimit={limits.dailyLimit - limits.dailyWithdrawn}
              />
            </motion.div>
          )}

          {step === 'bank-details' && (
            <motion.div
              key="bank-details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <BankDetailsStep
                onNext={handleBankDetailsSubmit}
                onBack={handleBackClick}
                isLoading={isLoading}
                method={selectedMethod}
              />
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ReviewStep
                amount={amount}
                method={selectedMethod}
                fee={fee}
                estimatedArrival={
                  estimatedArrival || new Date().toISOString()
                }
                onConfirm={handleReviewConfirm}
                onBack={handleBackClick}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {step === 'status' && status && transactionId && estimatedArrival && (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <StatusStep
                status={status}
                amount={amount}
                transactionId={transactionId}
                estimatedArrival={estimatedArrival}
                method={selectedMethod}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Withdraw;
