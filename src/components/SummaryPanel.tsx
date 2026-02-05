import type { LoanCalculation } from '../types';
import { calculateEquivalentReturn } from '../utils/loanCalculator';

interface SummaryPanelProps {
  baseline: LoanCalculation;
  accelerated: LoanCalculation;
  extraPaymentPerPeriod: number;
  paymentsPerYear: number;
}

export function SummaryPanel({
  baseline,
  accelerated,
  extraPaymentPerPeriod,
  paymentsPerYear,
}: SummaryPanelProps) {
  const interestSaved = baseline.totalInterest - accelerated.totalInterest;
  const timeSavedMonths =
    ((baseline.loanEndDate.getTime() - accelerated.loanEndDate.getTime()) /
      (1000 * 60 * 60 * 24 * 30.44)) | 0; // Approximate months
  const timeSavedYears = timeSavedMonths / 12;

  // Calculate total extra payments made
  const totalExtraPayments =
    extraPaymentPerPeriod * accelerated.schedule.length;

  const equivalentReturn = calculateEquivalentReturn(
    interestSaved,
    totalExtraPayments,
    timeSavedYears
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg shadow-lg p-6 mb-6 border-2 border-green-200 dark:border-green-800">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        🎉 Your Savings Summary
      </h2>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Interest Saved</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(interestSaved)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            That's money back in your pocket!
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Time Saved</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatTime(timeSavedMonths)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You finish {timeSavedYears > 1 ? `${timeSavedYears.toFixed(1)} years` : `${timeSavedMonths} months`} earlier
          </p>
        </div>

        {equivalentReturn > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Equivalent Risk-Free Return
            </p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {equivalentReturn.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This is like earning {equivalentReturn.toFixed(1)}% risk-free on
              your extra payments
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-blue-500 dark:border-blue-400">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Total Extra Payments Made
          </p>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {formatCurrency(totalExtraPayments)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You saved {formatCurrency(interestSaved)} by paying{' '}
            {formatCurrency(totalExtraPayments)} extra
          </p>
        </div>
      </div>
    </div>
  );
}
