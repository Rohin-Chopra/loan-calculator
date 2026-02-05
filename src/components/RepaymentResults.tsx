import type { LoanCalculation } from '../types';

interface RepaymentResultsProps {
  calculation: LoanCalculation;
  frequency: string;
}

export function RepaymentResults({
  calculation,
  frequency,
}: RepaymentResultsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Your Loan Breakdown
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Minimum Payment</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(calculation.periodicPayment)}
          </p>
          <p className="text-xs text-gray-500 mt-1">per {frequency}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Amount Paid</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(calculation.totalPayments)}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600 mb-1">Total Interest Paid</p>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(calculation.totalInterest)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Loan End Date</p>
          <p className="text-xl font-bold text-gray-800">
            {formatDate(calculation.loanEndDate)}
          </p>
        </div>
      </div>
    </div>
  );
}
