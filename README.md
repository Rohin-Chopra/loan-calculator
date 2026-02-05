# 💰 Kill My Loan

A mobile-first loan calculator web app that helps Australians understand the true cost of their loans and see how extra repayments dramatically reduce interest and loan duration.

## Features

- **Loan Input Module**: Enter loan amount, interest rate, term, and repayment frequency (weekly, fortnightly, monthly)
- **Repayment Calculator**: See minimum payment, total interest, and loan end date
- **Extra Repayment Simulator**: Interactive slider to see how extra repayments affect your loan
- **Lump Sum Payments**: Add one-time payments at specific periods
- **Visualization**: Charts showing loan balance over time (baseline vs accelerated)
- **Summary Panel**: See interest saved, time saved, and equivalent risk-free return

## Tech Stack

- **Vite** - Build tool and dev server
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **pnpm** - Package manager

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (install with `npm install -g pnpm`)

### Installation

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── LoanInput.tsx
│   ├── RepaymentResults.tsx
│   ├── ExtraRepaymentSimulator.tsx
│   ├── LumpSumPayments.tsx
│   ├── LoanChart.tsx
│   └── SummaryPanel.tsx
├── utils/               # Calculation utilities
│   └── loanCalculator.ts
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Calculation Logic

The app uses standard amortization formulas:

- **Minimum Payment**: `P * (r) / (1 - (1 + r)^(-n))`
  - Where P = principal, r = periodic rate, n = total payments
- **Extra Repayments**: Applied directly to principal, recalculating remaining term
- **Lump Sums**: Reduce principal at specified periods, recalculating from that point

## Test Scenarios

From the PRD:
- $52k @ 9.5%, 7 years, fortnightly
- Extra $100/fortnight reduces term correctly
- Lump sum applied mid-term recalculates correctly

## License

MIT
