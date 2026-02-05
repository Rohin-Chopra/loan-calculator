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
    <Card className="mb-6 shadow-lg border-2 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Extra Repayments Simulator
        </CardTitle>
        <CardDescription className="text-base">
          See how extra repayments reduce your interest and loan term
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label className="mb-3 text-base font-semibold block">
            Extra Payment per {formatFrequency(loanInput.frequency)}
          </Label>
          
          {/* Quick select buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={extraPayment === amount ? "default" : "outline"}
                onClick={() => handleQuickSelect(amount)}
                className={`h-10 px-4 font-semibold transition-all duration-200 ${
                  extraPayment === amount 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg' 
                    : 'hover:border-green-300 dark:hover:border-green-700'
                }`}
              >
                ${amount}
              </Button>
            ))}
          </div>

          {/* Slider */}
          <div className="mb-6">
            <Slider
              min={0}
              max={500}
              step={25}
              value={[extraPayment]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
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
            className="h-12 text-lg"
          />
        </div>

        {extraPayment > 0 && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border-2 border-green-200 dark:border-green-800 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                  <span className="text-base">Extra payment:</span> <span className="text-lg">{formatCurrency(extraPayment)}</span> per{' '}
                  {formatFrequency(loanInput.frequency)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
