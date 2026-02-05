import type {
  LoanInput,
  LoanCalculation,
  PaymentScheduleItem,
  LumpSumPayment,
} from '../types';

/**
 * Calculate payments per year based on frequency
 */
function getPaymentsPerYear(frequency: string): number {
  switch (frequency) {
    case 'weekly':
      return 52;
    case 'fortnightly':
      return 26;
    case 'monthly':
      return 12;
    default:
      return 12;
  }
}

/**
 * Calculate minimum periodic payment using amortization formula
 * 
 * Formula: P * (r) / (1 - (1 + r)^(-n))
 * Where:
 *   P = principal
 *   r = periodic interest rate
 *   n = total number of payments
 */
export function calculateMinimumPayment(input: LoanInput): number {
  const { principal, annualRate, termYears, frequency } = input;
  
  const paymentsPerYear = getPaymentsPerYear(frequency);
  const periodicRate = annualRate / paymentsPerYear;
  const totalPayments = paymentsPerYear * termYears;

  // Handle edge case: if rate is 0, payment is just principal / payments
  if (periodicRate === 0) {
    return principal / totalPayments;
  }

  // Amortization formula
  const payment =
    principal *
    (periodicRate / (1 - Math.pow(1 + periodicRate, -totalPayments)));

  return payment;
}

/**
 * Calculate full loan schedule with optional extra repayments and lump sums
 */
export function calculateLoanSchedule(
  input: LoanInput,
  extraPaymentPerPeriod: number = 0,
  lumpSums: LumpSumPayment[] = []
): LoanCalculation {
  const { principal, annualRate, termYears, frequency } = input;
  
  const paymentsPerYear = getPaymentsPerYear(frequency);
  const periodicRate = annualRate / paymentsPerYear;
  const minimumPayment = calculateMinimumPayment(input);
  const totalPaymentPerPeriod = minimumPayment + extraPaymentPerPeriod;

  // Sort lump sums by period
  const sortedLumpSums = [...lumpSums].sort((a, b) => a.period - b.period);
  const lumpSumMap = new Map(
    sortedLumpSums.map((ls) => [ls.period, ls.amount])
  );

  const schedule: PaymentScheduleItem[] = [];
  let balance = principal;
  let totalInterestPaid = 0;
  let period = 0;
  const maxPeriods = paymentsPerYear * termYears * 2; // Safety limit

  // Calculate payment schedule period by period
  while (balance > 0.01 && period < maxPeriods) {
    // Apply lump sum if applicable
    if (lumpSumMap.has(period)) {
      balance -= lumpSumMap.get(period)!;
      if (balance < 0) balance = 0;
    }

    if (balance <= 0.01) {
      break;
    }

    // Calculate interest for this period
    const interestPaid = balance * periodicRate;
    totalInterestPaid += interestPaid;

    // Calculate principal payment
    const principalPaid = Math.min(
      totalPaymentPerPeriod - interestPaid,
      balance
    );

    // Update balance
    balance -= principalPaid;

    // Ensure balance doesn't go negative
    if (balance < 0) {
      balance = 0;
    }

    schedule.push({
      period: period + 1,
      balance: Math.max(0, balance),
      principalPaid,
      interestPaid,
      totalPaid: principalPaid + interestPaid,
    });

    period++;

    // If payment is less than interest, loan will never be paid off
    if (totalPaymentPerPeriod <= interestPaid && balance > 0.01) {
      // This shouldn't happen with valid inputs, but handle gracefully
      break;
    }
  }

  // Calculate loan end date
  const startDate = new Date();
  const monthsToAdd = period / paymentsPerYear * 12;
  const loanEndDate = new Date(startDate);
  loanEndDate.setMonth(loanEndDate.getMonth() + monthsToAdd);

  const totalPayments = schedule.reduce(
    (sum, item) => sum + item.totalPaid,
    0
  );

  return {
    periodicPayment: minimumPayment,
    totalPayments,
    totalInterest: totalInterestPaid,
    loanEndDate,
    schedule,
  };
}

/**
 * Calculate equivalent risk-free return rate
 * This shows what return rate you'd need to match the interest saved
 */
export function calculateEquivalentReturn(
  interestSaved: number,
  extraPaymentsTotal: number,
  timeSavedYears: number
): number {
  if (extraPaymentsTotal === 0 || timeSavedYears === 0) {
    return 0;
  }

  // Simple approximation: annual return = interest saved / (extra payments * years)
  // More accurate would be IRR calculation, but this gives a good sense
  const annualReturn = interestSaved / (extraPaymentsTotal * timeSavedYears);
  return annualReturn * 100; // Convert to percentage
}
