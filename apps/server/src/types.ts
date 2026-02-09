export type RepaymentFrequency = 'weekly' | 'fortnightly' | 'monthly';

export interface LoanInput {
  principal: number;
  annualRate: number; // as decimal (e.g., 0.095 for 9.5%)
  termYears: number;
  frequency: RepaymentFrequency;
}

export interface LumpSumPayment {
  amount: number;
  period: number; // Period number from start (0-indexed)
}

export interface SavedLoan {
  id: string;
  userId: string;
  name: string;
  loanInput: LoanInput;
  extraPaymentPerPeriod: number;
  lumpSums: LumpSumPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanRequest {
  loanInput: LoanInput;
  extraPaymentPerPeriod?: number;
  lumpSums?: LumpSumPayment[];
  name?: string;
}

export interface UpdateLoanRequest {
  name?: string;
  loanInput?: LoanInput;
  extraPaymentPerPeriod?: number;
  lumpSums?: LumpSumPayment[];
}
