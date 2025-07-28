import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatBalance(balance: string | number, decimals: number = 18): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance
  if (isNaN(num)) return '0.00'
  
  const divisor = Math.pow(10, decimals)
  const formatted = (num / divisor).toFixed(2)
  return formatted
}
