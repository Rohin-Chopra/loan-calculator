import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { LoanInput } from '../types';
import { useTheme } from '../hooks/useTheme';
import { calculateLoanSchedule } from '../utils/loanCalculator';

type FrequencyOption = 'fortnightly' | 'monthly' | 'yearly';

interface LoanChartProps {
  loanInput: LoanInput;
}

export function LoanChart({ loanInput }: LoanChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption>('monthly');

  // Calculate schedule for selected frequency
  const selectedFrequencyCalculation = useMemo(() => {
    if (selectedFrequency === 'yearly') {
      // Calculate yearly payments manually
      const paymentsPerYear = 1;
      const periodicRate = loanInput.annualRate / paymentsPerYear;
      const totalPayments = paymentsPerYear * loanInput.termYears;
      
      // Calculate minimum payment using amortization formula
      const periodicPayment = periodicRate === 0
        ? loanInput.principal / totalPayments
        : loanInput.principal * (periodicRate / (1 - Math.pow(1 + periodicRate, -totalPayments)));
      
      // Calculate schedule
      const schedule: Array<{ period: number; balance: number }> = [];
      let balance = loanInput.principal;
      let period = 0;
      
      while (balance > 0.01 && period < totalPayments) {
        const interestPaid = balance * periodicRate;
        const principalPaid = Math.min(periodicPayment - interestPaid, balance);
        balance -= principalPaid;
        period++;
        schedule.push({ period, balance: Math.max(0, balance) });
      }
      
      return schedule;
    }

    const frequencyLoanInput: LoanInput = {
      ...loanInput,
      frequency: selectedFrequency,
    };
    
    const calculation = calculateLoanSchedule(frequencyLoanInput);
    return calculation.schedule.map(item => ({
      period: item.period,
      balance: item.balance,
    }));
  }, [selectedFrequency, loanInput]);

  // Prepare data for chart - sample every Nth period to keep it manageable
  const sampleRate = Math.max(1, Math.floor(selectedFrequencyCalculation.length / 50));
  
  const chartData = selectedFrequencyCalculation
    .filter((_, index) => index % sampleRate === 0 || index === selectedFrequencyCalculation.length - 1)
    .map((item) => ({
      period: item.period,
      balance: Math.round(item.balance),
    }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const frequencies: FrequencyOption[] = ['fortnightly', 'monthly', 'yearly'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Loan Balance Over Time
        </h2>
        
        {/* Frequency Selector Tabs */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {frequencies.map((freq) => (
            <button
              key={freq}
              onClick={() => setSelectedFrequency(freq)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFrequency === freq
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
            <XAxis
              dataKey="period"
              label={{
                value: 'Payment Period',
                position: 'insideBottom',
                offset: -5,
              }}
              stroke={isDark ? "#9ca3af" : "#6b7280"}
            />
            <YAxis
              label={{
                value: 'Balance ($)',
                angle: -90,
                position: 'insideLeft',
              }}
              stroke={isDark ? "#9ca3af" : "#6b7280"}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
              labelFormatter={(label) => `Period ${label}`}
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#fff',
                border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                borderRadius: '8px',
                color: isDark ? '#f3f4f6' : '#111827',
              }}
            />
            <Legend wrapperStyle={{ color: isDark ? '#f3f4f6' : '#111827' }} />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#ef4444"
              strokeWidth={2}
              name="Minimum Repayment"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
