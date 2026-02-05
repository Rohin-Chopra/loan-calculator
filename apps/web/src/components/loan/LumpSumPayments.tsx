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
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Lump Sum Payments</CardTitle>
            <CardDescription>
              Add one-time payments to see how they affect your loan payoff
            </CardDescription>
          </div>
          <Button
            type="button"
            onClick={addLumpSum}
            size="sm"
          >
            + Add Lump Sum
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {lumpSums.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">
            No lump sum payments added yet. Click the button above to add one.
          </p>
        ) : (
          <div className="space-y-4">
            {lumpSums.map((lumpSum, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">
                      Lump Sum #{index + 1}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLumpSum(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount ($)</Label>
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
                        placeholder="5000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Number</Label>
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
                      />
                      <p className="text-xs text-muted-foreground">
                        ~{periodsToMonths(lumpSum.period || 0)} months from start
                      </p>
                    </div>
                  </div>

                  {lumpSum.amount > 0 && (
                    <div className="mt-3 text-sm">
                      <strong>{formatCurrency(lumpSum.amount)}</strong> at payment #{lumpSum.period || 0}
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
