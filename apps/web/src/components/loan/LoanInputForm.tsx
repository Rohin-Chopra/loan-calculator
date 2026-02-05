import { useState, useEffect } from 'react';
import type { LoanInput, RepaymentFrequency } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface LoanInputProps {
  onSubmit: (input: LoanInput) => void;
  initialValue?: LoanInput;
}

type LoanType = 'home' | 'car';

const LOAN_PRESETS: Record<LoanType, { principal: string; annualRate: string; termYears: string }> = {
  home: {
    principal: '500000',
    annualRate: '5.5',
    termYears: '30',
  },
  car: {
    principal: '52000',
    annualRate: '9.5',
    termYears: '7',
  },
};

export function LoanInputForm({ onSubmit, initialValue }: LoanInputProps) {
  // Determine initial loan type based on initialValue or default to 'car'
  const getInitialLoanType = (): LoanType => {
    if (initialValue) {
      // If interest rate is <= 6%, consider it a home loan, otherwise car loan
      return initialValue.annualRate <= 0.06 ? 'home' : 'car';
    }
    return 'car';
  };

  const [loanType, setLoanType] = useState<LoanType>(getInitialLoanType());
  const [principal, setPrincipal] = useState<string>(initialValue?.principal.toString() || LOAN_PRESETS[getInitialLoanType()].principal);
  const [annualRate, setAnnualRate] = useState<string>(initialValue ? (initialValue.annualRate * 100).toString() : LOAN_PRESETS[getInitialLoanType()].annualRate);
  const [termYears, setTermYears] = useState<string>(initialValue?.termYears.toString() || LOAN_PRESETS[getInitialLoanType()].termYears);
  const [frequency, setFrequency] = useState<RepaymentFrequency>(initialValue?.frequency || 'fortnightly');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setPrincipal(initialValue.principal.toString());
      setAnnualRate((initialValue.annualRate * 100).toString());
      setTermYears(initialValue.termYears.toString());
      setFrequency(initialValue.frequency);
      // Update loan type based on interest rate
      setLoanType(initialValue.annualRate <= 0.06 ? 'home' : 'car');
    }
  }, [initialValue]);

  // Handle loan type toggle
  const handleLoanTypeChange = (checked: boolean) => {
    const newLoanType: LoanType = checked ? 'home' : 'car';
    setLoanType(newLoanType);
    
    // Only update if form fields haven't been manually modified
    // We'll update them when switching loan types
    const preset = LOAN_PRESETS[newLoanType];
    setPrincipal(preset.principal);
    setAnnualRate(preset.annualRate);
    setTermYears(preset.termYears);
  };

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
    <Card className="mb-8 shadow-lg border-2 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Loan Details
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your loan information to get started
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Type Toggle */}
          <div className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-lg border-2 border-border">
            <Label className="text-base font-semibold">Loan Type</Label>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${loanType === 'car' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Car Loan
              </span>
              <Switch
                checked={loanType === 'home'}
                onCheckedChange={handleLoanTypeChange}
                aria-label="Toggle loan type"
              />
              <span className={`text-sm font-medium ${loanType === 'home' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Home Loan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="principal" className="text-base font-semibold">
                Loan Amount ($)
              </Label>
              <Input
                id="principal"
                type="number"
                step="1000"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className={`h-12 text-lg ${errors.principal ? 'border-destructive' : ''}`}
                placeholder="52,000"
              />
              {errors.principal && (
                <p className="text-sm text-destructive font-medium">{errors.principal}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualRate" className="text-base font-semibold">
                Interest Rate (% per year)
              </Label>
              <Input
                id="annualRate"
                type="number"
                step="0.1"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                className={`h-12 text-lg ${errors.annualRate ? 'border-destructive' : ''}`}
                placeholder="9.5"
              />
              {errors.annualRate && (
                <p className="text-sm text-destructive font-medium">{errors.annualRate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="termYears" className="text-base font-semibold">
                Loan Term (years)
              </Label>
              <Input
                id="termYears"
                type="number"
                step="0.5"
                value={termYears}
                onChange={(e) => setTermYears(e.target.value)}
                className={`h-12 text-lg ${errors.termYears ? 'border-destructive' : ''}`}
                placeholder="7"
              />
              {errors.termYears && (
                <p className="text-sm text-destructive font-medium">{errors.termYears}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-base font-semibold">
                Repayment Frequency
              </Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value as RepaymentFrequency)}>
                <SelectTrigger id="frequency" className="h-12 text-lg">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Calculate Loan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
