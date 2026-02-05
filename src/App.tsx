import { useState, useMemo } from 'react';
import type { LoanInput, LoanCalculation, LumpSumPayment } from './types';
import { calculateLoanSchedule } from './utils/loanCalculator';
import { LoanInputForm } from './components/LoanInput';
import { RepaymentResults } from './components/RepaymentResults';
import { ExtraRepaymentSimulator } from './components/ExtraRepaymentSimulator';
import { LumpSumPayments } from './components/LumpSumPayments';
import { LoanChart } from './components/LoanChart';
import { SummaryPanel } from './components/SummaryPanel';

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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            💰 Kill My Loan
          </h1>
          <p className="text-blue-100 text-sm md:text-base">
            See how extra repayments dramatically reduce your interest and loan
            term
          </p>
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
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              Enter your loan details above to get started
            </p>
            <p className="text-gray-500 text-sm">
              See how small changes in repayment behavior can save you thousands
              in interest
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>
            Made with ❤️ for Australians looking to kill their loans faster
          </p>
          <p className="mt-2 text-xs text-gray-500">
            This calculator is for informational purposes only. Always consult
            with a financial advisor for personalized advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
