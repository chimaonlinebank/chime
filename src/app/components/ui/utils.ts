import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency?: string) {
  try {
    const code = currency || 'USD';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(amount);
  } catch (e) {
    // Fallback: simple formatting with 2 decimals
    return `${currency ? currency + ' ' : '$'}${amount.toFixed(2)}`;
  }
}
