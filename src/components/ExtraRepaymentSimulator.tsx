import { useState, useEffect } from 'react';
import type { LoanInput, LoanCalculation } from '../types';
import { calculateLoanSchedule } from '../utils/loanCalculator';

interface ExtraRepaymentSimulatorProps {
  loanInput: LoanInput;
  baselineCalculation: LoanCalculation;
  onCalculationChange: (calculation: LoanCalculation) => void;
}

export function ExtraRepaymentSimulator({
  loanInput,
  baselineCalculation,
  onCalculationChange,
}: ExtraRepaymentSimulatorProps) {
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');

  // Quick select buttons
  const quickAmounts = [25, 50, 100, 200];

  useEffect(() => {
    const calculation = calculateLoanSchedule(loanInput, extraPayment);
    onCalculationChange(calculation);
  }, [extraPayment, loanInput, onCalculationChange]);

  const handleQuickSelect = (amount: number) => {
    setExtraPayment(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value) || 0;
    setExtraPayment(numValue);
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
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Extra Repayments Simulator
      </h2>
      <p className="text-gray-600 mb-4">
        See how extra repayments reduce your interest and loan term
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
            onChange={(e) => {
              setExtraPayment(parseFloat(e.target.value));
              setCustomAmount(e.target.value);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter custom amount"
        />
      </div>

      {extraPayment > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 mb-2">
            <strong>Extra payment:</strong> {formatCurrency(extraPayment)} per{' '}
            {formatFrequency(loanInput.frequency)}
          </p>
        </div>
      )}
    </div>
  );
}
