import { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { LoanInputForm } from '../components/loan/LoanInputForm';
import { RepaymentResults } from '../components/loan/RepaymentResults';
import { ExtraRepaymentSimulator } from '../components/loan/ExtraRepaymentSimulator';
import { LumpSumPayments } from '../components/loan/LumpSumPayments';
import { LoanChart } from '../components/loan/LoanChart';
import { SummaryPanel } from '../components/loan/SummaryPanel';
import { useLoanCalculator } from '../hooks/useLoanCalculator';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { saveLoan } from '../utils/loanStorage';

export default function Calculator() {
  const {
    loanInput,
    extraPaymentPerPeriod,
    lumpSums,
    baselineCalculation,
    acceleratedCalculation,
    paymentsPerYear,
    showAcceleratedResults,
    handleLoanSubmit,
    setExtraPaymentPerPeriod,
    setLumpSums,
  } = useLoanCalculator();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleSaveLoan = () => {
    if (!loanInput) return;
    
    saveLoan(loanInput, extraPaymentPerPeriod, lumpSums, saveName || undefined);
    setShowSaveModal(false);
    setSaveName('');
    alert('Loan saved successfully!');
  };

  return (
    <MainLayout>
      {/* Loan Input Section */}
      <LoanInputForm onSubmit={handleLoanSubmit} initialValue={loanInput || undefined} />

      {/* Results Section */}
      {loanInput && baselineCalculation && (
        <>
          {/* Save Button */}
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => setShowSaveModal(true)}
              className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Loan
            </Button>
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
              initialLumpSums={loanInput ? lumpSums : undefined}
            />
          </div>

          {/* Summary and Chart */}
          {showAcceleratedResults && acceleratedCalculation && (
            <SummaryPanel
              baseline={baselineCalculation}
              accelerated={acceleratedCalculation}
              extraPaymentPerPeriod={extraPaymentPerPeriod}
            />
          )}

          {/* Chart */}
          <LoanChart 
            loanInput={loanInput}
            extraPaymentPerPeriod={extraPaymentPerPeriod}
            lumpSums={lumpSums}
          />
        </>
      )}

      {/* Empty State */}
      {!loanInput && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-lg mb-4">
              Enter your loan details above to get started
            </p>
            <p className="text-sm text-muted-foreground">
              See how small changes in repayment behavior can save you thousands
              in interest
            </p>
          </CardContent>
        </Card>
      )}

      {/* Save Modal */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Loan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="saveName">Loan Name (optional)</Label>
              <Input
                id="saveName"
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., Car Loan 2024"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to auto-generate a name
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSaveLoan}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveName('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
