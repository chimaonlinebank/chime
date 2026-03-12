import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Info } from 'lucide-react';
import { Button } from '../../../app/components/ui/button';
import { Input } from '../../../app/components/ui/input';
import { Label } from '../../../app/components/ui/label';
import { fadeUpVariants } from '../../landing/animations';
import { withdrawAmountSchema, WithdrawAmountInput } from '../validation';
import { WithdrawalMethod } from '../types';

interface AmountStepProps {
  onNext: (data: WithdrawAmountInput) => void;
  onBack: () => void;
  isLoading: boolean;
  availableBalance: number;
  dailyLimit: number;
}

const withdrawalMethods: { value: WithdrawalMethod; label: string; description: string }[] = [
  {
    value: 'linked-bank',
    label: 'Linked Bank Account',
    description: 'Transfer to your main bank account',
  },
  {
    value: 'external-bank',
    label: 'External Bank',
    description: 'Add a new bank account',
  },
  {
    value: 'debit-card',
    label: 'Debit Card',
    description: 'Transfer back to your debit card',
  },
];

export const AmountStep: React.FC<AmountStepProps> = ({
  onNext,
  onBack,
  isLoading,
  availableBalance,
  dailyLimit,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WithdrawAmountInput>({
    resolver: zodResolver(withdrawAmountSchema),
    defaultValues: {
      amount: 0,
      method: 'linked-bank',
    },
  });

  const amount = watch('amount');

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={fadeUpVariants}
      onSubmit={handleSubmit(onNext)}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
          How much do you want to withdraw?
        </h1>
        <p className="text-charcoal-700">
          Enter the amount and select where you want the funds.
        </p>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-base font-semibold">
          Withdrawal Amount
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-charcoal-900">
            $
          </span>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                className="pl-10 h-14 text-2xl font-bold"
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            )}
          />
        </div>

        {errors.amount && (
          <div className="flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errors.amount.message}</span>
          </div>
        )}
      </div>

      {/* Balance Info */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-900 mb-1">Limits & Info</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Available: ${availableBalance.toFixed(2)}</li>
            <li>• Daily Limit: ${dailyLimit.toFixed(2)}</li>
            {amount > 0 && (
              <li className="text-blue-600 font-medium">
                You're withdrawing ${amount.toFixed(2)}
              </li>
            )}
          </ul>
        </div>
      </motion.div>

      {/* Withdrawal Method Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Where to withdraw?</Label>

        {withdrawalMethods.map((method) => (
          <Controller
            key={method.value}
            name="method"
            control={control}
            render={({ field }) => (
              <motion.label
                whileHover={{ scale: 1.01 }}
                className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all"
                style={{
                  borderColor:
                    field.value === method.value ? '#00b388' : '#e5e7eb',
                  backgroundColor:
                    field.value === method.value ? '#e6f9f4' : 'white',
                }}
              >
                <input
                  type="radio"
                  value={method.value}
                  checked={field.value === method.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-5 h-5 mt-1 flex-shrink-0"
                  aria-label={`Select ${method.label}`}
                />
                <div className="ml-4">
                  <p className="font-semibold text-charcoal-900">
                    {method.label}
                  </p>
                  <p className="text-sm text-charcoal-600">
                    {method.description}
                  </p>
                </div>
              </motion.label>
            )}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12 border-2 border-charcoal-300 text-charcoal-900 hover:bg-charcoal-50 rounded-lg font-semibold transition-all"
        >
          Back
        </Button>

        <Button
          type="submit"
          disabled={isLoading || amount <= 0}
          className="flex-1 h-12 bg-[#00b388] hover:bg-[#009670] text-white font-semibold rounded-lg shadow-lg shadow-[#00b388]/20 transition-all"
        >
          {isLoading ? 'Processing...' : 'Continue'}
        </Button>
      </div>
    </motion.form>
  );
};
