import { useState, useMemo, useEffect } from 'react';
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
import type { LoanInput, LumpSumPayment } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { calculateLoanSchedule } from '../../utils/loanCalculator';

type FrequencyOption = 'fortnightly' | 'monthly' | 'yearly';

interface LoanChartProps {
  loanInput: LoanInput;
  extraPaymentPerPeriod?: number;
  lumpSums?: LumpSumPayment[];
}

export function LoanChart({ loanInput, extraPaymentPerPeriod = 0, lumpSums = [] }: LoanChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Initialize frequency based on loan input, mapping weekly to fortnightly
  const getInitialFrequency = (freq: string): FrequencyOption => {
    if (freq === 'weekly' || freq === 'fortnightly') {
      return 'fortnightly';
    }
    if (freq === 'monthly') {
      return 'monthly';
    }
    return 'monthly'; // default fallback
  };
  
  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption>(() => 
    getInitialFrequency(loanInput.frequency)
  );
  
  // Update frequency when loanInput changes (e.g., when loading a saved loan)
  useEffect(() => {
    const newFreq = getInitialFrequency(loanInput.frequency);
    setSelectedFrequency(newFreq);
  }, [loanInput.frequency]);

  const hasExtraPayments = extraPaymentPerPeriod > 0 || lumpSums.length > 0;

  // Helper function to get payments per year for a frequency
  const getPaymentsPerYear = (freq: string): number => {
    switch (freq) {
      case 'weekly': return 52;
      case 'fortnightly': return 26;
      case 'monthly': return 12;
      case 'yearly': return 1;
      default: return 12;
    }
  };

  // Helper function to convert extra payment to selected frequency
  const convertExtraPayment = (originalFreq: string, targetFreq: FrequencyOption, extraPayment: number): number => {
    if (originalFreq === targetFreq) return extraPayment;
    
    const originalPaymentsPerYear = getPaymentsPerYear(originalFreq);
    const targetPaymentsPerYear = getPaymentsPerYear(targetFreq);
    
    // Convert: extra payment per period * periods per year = total extra per year
    // Then divide by target periods per year
    return (extraPayment * originalPaymentsPerYear) / targetPaymentsPerYear;
  };

  // Helper function to convert lump sum periods to target frequency
  const convertLumpSums = (originalFreq: string, targetFreq: FrequencyOption, lumpSums: LumpSumPayment[]): LumpSumPayment[] => {
    if (originalFreq === targetFreq) return lumpSums;
    
    const originalPaymentsPerYear = getPaymentsPerYear(originalFreq);
    const targetPaymentsPerYear = getPaymentsPerYear(targetFreq);
    const conversionRatio = targetPaymentsPerYear / originalPaymentsPerYear;
    
    return lumpSums.map(ls => ({
      ...ls,
      period: Math.floor(ls.period * conversionRatio),
    }));
  };

  // Calculate baseline schedule for selected frequency
  const baselineSchedule = useMemo(() => {
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
    
    const calculation = calculateLoanSchedule(frequencyLoanInput, 0, []);
    return calculation.schedule.map(item => ({
      period: item.period,
      balance: item.balance,
    }));
  }, [selectedFrequency, loanInput]);

  // Calculate accelerated schedule for selected frequency
  const acceleratedSchedule = useMemo(() => {
    if (!hasExtraPayments) return null;

    if (selectedFrequency === 'yearly') {
      // For yearly, we need to convert extra payments appropriately
      // Since yearly payments are much larger, we'll scale the extra payment
      const paymentsPerYear = 1;
      const periodicRate = loanInput.annualRate / paymentsPerYear;
      const totalPayments = paymentsPerYear * loanInput.termYears;
      
      // Calculate minimum payment
      const periodicPayment = periodicRate === 0
        ? loanInput.principal / totalPayments
        : loanInput.principal * (periodicRate / (1 - Math.pow(1 + periodicRate, -totalPayments)));
      
      // Convert extra payment to yearly equivalent
      const yearlyExtraPayment = convertExtraPayment(loanInput.frequency, 'yearly', extraPaymentPerPeriod);
      
      // Convert lump sums to yearly periods
      const convertedLumpSums = convertLumpSums(loanInput.frequency, 'yearly', lumpSums);
      
      // Calculate schedule with extra payments
      const schedule: Array<{ period: number; balance: number }> = [];
      let balance = loanInput.principal;
      let period = 0;
      const lumpSumMap = new Map(convertedLumpSums.map(ls => [ls.period, ls.amount]));
      
      while (balance > 0.01 && period < totalPayments) {
        // Apply lump sum if applicable
        if (lumpSumMap.has(period)) {
          balance -= lumpSumMap.get(period)!;
          if (balance < 0) balance = 0;
        }

        if (balance <= 0.01) break;

        const interestPaid = balance * periodicRate;
        const totalPayment = periodicPayment + yearlyExtraPayment;
        const principalPaid = Math.min(totalPayment - interestPaid, balance);
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
    
    // Convert extra payment and lump sums to selected frequency
    const convertedExtraPayment = convertExtraPayment(loanInput.frequency, selectedFrequency, extraPaymentPerPeriod);
    const convertedLumpSums = convertLumpSums(loanInput.frequency, selectedFrequency, lumpSums);
    
    const calculation = calculateLoanSchedule(frequencyLoanInput, convertedExtraPayment, convertedLumpSums);
    return calculation.schedule.map(item => ({
      period: item.period,
      balance: item.balance,
    }));
  }, [selectedFrequency, loanInput, extraPaymentPerPeriod, lumpSums, hasExtraPayments]);

  // Prepare data for chart - sample every Nth period to keep it manageable
  const sampleRate = Math.max(1, Math.floor(baselineSchedule.length / 50));
  
  // Merge baseline and accelerated data
  const chartData = baselineSchedule
    .filter((_, index) => index % sampleRate === 0 || index === baselineSchedule.length - 1)
    .map((item) => {
      const baselineBalance = Math.round(item.balance);
      
      // Find corresponding accelerated balance if available
      let acceleratedBalance = baselineBalance;
      if (acceleratedSchedule) {
        const accelItem = acceleratedSchedule.find(acc => acc.period === item.period);
        if (accelItem) {
          acceleratedBalance = Math.round(accelItem.balance);
        } else {
          // If accelerated schedule is shorter, use the last value
          const lastAccel = acceleratedSchedule[acceleratedSchedule.length - 1];
          if (lastAccel && item.period > lastAccel.period) {
            acceleratedBalance = 0;
          }
        }
      }
      
      return {
        period: item.period,
        baseline: baselineBalance,
        accelerated: acceleratedBalance,
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
              dataKey="baseline"
              stroke="#ef4444"
              strokeWidth={2}
              name="Minimum Repayment"
              dot={false}
            />
            {hasExtraPayments && acceleratedSchedule && (
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
