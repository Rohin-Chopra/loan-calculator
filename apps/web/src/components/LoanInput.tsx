import { useState, useEffect } from 'react';
import type { LoanInput, RepaymentFrequency } from '../types';

interface LoanInputProps {
  onSubmit: (input: LoanInput) => void;
  initialValue?: LoanInput;
}

export function LoanInputForm({ onSubmit, initialValue }: LoanInputProps) {
  const [principal, setPrincipal] = useState<string>(initialValue?.principal.toString() || '52000');
  const [annualRate, setAnnualRate] = useState<string>(initialValue ? (initialValue.annualRate * 100).toString() : '9.5');
  const [termYears, setTermYears] = useState<string>(initialValue?.termYears.toString() || '7');
  const [frequency, setFrequency] = useState<RepaymentFrequency>(initialValue?.frequency || 'fortnightly');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setPrincipal(initialValue.principal.toString());
      setAnnualRate((initialValue.annualRate * 100).toString());
      setTermYears(initialValue.termYears.toString());
      setFrequency(initialValue.frequency);
    }
  }, [initialValue]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const principalNum = parseFloat(principal);
    if (isNaN(principalNum) || principalNum <= 0) {
      newErrors.principal = 'Loan amount must be greater than 0';
    }

    const rateNum = parseFloat(annualRate);
    if (isNaN(rateNum) || rateNum <= 0 || rateNum > 100) {
      newErrors.annualRate = 'Interest rate must be between 0 and 100';
    }

    const termNum = parseFloat(termYears);
    if (isNaN(termNum) || termNum <= 0 || termNum > 100) {
      newErrors.termYears = 'Loan term must be between 0 and 100 years';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        principal: parseFloat(principal),
        annualRate: parseFloat(annualRate) / 100, // Convert percentage to decimal
        termYears: parseFloat(termYears),
        frequency,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Loan Details
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="principal"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Loan Amount ($)
          </label>
          <input
            id="principal"
            type="number"
            step="1000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.principal ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="52000"
          />
          {errors.principal && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.principal}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="annualRate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Interest Rate (% per year)
          </label>
          <input
            id="annualRate"
            type="number"
            step="0.1"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.annualRate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="9.5"
          />
          {errors.annualRate && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.annualRate}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="termYears"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Loan Term (years)
          </label>
          <input
            id="termYears"
            type="number"
            step="0.5"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.termYears ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="7"
          />
          {errors.termYears && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.termYears}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="frequency"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Repayment Frequency
          </label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) =>
              setFrequency(e.target.value as RepaymentFrequency)
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Calculate Loan
        </button>
      </form>
    </div>
  );
}
