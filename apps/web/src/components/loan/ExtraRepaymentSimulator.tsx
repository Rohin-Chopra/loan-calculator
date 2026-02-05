import { useState } from 'react';
import type { LoanInput } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

interface ExtraRepaymentSimulatorProps {
  loanInput: LoanInput;
  extraPayment: number;
  onExtraPaymentChange: (amount: number) => void;
}

export function ExtraRepaymentSimulator({
  loanInput,
  extraPayment,
  onExtraPaymentChange,
}: ExtraRepaymentSimulatorProps) {
  const [customAmount, setCustomAmount] = useState<string>('');

  // Quick select buttons
  const quickAmounts = [25, 50, 100, 200];

  const handleQuickSelect = (amount: number) => {
    onExtraPaymentChange(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value) || 0;
    onExtraPaymentChange(numValue);
  };

  const handleSliderChange = (values: number[]) => {
    const numValue = values[0];
    onExtraPaymentChange(numValue);
    setCustomAmount(numValue.toString());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatFrequency = (freq: string) => {
    return freq.charAt(0).toUpperCase() + freq.slice(1);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Extra Repayments Simulator</CardTitle>
        <CardDescription>
          See how extra repayments reduce your interest and loan term
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label className="mb-2">
            Extra Payment per {formatFrequency(loanInput.frequency)}
          </Label>
          
          {/* Quick select buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={extraPayment === amount ? "default" : "outline"}
                onClick={() => handleQuickSelect(amount)}
              >
                ${amount}
              </Button>
            ))}
          </div>

          {/* Slider */}
          <div className="mb-4">
            <Slider
              min={0}
              max={500}
              step={25}
              value={[extraPayment]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$0</span>
              <span>$500</span>
            </div>
          </div>

          {/* Custom input */}
          <Input
            type="number"
            step="25"
            min="0"
            value={customAmount || extraPayment}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="Enter custom amount"
          />
        </div>

        {extraPayment > 0 && (
          <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>Extra payment:</strong> {formatCurrency(extraPayment)} per{' '}
                {formatFrequency(loanInput.frequency)}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
