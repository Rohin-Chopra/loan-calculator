import { useState, useMemo, useEffect } from 'react';
import type { LoanInput, LumpSumPayment, SavedLoan } from '../types';
import { calculateLoanSchedule } from '../utils/loanCalculator';

function getPaymentsPerYear(frequency: string): number {
  switch (frequency) {
    case 'weekly':
      return 52;
    case 'fortnightly':
      return 26;
    case 'monthly':
      return 12;
    default:
      return 12;
  }
}

export function useLoanCalculator() {
  const [loanInput, setLoanInput] = useState<LoanInput | null>(null);
  const [extraPaymentPerPeriod, setExtraPaymentPerPeriod] = useState<number>(0);
  const [lumpSums, setLumpSums] = useState<LumpSumPayment[]>([]);

  // Load saved loan from sessionStorage if present
  useEffect(() => {
    const loadLoanData = sessionStorage.getItem('loadLoan');
    if (loadLoanData) {
      try {
        const savedLoan: SavedLoan = JSON.parse(loadLoanData);
        setLoanInput(savedLoan.loanInput);
        setExtraPaymentPerPeriod(savedLoan.extraPaymentPerPeriod);
        setLumpSums(savedLoan.lumpSums);
        sessionStorage.removeItem('loadLoan');
      } catch (e) {
        console.error('Failed to load saved loan:', e);
      }
    }
  }, []);

  // Calculate baseline (minimum repayment only)
  const baselineCalculation = useMemo(() => {
    if (!loanInput) return null;
    return calculateLoanSchedule(loanInput, 0, []);
  }, [loanInput]);

  // Calculate accelerated (with extra payments and lump sums)
  const acceleratedCalculation = useMemo(() => {
    if (!loanInput) return null;
    return calculateLoanSchedule(loanInput, extraPaymentPerPeriod, lumpSums);
  }, [loanInput, extraPaymentPerPeriod, lumpSums]);

  const handleLoanSubmit = (input: LoanInput) => {
    setLoanInput(input);
    setExtraPaymentPerPeriod(0);
    setLumpSums([]);
  };

  const paymentsPerYear = loanInput
    ? getPaymentsPerYear(loanInput.frequency)
    : 12;

  const hasAcceleratedPayments = extraPaymentPerPeriod > 0 || lumpSums.length > 0;
  const showAcceleratedResults = 
    acceleratedCalculation &&
    hasAcceleratedPayments &&
    acceleratedCalculation.schedule.length < (baselineCalculation?.schedule.length ?? Infinity);

  return {
    loanInput,
    extraPaymentPerPeriod,
    lumpSums,
    baselineCalculation,
    acceleratedCalculation,
    paymentsPerYear,
    showAcceleratedResults,
    handleLoanSubmit,
    setExtraPaymentPerPeriod,
    setLumpSums,
  };
}
