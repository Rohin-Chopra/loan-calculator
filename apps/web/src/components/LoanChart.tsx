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
import type { LoanCalculation, LoanInput } from '../types';
import { useTheme } from '../hooks/useTheme';
import { calculateLoanSchedule } from '../utils/loanCalculator';

type FrequencyOption = 'fortnightly' | 'monthly' | 'yearly';

interface LoanChartProps {
  baseline: LoanCalculation;
  accelerated?: LoanCalculation;
  loanInput: LoanInput;
}

export function LoanChart({ baseline, accelerated, loanInput }: LoanChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption>('monthly');
  
  // Prepare data for chart - sample every Nth period to keep it manageable
  const sampleRate = Math.max(1, Math.floor(baseline.schedule.length / 50));
  
  const baselineData = baseline.schedule
    .filter((_, index) => index % sampleRate === 0 || index === baseline.schedule.length - 1)
    .map((item) => ({
      period: item.period,
      baseline: Math.round(item.balance),
      accelerated: 0,
    }));

  const acceleratedData = accelerated
    ? accelerated.schedule
        .filter((_, index) => index % sampleRate === 0 || index === accelerated.schedule.length - 1)
        .map((item) => ({
          period: item.period,
          baseline: 0,
          accelerated: Math.round(item.balance),
        }))
    : [];

  // Merge data
  const chartData = baselineData.map((item, index) => {
    const accelItem = acceleratedData[index];
    return {
      period: item.period,
      baseline: item.baseline,
      accelerated: accelItem?.accelerated ?? item.baseline,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Loan Balance Over Time
      </h2>
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
              dataKey="baseline"
              stroke="#ef4444"
              strokeWidth={2}
              name="Minimum Repayment"
              dot={false}
            />
            {accelerated && (
              <Line
                type="monotone"
                dataKey="accelerated"
                stroke="#10b981"
                strokeWidth={2}
                name="With Extra Payments"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
