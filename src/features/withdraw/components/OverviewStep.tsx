import React from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingDown, Calendar } from 'lucide-react';
import { Button } from '../../../app/components/ui/button';
import { fadeUpVariants } from '../../landing/animations';
import { WithdrawLimits } from '../types';

interface OverviewStepProps {
  limits: WithdrawLimits;
  onStartWithdraw: () => void;
  isLoading: boolean;
}

export const OverviewStep: React.FC<OverviewStepProps> = ({
  limits,
  onStartWithdraw,
  isLoading,
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpVariants}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
          Cash Out Anytime
        </h1>
        <p className="text-charcoal-700">
          Transfer funds to your linked bank account or debit card instantly.
        </p>
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available Balance */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-charcoal-700 font-medium">Available Balance</span>
            <div className="p-2 bg-[#e6f9f4] rounded-lg">
              <DollarSign className="w-5 h-5 text-[#00b388]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">
            ${limits.availableBalance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-sm text-charcoal-600 mt-2">Ready to withdraw</p>
        </motion.div>

        {/* Withdrawable Balance */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-charcoal-700 font-medium">Today's Limit</span>
            <div className="p-2 bg-[#e6f9f4] rounded-lg">
              <Calendar className="w-5 h-5 text-[#00b388]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-charcoal-900">
            ${(limits.dailyLimit - limits.dailyWithdrawn).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-[#00b388] h-2 rounded-full transition-all duration-300"
              initial={{ width: 0 }}
              animate={{
                width: `${(limits.dailyWithdrawn / limits.dailyLimit) * 100}%`,
              }}
              transition={{ duration: 0.6 }}
              role="progressbar"
              aria-label="Daily withdrawal limit progress"
              aria-valuenow={Math.round((limits.dailyWithdrawn / limits.dailyLimit) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-xs text-charcoal-600 mt-2">
            ${limits.dailyWithdrawn.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} withdrawn today
          </p>
        </motion.div>
      </div>

      {/* Pending Withdrawals Info */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
      >
        <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
          <TrendingDown className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-blue-900">No pending withdrawals</p>
          <p className="text-sm text-blue-700">
            Start a new withdrawal to transfer funds to your bank account.
          </p>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={onStartWithdraw}
          disabled={isLoading || limits.availableBalance <= 0}
          className="w-full h-12 bg-[#00b388] hover:bg-[#009670] text-white font-semibold rounded-lg shadow-lg shadow-[#00b388]/20 transition-all"
        >
          {isLoading ? 'Processing...' : 'Start Withdrawal'}
        </Button>
      </motion.div>

      {/* Info Box */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-charcoal-900 mb-2">Quick Facts</h3>
        <ul className="text-sm text-charcoal-700 space-y-1">
          <li>✓ Transfers typically arrive within 1-2 business days</li>
          <li>✓ No fees for any withdrawal or transfer</li>
          <li>✓ 24/7 access to your money</li>
          <li>✓ All transactions are secure and encrypted</li>
        </ul>
      </div>
    </motion.div>
  );
};
