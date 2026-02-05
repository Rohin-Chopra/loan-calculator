import { useState } from 'react';
import type { LumpSumPayment } from '../types';

interface LumpSumPaymentsProps {
  onLumpSumsChange: (lumpSums: LumpSumPayment[]) => void;
  paymentsPerYear: number;
}

export function LumpSumPayments({
  onLumpSumsChange,
  paymentsPerYear,
}: LumpSumPaymentsProps) {
  const [lumpSums, setLumpSums] = useState<LumpSumPayment[]>([]);

  const addLumpSum = () => {
    setLumpSums([...lumpSums, { amount: 0, period: 0 }]);
  };

  const removeLumpSum = (index: number) => {
    setLumpSums(lumpSums.filter((_, i) => i !== index));
  };

  const updateLumpSum = (
    index: number,
    field: keyof LumpSumPayment,
    value: number
  ) => {
    const updated = [...lumpSums];
    updated[index] = { ...updated[index], [field]: value };
    setLumpSums(updated);
    onLumpSumsChange(updated);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate approximate months from periods
  const periodsToMonths = (periods: number) => {
    return Math.round((periods / paymentsPerYear) * 12);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Lump Sum Payments
        </h2>
        <button
          type="button"
          onClick={addLumpSum}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Add Lump Sum
        </button>
      </div>
      <p className="text-gray-600 mb-4 text-sm">
        Add one-time payments to see how they affect your loan payoff
      </p>

      {lumpSums.length === 0 ? (
        <p className="text-gray-500 text-sm italic">
          No lump sum payments added yet. Click the button above to add one.
        </p>
      ) : (
        <div className="space-y-4">
          {lumpSums.map((lumpSum, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-700">
                  Lump Sum #{index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeLumpSum(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={lumpSum.amount || ''}
                    onChange={(e) =>
                      updateLumpSum(
                        index,
                        'amount',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Number
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lumpSum.period || ''}
                    onChange={(e) =>
                      updateLumpSum(
                        index,
                        'period',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ~{periodsToMonths(lumpSum.period || 0)} months from start
                  </p>
                </div>
              </div>

              {lumpSum.amount > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  <strong>{formatCurrency(lumpSum.amount)}</strong> at payment #{lumpSum.period || 0}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
