import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../../../app/components/ui/button';
import { fadeUpVariants } from '../../landing/animations';
import { WithdrawalMethod } from '../types';

interface ReviewStepProps {
  amount: number;
  method: WithdrawalMethod;
  fee: number;
  estimatedArrival: string;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const methodLabels: Record<WithdrawalMethod, string> = {
  'linked-bank': 'Linked Bank Account',
  'external-bank': 'External Bank Account',
  'debit-card': 'Debit Card',
};

const methodDescriptions: Record<WithdrawalMethod, string> = {
  'linked-bank': 'Your primary linked bank account',
  'external-bank': 'External bank account provided',
  'debit-card': 'Your registered debit card',
};

export const ReviewStep: React.FC<ReviewStepProps> = ({
  amount,
  method,
  fee,
  estimatedArrival,
  onConfirm,
  onBack,
  isLoading,
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const total = amount + fee;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpVariants}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
          Review Your Withdrawal
        </h1>
        <p className="text-charcoal-700">
          Confirm the details below before proceeding.
        </p>
      </div>

      {/* Summary Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-gradient-to-br from-white to-[#e6f9f4]/30 border-2 border-[#00b388]/30 rounded-lg p-8 shadow-md"
      >
        <div className="space-y-6">
          {/* Amount */}
          <div className="flex justify-between items-center pb-6 border-b border-gray-200">
            <span className="text-charcoal-700 font-medium">Withdrawal Amount</span>
            <span className="text-3xl font-bold text-charcoal-900">
              ${amount.toFixed(2)}
            </span>
          </div>

          {/* Fee */}
          <div className="flex justify-between items-center pb-6 border-b border-gray-200">
            <span className="text-charcoal-700 font-medium">Processing Fee</span>
            <span className="text-xl font-semibold text-green-600">
              ${fee.toFixed(2)}
            </span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pb-6 border-b-2 border-[#00b388]/30 bg-[#e6f9f4]/50 -m-8 mb-0 px-8 py-6">
            <span className="text-charcoal-900 font-bold">Total</span>
            <span className="text-2xl font-bold text-charcoal-900">
              ${total.toFixed(2)}
            </span>
          </div>

          {/* Destination */}
          <div className="pt-4">
            <p className="text-charcoal-700 font-medium mb-2">Destination</p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#00b388]" />
              <div>
                <p className="font-semibold text-charcoal-900">
                  {methodLabels[method]}
                </p>
                <p className="text-sm text-charcoal-600">
                  {methodDescriptions[method]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estimated Arrival */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
      >
        <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-900">Estimated Arrival</p>
          <p className="text-sm text-blue-700">
            Funds should arrive by{' '}
            <strong>
              {new Date(estimatedArrival).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </strong>
          </p>
        </div>
      </motion.div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="w-5 h-5 mt-1 accent-[#00b388]"
        />
        <label htmlFor="terms" className="text-sm text-charcoal-700">
          I confirm this withdrawal request and understand that funds will be
          transferred to the destination specified above. I also confirm that I
          am the account holder.
        </label>
      </div>

      {/* Security Notice */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
      >
        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-900">
            🔒 Your withdrawal is protected by:
          </p>
          <ul className="text-xs text-green-800 mt-2 space-y-1">
            <li>✓ Multi-layer encryption</li>
            <li>✓ Fraud detection monitoring</li>
            <li>✓ Real-time transaction logging</li>
          </ul>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12 border-2 border-charcoal-300 text-charcoal-900 hover:bg-charcoal-50 rounded-lg font-semibold transition-all"
        >
          Back
        </Button>

        <Button
          onClick={onConfirm}
          disabled={isLoading || !agreedToTerms}
          className="flex-1 h-12 bg-[#00b388] hover:bg-[#009670] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg shadow-[#00b388]/20 transition-all"
        >
          {isLoading ? 'Processing...' : 'Confirm Withdrawal'}
        </Button>
      </div>
    </motion.div>
  );
};
