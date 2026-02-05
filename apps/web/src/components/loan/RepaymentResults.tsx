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
    <Card className="mb-8 shadow-lg border-2 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Your Loan Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Minimum Payment</p>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {formatCurrency(calculation.periodicPayment)}
              </p>
              <p className="text-xs text-muted-foreground">per {frequency}</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors duration-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Amount Paid</p>
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(calculation.totalPayments)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/30 hover:border-destructive/50 transition-colors duration-200 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <p className="text-sm font-medium text-destructive uppercase tracking-wide">Total Interest Paid</p>
              </div>
              <p className="text-3xl font-bold text-destructive">
                {formatCurrency(calculation.totalInterest)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-300 dark:hover:border-green-700 transition-colors duration-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Loan End Date</p>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatDate(calculation.loanEndDate)}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
