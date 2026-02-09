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

export interface LoanCalculation {
  periodicPayment: number;
  totalPayments: number;
  totalInterest: number;
  loanEndDate: Date;
  schedule: PaymentScheduleItem[];
}

export interface PaymentScheduleItem {
  period: number;
  balance: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
}

export interface LoanResult {
  baseline: LoanCalculation;
  accelerated?: LoanCalculation;
  interestSaved?: number;
  timeSavedMonths?: number;
  equivalentReturn?: number;
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
