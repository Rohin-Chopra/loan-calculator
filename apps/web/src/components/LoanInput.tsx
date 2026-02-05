import { useState, useEffect } from 'react';
import type { LoanInput, RepaymentFrequency } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface LoanInputProps {
  onSubmit: (input: LoanInput) => void;
  initialValue?: LoanInput;
}

export function LoanInputForm({ onSubmit, initialValue }: LoanInputProps) {
  const [principal, setPrincipal] = useState<string>(initialValue?.principal.toString() || '52000');
  const [annualRate, setAnnualRate] = useState<string>(initialValue ? (initialValue.annualRate * 100).toString() : '9.5');
  const [termYears, setTermYears] = useState<string>(initialValue?.termYears.toString() || '7');
  const [frequency, setFrequency] = useState<RepaymentFrequency>(initialValue?.frequency || 'fortnightly');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setPrincipal(initialValue.principal.toString());
      setAnnualRate((initialValue.annualRate * 100).toString());
      setTermYears(initialValue.termYears.toString());
      setFrequency(initialValue.frequency);
    }
  }, [initialValue]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const principalNum = parseFloat(principal);
    if (isNaN(principalNum) || principalNum <= 0) {
      newErrors.principal = 'Loan amount must be greater than 0';
    }

    const rateNum = parseFloat(annualRate);
    if (isNaN(rateNum) || rateNum <= 0 || rateNum > 100) {
      newErrors.annualRate = 'Interest rate must be between 0 and 100';
    }

    const termNum = parseFloat(termYears);
    if (isNaN(termNum) || termNum <= 0 || termNum > 100) {
      newErrors.termYears = 'Loan term must be between 0 and 100 years';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        principal: parseFloat(principal),
        annualRate: parseFloat(annualRate) / 100, // Convert percentage to decimal
        termYears: parseFloat(termYears),
        frequency,
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Loan Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Loan Amount ($)</Label>
            <Input
              id="principal"
              type="number"
              step="1000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className={errors.principal ? 'border-destructive' : ''}
              placeholder="52000"
            />
            {errors.principal && (
              <p className="text-sm text-destructive">{errors.principal}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualRate">Interest Rate (% per year)</Label>
            <Input
              id="annualRate"
              type="number"
              step="0.1"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
              className={errors.annualRate ? 'border-destructive' : ''}
              placeholder="9.5"
            />
            {errors.annualRate && (
              <p className="text-sm text-destructive">{errors.annualRate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="termYears">Loan Term (years)</Label>
            <Input
              id="termYears"
              type="number"
              step="0.5"
              value={termYears}
              onChange={(e) => setTermYears(e.target.value)}
              className={errors.termYears ? 'border-destructive' : ''}
              placeholder="7"
            />
            {errors.termYears && (
              <p className="text-sm text-destructive">{errors.termYears}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Repayment Frequency</Label>
            <Select value={frequency} onValueChange={(value) => setFrequency(value as RepaymentFrequency)}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Calculate Loan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
