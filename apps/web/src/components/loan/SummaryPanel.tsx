import type { LoanCalculation } from '../../types';
import { calculateEquivalentReturn } from '../../utils/loanCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface SummaryPanelProps {
  baseline: LoanCalculation;
  accelerated: LoanCalculation;
  extraPaymentPerPeriod: number;
}

export function SummaryPanel({
  baseline,
  accelerated,
  extraPaymentPerPeriod,
}: SummaryPanelProps) {
  const interestSaved = baseline.totalInterest - accelerated.totalInterest;
  const timeSavedMonths =
    ((baseline.loanEndDate.getTime() - accelerated.loanEndDate.getTime()) /
      (1000 * 60 * 60 * 24 * 30.44)) | 0; // Approximate months
  const timeSavedYears = timeSavedMonths / 12;

  // Calculate duration until loan payoff
  const now = new Date();
  const payoffDurationMonths = Math.max(0,
    ((accelerated.loanEndDate.getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24 * 30.44)) | 0
  ); // Approximate months, ensure non-negative

  // Calculate total extra payments made
  const totalExtraPayments =
    extraPaymentPerPeriod * accelerated.schedule.length;

  const equivalentReturn = calculateEquivalentReturn(
    interestSaved,
    totalExtraPayments,
    timeSavedYears
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card className="mb-8 shadow-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/40 dark:to-teal-950/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <span className="text-3xl">🎉</span>
          <span className="bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
            Your Savings Summary
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          See how much you're saving with extra payments
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Interest Saved</p>
              </div>
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {formatCurrency(interestSaved)}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                💰 That's money back in your pocket!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Time Saved</p>
              </div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {formatTime(timeSavedMonths)}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                ⏰ You finish {timeSavedYears > 1 ? `${timeSavedYears.toFixed(1)} years` : `${timeSavedMonths} months`} earlier
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Loan Payoff Duration</p>
              </div>
              <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {formatTime(payoffDurationMonths)}
              </p>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                📅 Your loan will be paid off in {formatTime(payoffDurationMonths)}
              </p>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                End date: {formatDate(accelerated.loanEndDate)}
              </p>
            </CardContent>
          </Card>

          {equivalentReturn > 0 && (
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Equivalent Risk-Free Return
                  </p>
                </div>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {equivalentReturn.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  📈 Like earning {equivalentReturn.toFixed(1)}% risk-free on your extra payments
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Extra Payments Made
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    {formatCurrency(totalExtraPayments)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground font-medium">
                    You saved <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(interestSaved)}</span> by paying{' '}
                    <span className="font-bold">{formatCurrency(totalExtraPayments)}</span> extra
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
