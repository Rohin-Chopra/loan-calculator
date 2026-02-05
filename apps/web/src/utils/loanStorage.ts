import type { SavedLoan, LoanInput, LumpSumPayment } from '../types';

const STORAGE_KEY = 'savedLoans';

export function saveLoan(
  loanInput: LoanInput,
  extraPaymentPerPeriod: number,
  lumpSums: LumpSumPayment[],
  name?: string
): SavedLoan {
  const savedLoans = getSavedLoans();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const savedLoan: SavedLoan = {
    id,
    name: name || generateDefaultName(loanInput),
    loanInput,
    extraPaymentPerPeriod,
    lumpSums,
    createdAt: now,
    updatedAt: now,
  };

  savedLoans.push(savedLoan);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLoans));
  
  return savedLoan;
}

export function getSavedLoans(): SavedLoan[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getSavedLoan(id: string): SavedLoan | null {
  const savedLoans = getSavedLoans();
  return savedLoans.find(loan => loan.id === id) || null;
}

export function deleteSavedLoan(id: string): boolean {
  const savedLoans = getSavedLoans();
  const filtered = savedLoans.filter(loan => loan.id !== id);
  
  if (filtered.length === savedLoans.length) {
    return false; // Loan not found
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function updateSavedLoan(
  id: string,
  updates: Partial<Pick<SavedLoan, 'name' | 'loanInput' | 'extraPaymentPerPeriod' | 'lumpSums'>>
): SavedLoan | null {
  const savedLoans = getSavedLoans();
  const index = savedLoans.findIndex(loan => loan.id === id);
  
  if (index === -1) return null;
  
  savedLoans[index] = {
    ...savedLoans[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLoans));
  return savedLoans[index];
}

function generateDefaultName(loanInput: LoanInput): string {
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
