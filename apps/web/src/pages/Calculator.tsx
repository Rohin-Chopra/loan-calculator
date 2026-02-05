import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
import { saveLoan, updateSavedLoan, getSavedLoan } from '../utils/loanStorage';
import type { LoanInput, LumpSumPayment } from '../types';

export default function Calculator() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  const {
    loanInput,
    extraPaymentPerPeriod,
    lumpSums,
    baselineCalculation,
    acceleratedCalculation,
    paymentsPerYear,
    showAcceleratedResults,
    currentLoanId,
    handleLoanSubmit,
    setExtraPaymentPerPeriod,
    setLumpSums,
    setCurrentLoanId,
  } = useLoanCalculator(id);

  // Handle invalid loan ID in URL
  useEffect(() => {
    if (id && !currentLoanId && !loanInput) {
      // Check if loan exists
      const savedLoan = getSavedLoan(id);
      if (!savedLoan) {
        // Loan doesn't exist, redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [id, currentLoanId, loanInput, navigate]);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Load loan name when opening save modal if editing existing loan
  useEffect(() => {
    if (showSaveModal && currentLoanId) {
      const savedLoan = getSavedLoan(currentLoanId);
      if (savedLoan) {
        setSaveName(savedLoan.name);
      }
    } else if (!showSaveModal) {
      setSaveName('');
    }
  }, [showSaveModal, currentLoanId]);

  const handleSaveLoan = () => {
    if (!loanInput) return;
    
    if (currentLoanId) {
      // Update existing loan
      const updateData: {
        loanInput: LoanInput;
        extraPaymentPerPeriod: number;
        lumpSums: LumpSumPayment[];
        name?: string;
      } = {
        loanInput,
        extraPaymentPerPeriod,
        lumpSums,
      };
      
      // Only update name if provided
      if (saveName.trim()) {
        updateData.name = saveName.trim();
      }
      
      const updated = updateSavedLoan(currentLoanId, updateData);
      
      if (updated) {
        // Update URL to reflect the loan ID if not already there
        if (id !== currentLoanId) {
          navigate(`/loan/${currentLoanId}`, { replace: true });
        }
        setShowSaveModal(false);
        setSaveName('');
        toast.success('Loan updated successfully!');
      } else {
        toast.error('Failed to update loan. Please try again.');
      }
    } else {
      // Create new loan
      const newLoan = saveLoan(loanInput, extraPaymentPerPeriod, lumpSums, saveName || undefined);
      setCurrentLoanId(newLoan.id); // Set the current loan ID so future updates work
      // Navigate to the loan's URL
      navigate(`/loan/${newLoan.id}`, { replace: true });
      setShowSaveModal(false);
      setSaveName('');
      toast.success('Loan saved successfully!');
    }
  };

  return (
    <MainLayout>
      {/* Loan Input Section */}
      <LoanInputForm onSubmit={handleLoanSubmit} initialValue={loanInput || undefined} />

      {/* Results Section */}
      {loanInput && baselineCalculation && (
        <>
          {/* Save Button */}
          <div className="mb-6 flex justify-end">
            <Button
              onClick={() => setShowSaveModal(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 h-11 px-6"
            >
              {currentLoanId ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              {currentLoanId ? 'Update Loan' : 'Save Loan'}
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
        <Card className="shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Enter your loan details above to get started
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              See how small changes in repayment behavior can save you thousands
              in interest
            </p>
          </CardContent>
        </Card>
      )}

      {/* Save Modal */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              {currentLoanId ? 'Update Loan' : 'Save Loan'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="saveName" className="text-base font-semibold">Loan Name (optional)</Label>
              <Input
                id="saveName"
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., Car Loan 2024"
                autoFocus
                className="h-12 text-lg"
              />
              <p className="text-xs text-muted-foreground font-medium">
                Leave blank to auto-generate a name
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSaveLoan}
                className="flex-1 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {currentLoanId ? 'Update' : 'Save'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveName('');
                }}
                className="flex-1 h-11"
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
