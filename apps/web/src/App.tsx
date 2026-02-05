import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { LoanInput, LumpSumPayment, SavedLoan } from './types';
import { calculateLoanSchedule } from './utils/loanCalculator';
import { saveLoan } from './utils/loanStorage';
import { LoanInputForm } from './components/LoanInput';
import { RepaymentResults } from './components/RepaymentResults';
import { ExtraRepaymentSimulator } from './components/ExtraRepaymentSimulator';
import { LumpSumPayments } from './components/LumpSumPayments';
import { LoanChart } from './components/LoanChart';
import { SummaryPanel } from './components/SummaryPanel';
import { FrequencyComparisonTable } from './components/FrequencyComparisonTable';
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Load saved loan from sessionStorage if present
  useEffect(() => {
    const loadLoanData = sessionStorage.getItem('loadLoan');
    if (loadLoanData) {
      try {
        const savedLoan: SavedLoan = JSON.parse(loadLoanData);
        setLoanInput(savedLoan.loanInput);
        setExtraPaymentPerPeriod(savedLoan.extraPaymentPerPeriod);
        setLumpSums(savedLoan.lumpSums);
        sessionStorage.removeItem('loadLoan');
      } catch (e) {
        console.error('Failed to load saved loan:', e);
      }
    }
  }, []);

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

  const handleSaveLoan = () => {
    if (!loanInput) return;
    
    saveLoan(loanInput, extraPaymentPerPeriod, lumpSums, saveName || undefined);
    setShowSaveModal(false);
    setSaveName('');
    alert('Loan saved successfully!');
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
            <div className="flex gap-2">
              <Link
                to="/saved"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="View saved loans"
                title="Saved Loans"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </Link>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Loan Input Section */}
        <LoanInputForm onSubmit={handleLoanSubmit} />

        {/* Results Section */}
        {loanInput && baselineCalculation && (
          <>
            {/* Save Button */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Loan
              </button>
            </div>

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
                  />
                </>
              )}

            {/* Frequency Comparison Table */}
            <FrequencyComparisonTable
              principal={loanInput.principal}
              annualRate={loanInput.annualRate}
              termYears={loanInput.termYears}
            />

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

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Save Loan
            </h3>
            <div className="mb-4">
              <label
                htmlFor="saveName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Loan Name (optional)
              </label>
              <input
                id="saveName"
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., Car Loan 2024"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave blank to auto-generate a name
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveLoan}
                className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveName('');
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
