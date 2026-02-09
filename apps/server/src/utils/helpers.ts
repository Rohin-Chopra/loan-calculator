import type { LoanInput } from '../types.js';

export function generateDefaultName(loanInput: LoanInput): string {
  const principal = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(loanInput.principal);

  const rate = (loanInput.annualRate * 100).toFixed(1);
  const frequency = loanInput.frequency.charAt(0).toUpperCase() + loanInput.frequency.slice(1);

  return `${principal} @ ${rate}% (${frequency})`;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};
