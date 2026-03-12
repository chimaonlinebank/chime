import { z } from 'zod';

export const withdrawAmountSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .min(1, 'Minimum withdrawal is $1')
    .max(10000, 'Maximum withdrawal is $10,000'),
  method: z.enum(['linked-bank', 'external-bank', 'debit-card'], {
    errorMap: () => ({ message: 'Invalid withdrawal method' }),
  }),
});

export const bankDetailsSchema = z.object({
  accountName: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name is too long'),
  accountNumber: z
    .string()
    .min(8, 'Account number must be at least 8 digits')
    .max(17, 'Account number is invalid')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  bankName: z
    .string()
    .min(1, 'Bank name is required')
    .max(100, 'Bank name is too long'),
  saveAsDefault: z.boolean().optional(),
});

export const withdrawConfirmSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['linked-bank', 'external-bank', 'debit-card']),
  fee: z.number().nonnegative(),
  estimatedArrival: z.string().datetime(),
});

export type WithdrawAmountInput = z.infer<typeof withdrawAmountSchema>;
export type BankDetailsInput = z.infer<typeof bankDetailsSchema>;
export type WithdrawConfirmInput = z.infer<typeof withdrawConfirmSchema>;
