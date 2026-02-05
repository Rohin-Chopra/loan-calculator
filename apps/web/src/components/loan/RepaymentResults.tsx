import type { LoanCalculation } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface RepaymentResultsProps {
  calculation: LoanCalculation;
  frequency: string;
}

export function RepaymentResults({
  calculation,
  frequency,
}: RepaymentResultsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Your Loan Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Minimum Payment</p>
              <p className="text-2xl font-bold">
                {formatCurrency(calculation.periodicPayment)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per {frequency}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Amount Paid</p>
              <p className="text-2xl font-bold">
                {formatCurrency(calculation.totalPayments)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="p-4">
              <p className="text-sm text-destructive mb-1">Total Interest Paid</p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(calculation.totalInterest)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Loan End Date</p>
              <p className="text-xl font-bold">
                {formatDate(calculation.loanEndDate)}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
