import { useMemo } from 'react';
import type { LoanInput } from '../types';
import { calculateLoanSchedule } from '../utils/loanCalculator';

interface FrequencyComparisonTableProps {
  principal: number;
  annualRate: number;
  termYears: number;
}

type FrequencyOption = 'weekly' | 'fortnightly' | 'monthly' | 'yearly';

export function FrequencyComparisonTable({
  principal,
  annualRate,
  termYears,
}: FrequencyComparisonTableProps) {

  const frequencies: FrequencyOption[] = ['weekly', 'fortnightly', 'monthly', 'yearly'];

  const comparisons = useMemo(() => {
    return frequencies.map((frequency) => {
      if (frequency === 'yearly') {
        // Calculate yearly payments manually
        const paymentsPerYear = 1;
        const periodicRate = annualRate / paymentsPerYear;
        const totalPayments = paymentsPerYear * termYears;
        
        // Calculate minimum payment using amortization formula
        const periodicPayment = periodicRate === 0
          ? principal / totalPayments
          : principal * (periodicRate / (1 - Math.pow(1 + periodicRate, -totalPayments)));
        
        // Calculate schedule
        let balance = principal;
        let totalInterestPaid = 0;
        let period = 0;
        
        while (balance > 0.01 && period < totalPayments) {
          const interestPaid = balance * periodicRate;
          totalInterestPaid += interestPaid;
          
          const principalPaid = Math.min(periodicPayment - interestPaid, balance);
          balance -= principalPaid;
          period++;
        }
        
        const startDate = new Date();
        const loanEndDate = new Date(startDate);
        loanEndDate.setFullYear(loanEndDate.getFullYear() + termYears);
        
        return {
          frequency: 'yearly',
          periodicPayment,
          totalInterest: totalInterestPaid,
          totalPayments: totalInterestPaid + principal,
          loanEndDate,
        };
      }

      const loanInput: LoanInput = {
        principal,
        annualRate,
        termYears,
        frequency,
      };

      const calculation = calculateLoanSchedule(loanInput);
      return {
        frequency,
        periodicPayment: calculation.periodicPayment,
        totalInterest: calculation.totalInterest,
        totalPayments: calculation.totalPayments,
        loanEndDate: calculation.loanEndDate,
      };
    });
  }, [principal, annualRate, termYears]);

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
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatFrequency = (freq: FrequencyOption) => {
    return freq.charAt(0).toUpperCase() + freq.slice(1);
  };

  // Find the best option (lowest total interest)
  const bestOption = comparisons.reduce((best, current) =>
    current.totalInterest < best.totalInterest ? current : best
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Frequency Comparison
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Compare how different repayment frequencies affect your loan
      </p>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Frequency
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Payment Amount
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Total Interest
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Total Paid
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Loan End Date
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((comparison) => {
              const isBest = comparison.frequency === bestOption.frequency;
              return (
                <tr
                  key={comparison.frequency}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    isBest ? 'bg-green-50 dark:bg-green-900/20' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {formatFrequency(comparison.frequency as FrequencyOption)}
                    </span>
                    {isBest && (
                      <span className="ml-2 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        Best
                      </span>
                    )}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-800 dark:text-gray-200">
                    {formatCurrency(comparison.periodicPayment)}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-semibold ${
                      isBest 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {formatCurrency(comparison.totalInterest)}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 text-gray-800 dark:text-gray-200">
                    {formatCurrency(comparison.totalPayments)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {formatDate(comparison.loanEndDate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>💡 Tip:</strong> More frequent payments (weekly/fortnightly) reduce total interest 
          because you pay down principal faster, reducing the interest charged on the remaining balance.
        </p>
      </div>
    </div>
  );
}
