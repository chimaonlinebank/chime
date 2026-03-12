import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../app/components/ui/button';
import { fadeUpVariants } from '../../landing/animations';
import { WithdrawalStatus } from '../types';

interface StatusStepProps {
  status: WithdrawalStatus;
  amount: number;
  transactionId: string;
  estimatedArrival: string;
  method: 'linked-bank' | 'external-bank' | 'debit-card';
}

const statusConfig: Record<
  WithdrawalStatus,
  {
    icon: React.ReactNode;
    title: string;
    message: string;
    color: string;
  }
> = {
  completed: {
    icon: <CheckCircle2 className="w-16 h-16" />,
    title: 'Withdrawal Complete',
    message: 'Your funds have been successfully transferred.',
    color: 'text-green-600',
  },
  pending: {
    icon: <Clock className="w-16 h-16" />,
    title: 'Withdrawal Pending',
    message: 'Your withdrawal is being processed. Check your account soon.',
    color: 'text-blue-600',
  },
  processing: {
    icon: <Clock className="w-16 h-16" />,
    title: 'Processing Withdrawal',
    message: 'Your withdrawal is being securely processed.',
    color: 'text-blue-600',
  },
  failed: {
    icon: <AlertCircle className="w-16 h-16" />,
    title: 'Withdrawal Failed',
    message: 'The withdrawal could not be completed. Please try again or contact support.',
    color: 'text-red-600',
  },
};

export const StatusStep: React.FC<StatusStepProps> = ({
  status,
  amount,
  transactionId,
  estimatedArrival,
  method,
}) => {
  const navigate = useNavigate();
  const config = statusConfig[status];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpVariants}
      className="space-y-8 text-center"
    >
      {/* Icon */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`flex justify-center ${config.color}`}
      >
        {config.icon}
      </motion.div>

      {/* Title and Message */}
      <div>
        <h1 className="text-4xl font-bold text-charcoal-900 mb-3">
          {config.title}
        </h1>
        <p className="text-xl text-charcoal-700 mb-4">{config.message}</p>
        {status === 'completed' && (
          <p className="text-3xl font-bold text-charcoal-900">
            ${amount.toFixed(2)}
          </p>
        )}
      </div>

      {/* Details Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white border border-gray-200 rounded-lg p-8 shadow-md max-w-sm mx-auto w-full"
      >
        <div className="space-y-4 text-left">
          {/* Transaction ID */}
          <div>
            <p className="text-sm text-charcoal-600 mb-1">Transaction ID</p>
            <p className="font-mono text-charcoal-900 break-all">{transactionId}</p>
          </div>

          {/* Estimated Arrival */}
          {status !== 'failed' && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-charcoal-600 mb-1">
                  Expected Arrival
                </p>
                <p className="font-semibold text-charcoal-900">
                  {new Date(estimatedArrival).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Method */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-charcoal-600 mb-1">
                  Destination
                </p>
                <p className="font-semibold text-charcoal-900">{method}</p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Status Message */}
      {status === 'pending' && (
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto w-full"
        >
          <p className="text-sm text-blue-900">
            💡 Most withdrawals are completed within 1-2 business days. You'll
            receive a notification when the funds arrive.
          </p>
        </motion.div>
      )}

      {status === 'failed' && (
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm mx-auto w-full"
        >
          <p className="text-sm text-red-900">
            ⚠️ The withdrawal failed. Please contact our support team for
            assistance or try again with different details.
          </p>
        </motion.div>
      )}

      {status === 'completed' && (
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-sm mx-auto w-full"
        >
          <p className="text-sm text-green-900">
            ✓ Transaction confirmed and processing securely. You can manage
            your funds from your account dashboard.
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 max-w-sm mx-auto w-full pt-6">
        <Button
          onClick={() => navigate('/dashboard/account')}
          className="w-full h-12 bg-[#00b388] hover:bg-[#009670] text-white font-semibold rounded-lg shadow-lg shadow-[#00b388]/20 transition-all flex items-center justify-center gap-2"
        >
          Back to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => navigate('/dashboard/transactions')}
          variant="outline"
          className="w-full h-12 border-2 border-charcoal-300 text-charcoal-900 hover:bg-charcoal-50 font-semibold rounded-lg transition-all"
        >
          View Transaction History
        </Button>
      </div>

      {/* Download Receipt */}
      {status === 'completed' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-[#00b388] hover:text-[#009670] font-semibold transition-colors"
        >
          📄 Download Receipt
        </motion.button>
      )}
    </motion.div>
  );
};
