import { useState, useMemo, useEffect } from 'react';
import type { LoanInput, LumpSumPayment, SavedLoan } from '../types';
import { calculateLoanSchedule } from '../utils/loanCalculator';
import { getSavedLoan } from '../utils/loanStorage';

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

export function useLoanCalculator(loanIdFromUrl?: string | null) {
  const [loanInput, setLoanInput] = useState<LoanInput | null>(null);
  const [extraPaymentPerPeriod, setExtraPaymentPerPeriod] = useState<number>(0);
  const [lumpSums, setLumpSums] = useState<LumpSumPayment[]>([]);
  const [currentLoanId, setCurrentLoanId] = useState<string | null>(null);

  // Load saved loan from URL parameter, sessionStorage (backward compatibility), or localStorage
  useEffect(() => {
    // Priority 1: Load from URL parameter
    if (loanIdFromUrl) {
      const savedLoan = getSavedLoan(loanIdFromUrl);
      if (savedLoan) {
        setLoanInput(savedLoan.loanInput);
        setExtraPaymentPerPeriod(savedLoan.extraPaymentPerPeriod);
        setLumpSums(savedLoan.lumpSums);
        setCurrentLoanId(savedLoan.id);
        return; // Don't check sessionStorage if URL param is present
      }
    }

    // Priority 2: Load from sessionStorage (backward compatibility)
    const loadLoanData = sessionStorage.getItem('loadLoan');
    if (loadLoanData) {
      try {
        const savedLoan: SavedLoan = JSON.parse(loadLoanData);
        setLoanInput(savedLoan.loanInput);
        setExtraPaymentPerPeriod(savedLoan.extraPaymentPerPeriod);
        setLumpSums(savedLoan.lumpSums);
        setCurrentLoanId(savedLoan.id);
        sessionStorage.removeItem('loadLoan');
        return; // Don't clear state if we loaded from sessionStorage
      } catch (e) {
        console.error('Failed to load saved loan:', e);
      }
    }

    // Priority 3: Clear state when navigating to home page (no loan ID and no sessionStorage data)
    if (!loanIdFromUrl && !loadLoanData) {
      setLoanInput(null);
      setExtraPaymentPerPeriod(0);
      setLumpSums([]);
      setCurrentLoanId(null);
    }
  }, [loanIdFromUrl]);

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
    // Only reset extra payments and lump sums if this is a new loan
    // If currentLoanId is set, we're editing an existing loan, so preserve those values
    if (!currentLoanId) {
      setExtraPaymentPerPeriod(0);
      setLumpSums([]);
    }
    // Don't clear currentLoanId here - it should only be cleared when explicitly creating a new loan
  };

  const paymentsPerYear = loanInput
    ? getPaymentsPerYear(loanInput.frequency)
    : 12;

  const hasAcceleratedPayments = extraPaymentPerPeriod > 0 || lumpSums.length > 0;
  const showAcceleratedResults = 
    acceleratedCalculation &&
    hasAcceleratedPayments &&
    acceleratedCalculation.schedule.length < (baselineCalculation?.schedule.length ?? Infinity);

  const clearCurrentLoan = () => {
    setCurrentLoanId(null);
    setLoanInput(null);
    setExtraPaymentPerPeriod(0);
    setLumpSums([]);
  };

  return {
    loanInput,
    extraPaymentPerPeriod,
    lumpSums,
    baselineCalculation,
    acceleratedCalculation,
    paymentsPerYear,
    showAcceleratedResults,
    currentLoanId,
    handleLoanSubmit,
    setExtraPaymentPerPeriod,
    setLumpSums,
    setCurrentLoanId,
    clearCurrentLoan,
  };
}
