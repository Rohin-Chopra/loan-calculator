import { useState, useMemo } from 'react';
import type { LoanInput, LoanCalculation, LumpSumPayment } from './types';
import { calculateLoanSchedule } from './utils/loanCalculator';
import { LoanInputForm } from './components/LoanInput';
import { RepaymentResults } from './components/RepaymentResults';
import { ExtraRepaymentSimulator } from './components/ExtraRepaymentSimulator';
import { LumpSumPayments } from './components/LumpSumPayments';
import { LoanChart } from './components/LoanChart';
import { SummaryPanel } from './components/SummaryPanel';
import { useTheme } from './hooks/useTheme';

function getPaymentsPerYear(frequency: string): number {
  switch (frequency) {
    case 'weekly':
      return 52;
    case 'fortnightly':
      return 26;
    case 'monthly':
      return 12;
    default:
      return 12;
  }
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [loanInput, setLoanInput] = useState<LoanInput | null>(null);
  const [extraPaymentPerPeriod, setExtraPaymentPerPeriod] = useState<number>(0);
  const [lumpSums, setLumpSums] = useState<LumpSumPayment[]>([]);

  // Calculate baseline (minimum repayment only)
  const baselineCalculation = useMemo(() => {
    if (!loanInput) return null;
    return calculateLoanSchedule(loanInput, 0, []);
  }, [loanInput]);

  // Calculate accelerated (with extra payments and lump sums)
  const acceleratedCalculation = useMemo(() => {
    if (!loanInput) return null;
    return calculateLoanSchedule(loanInput, extraPaymentPerPeriod, lumpSums);
  }, [loanInput, extraPaymentPerPeriod, lumpSums]);

  const handleLoanSubmit = (input: LoanInput) => {
    setLoanInput(input);
    setExtraPaymentPerPeriod(0);
    setLumpSums([]);
  };


  const paymentsPerYear = loanInput
    ? getPaymentsPerYear(loanInput.frequency)
    : 12;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                💰 Kill My Loan
              </h1>
              <p className="text-blue-100 dark:text-blue-200 text-sm md:text-base">
                See how extra repayments dramatically reduce your interest and loan
                term
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Loan Input Section */}
        <LoanInputForm onSubmit={handleLoanSubmit} />

        {/* Results Section */}
        {loanInput && baselineCalculation && (
          <>
            <RepaymentResults
              calculation={baselineCalculation}
              frequency={loanInput.frequency}
            />

            {/* Optimization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ExtraRepaymentSimulator
                loanInput={loanInput}
                extraPayment={extraPaymentPerPeriod}
                onExtraPaymentChange={setExtraPaymentPerPeriod}
              />

              <LumpSumPayments
                onLumpSumsChange={setLumpSums}
                paymentsPerYear={paymentsPerYear}
              />
            </div>

            {/* Summary and Chart */}
            {acceleratedCalculation &&
              (extraPaymentPerPeriod > 0 || lumpSums.length > 0) &&
              acceleratedCalculation.schedule.length <
                baselineCalculation.schedule.length && (
                <>
                  <SummaryPanel
                    baseline={baselineCalculation}
                    accelerated={acceleratedCalculation}
                    extraPaymentPerPeriod={extraPaymentPerPeriod}
                    paymentsPerYear={paymentsPerYear}
                  />
                </>
              )}

            {/* Chart */}
            <LoanChart
              baseline={baselineCalculation}
              accelerated={
                acceleratedCalculation &&
                (extraPaymentPerPeriod > 0 || lumpSums.length > 0) &&
                acceleratedCalculation.schedule.length <
                  baselineCalculation.schedule.length
                  ? acceleratedCalculation
                  : undefined
              }
            />
          </>
        )}

        {/* Empty State */}
        {!loanInput && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              Enter your loan details above to get started
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              See how small changes in repayment behavior can save you thousands
              in interest
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-gray-300 dark:text-gray-400 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>
            Made with ❤️ for Australians looking to kill their loans faster
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            This calculator is for informational purposes only. Always consult
            with a financial advisor for personalized advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
