import { useState, useEffect } from 'react';
import type { LumpSumPayment } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface LumpSumPaymentsProps {
  onLumpSumsChange: (lumpSums: LumpSumPayment[]) => void;
  paymentsPerYear: number;
  initialLumpSums?: LumpSumPayment[];
}

export function LumpSumPayments({
  onLumpSumsChange,
  paymentsPerYear,
  initialLumpSums,
}: LumpSumPaymentsProps) {
  const [lumpSums, setLumpSums] = useState<LumpSumPayment[]>(initialLumpSums || []);

  // Update lump sums when initialLumpSums changes
  useEffect(() => {
    if (initialLumpSums !== undefined) {
      setLumpSums(initialLumpSums);
    }
  }, [initialLumpSums]);

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
    <Card className="mb-6 shadow-lg border-2 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Lump Sum Payments
            </CardTitle>
            <CardDescription className="text-base mt-1">
              Add one-time payments to see how they affect your loan payoff
            </CardDescription>
          </div>
          <Button
            type="button"
            onClick={addLumpSum}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            + Add Lump Sum
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {lumpSums.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              No lump sum payments added yet. Click the button above to add one.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lumpSums.map((lumpSum, index) => (
              <Card key={index} className="border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors duration-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <h3 className="font-semibold text-lg">
                        Lump Sum #{index + 1}
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLumpSum(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Amount ($)</Label>
                      <Input
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
                        placeholder="5,000"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Payment Number</Label>
                      <Input
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
                        placeholder="12"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground font-medium">
                        ~{periodsToMonths(lumpSum.period || 0)} months from start
                      </p>
                    </div>
                  </div>

                  {lumpSum.amount > 0 && (
                    <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                        <span className="text-base">{formatCurrency(lumpSum.amount)}</span> at payment #{lumpSum.period || 0}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
