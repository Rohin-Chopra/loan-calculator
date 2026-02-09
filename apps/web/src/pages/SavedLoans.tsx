import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { SavedLoan } from '../types';
import { getSavedLoans, deleteSavedLoan } from '../utils/loanApi';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Spinner } from '../components/ui/spinner';

export default function SavedLoans() {
  const navigate = useNavigate();
  const [savedLoans, setSavedLoans] = useState<SavedLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getSavedLoans()
      .then((loans) => {
        setSavedLoans(loans);
      })
      .catch((error) => {
        console.error('Failed to load saved loans:', error);
        toast.error('Failed to load saved loans');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved loan?')) {
      return;
    }

    setDeletingId(id);
    try {
      const success = await deleteSavedLoan(id);
      if (success) {
        const loans = await getSavedLoans();
        setSavedLoans(loans);
        toast.success('Loan deleted successfully');
      } else {
        toast.error('Failed to delete loan');
      }
    } catch (error) {
      console.error('Failed to delete loan:', error);
      toast.error('Failed to delete loan');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoad = (loan: SavedLoan) => {
    // Navigate to the loan's dedicated URL (bookmarkable)
    navigate(`/loan/${loan.id}`);
  };

  const handleCopyLink = async (loanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/loan/${loanId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(loanId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
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
    <MainLayout headerTitle="💰 Kill My Loan" headerSubtitle="Your saved loan calculations">
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <Card className="shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <CardContent className="p-16 text-center">
              <div className="flex flex-col items-center justify-center">
                <Spinner className="mb-4 h-8 w-8 text-blue-600 dark:text-blue-400" />
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Loading your saved loans...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {savedLoans.length > 0 && (
              <div className="mb-6 flex justify-end">
                <Button
                  asChild
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 h-11 px-6"
                >
                  <Link to="/">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Loan
                  </Link>
                </Button>
              </div>
            )}
            {savedLoans.length === 0 ? (
          <Card className="shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                No saved loans yet
              </p>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                Save your loan calculations to access them later
              </p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 h-11 px-8">
                <Link to="/">
                  Go to Calculator
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {savedLoans.map((loan) => (
              <Card key={loan.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-700 shadow-lg cursor-pointer" onClick={() => handleLoad(loan)}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {loan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Principal</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(loan.loanInput.principal)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Rate</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {(loan.loanInput.annualRate * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Term</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {loan.loanInput.termYears} years
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Frequency</p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400 capitalize">
                        {loan.loanInput.frequency}
                      </p>
                    </div>
                  </div>
                  {(loan.extraPaymentPerPeriod > 0 || loan.lumpSums.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap gap-4 text-sm">
                        {loan.extraPaymentPerPeriod > 0 && (
                          <div className="px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                            <span className="text-muted-foreground font-medium">Extra per period:</span>
                            <span className="ml-2 font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(loan.extraPaymentPerPeriod)}
                            </span>
                          </div>
                        )}
                        {loan.lumpSums.length > 0 && (
                          <div className="px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                            <span className="text-muted-foreground font-medium">Lump sums:</span>
                            <span className="ml-2 font-bold text-purple-600 dark:text-purple-400">
                              {loan.lumpSums.length} payment{loan.lumpSums.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 text-xs text-muted-foreground font-medium">
                    Saved {formatDate(loan.createdAt)}
                    {loan.updatedAt !== loan.createdAt && (
                      <span> • Updated {formatDate(loan.updatedAt)}</span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => handleLoad(loan)}
                      className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      View Loan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => handleCopyLink(loan.id, e)}
                      size="icon"
                      aria-label="Copy loan link"
                      className="h-11 w-11"
                      title="Copy link to bookmark"
                    >
                      {copiedId === loan.id ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(loan.id)}
                      disabled={deletingId === loan.id}
                      size="icon"
                      aria-label="Delete loan"
                      className="h-11 w-11"
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
          </>
        )}
      </div>
    </MainLayout>
  );
}
