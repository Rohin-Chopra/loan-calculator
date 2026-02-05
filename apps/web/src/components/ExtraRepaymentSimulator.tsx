import { useState } from 'react';
import type { LoanInput } from '../types';

interface ExtraRepaymentSimulatorProps {
  loanInput: LoanInput;
  extraPayment: number;
  onExtraPaymentChange: (amount: number) => void;
}

export function ExtraRepaymentSimulator({
  loanInput,
  extraPayment,
  onExtraPaymentChange,
}: ExtraRepaymentSimulatorProps) {
  const [customAmount, setCustomAmount] = useState<string>('');

  // Quick select buttons
  const quickAmounts = [25, 50, 100, 200];

  const handleQuickSelect = (amount: number) => {
    onExtraPaymentChange(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value) || 0;
    onExtraPaymentChange(numValue);
  };

  const handleSliderChange = (value: string) => {
    const numValue = parseFloat(value);
    onExtraPaymentChange(numValue);
    setCustomAmount(value);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatFrequency = (freq: string) => {
    return freq.charAt(0).toUpperCase() + freq.slice(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Extra Repayments Simulator
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        See how extra repayments reduce your interest and loan term
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Extra Payment per {formatFrequency(loanInput.frequency)}
        </label>
        
        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleQuickSelect(amount)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                extraPayment === amount
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>

        {/* Slider */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="500"
            step="25"
            value={extraPayment}
            onChange={(e) => handleSliderChange(e.target.value)}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>$0</span>
            <span>$500</span>
          </div>
        </div>

        {/* Custom input */}
        <input
          type="number"
          step="25"
          min="0"
          value={customAmount || extraPayment}
          onChange={(e) => handleCustomChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter custom amount"
        />
      </div>

      {extraPayment > 0 && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-800 dark:text-green-300 mb-2">
            <strong>Extra payment:</strong> {formatCurrency(extraPayment)} per{' '}
            {formatFrequency(loanInput.frequency)}
          </p>
        </div>
      )}
    </div>
  );
}
