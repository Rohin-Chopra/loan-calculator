import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { SavedLoan } from '../types';
import { getSavedLoans, deleteSavedLoan } from '../utils/loanStorage';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function SavedLoans() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [savedLoans, setSavedLoans] = useState<SavedLoan[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setSavedLoans(getSavedLoans());
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved loan?')) {
      return;
    }

    setDeletingId(id);
    if (deleteSavedLoan(id)) {
      setSavedLoans(getSavedLoans());
    }
    setDeletingId(null);
  };

  const handleLoad = (loan: SavedLoan) => {
    // Store loan data in sessionStorage to load in App
    sessionStorage.setItem('loadLoan', JSON.stringify(loan));
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                💰 Kill My Loan
              </h1>
              <p className="text-blue-100 dark:text-blue-200 text-sm md:text-base">
                Your saved loan calculations
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Back to calculator"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {savedLoans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg mb-4">
                No saved loans yet
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Save your loan calculations to access them later
              </p>
              <Button asChild>
                <Link to="/">
                  Go to Calculator
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedLoans.map((loan) => (
              <Card key={loan.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle>{loan.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Principal:</span>
                      <p className="font-semibold">
                        {formatCurrency(loan.loanInput.principal)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate:</span>
                      <p className="font-semibold">
                        {(loan.loanInput.annualRate * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Term:</span>
                      <p className="font-semibold">
                        {loan.loanInput.termYears} years
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <p className="font-semibold capitalize">
                        {loan.loanInput.frequency}
                      </p>
                    </div>
                  </div>
                  {(loan.extraPaymentPerPeriod > 0 || loan.lumpSums.length > 0) && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-4 text-sm">
                        {loan.extraPaymentPerPeriod > 0 && (
                          <div>
                            <span className="text-muted-foreground">Extra per period:</span>
                            <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(loan.extraPaymentPerPeriod)}
                            </span>
                          </div>
                        )}
                        {loan.lumpSums.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Lump sums:</span>
                            <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                              {loan.lumpSums.length} payment{loan.lumpSums.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 text-xs text-muted-foreground">
                    Saved {formatDate(loan.createdAt)}
                    {loan.updatedAt !== loan.createdAt && (
                      <span> • Updated {formatDate(loan.updatedAt)}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleLoad(loan)}
                      className="flex-1"
                    >
                      Load Loan
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(loan.id)}
                      disabled={deletingId === loan.id}
                      size="icon"
                      aria-label="Delete loan"
                    >
                      {deletingId === loan.id ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-gray-300 dark:text-gray-400 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>
            Made with ❤️ for Australians looking to kill their loans faster
          </p>
        </div>
      </footer>
    </div>
  );
}
