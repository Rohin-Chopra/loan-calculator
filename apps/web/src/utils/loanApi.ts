import { fetchAuthSession } from 'aws-amplify/auth';
import type { SavedLoan, LoanInput, LumpSumPayment } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not set. API calls will fail.');
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get the auth token
  let authToken: string | undefined;
  try {
    const session = await fetchAuthSession();
    authToken = session.tokens?.idToken?.toString();
  } catch (error) {
    console.warn('Failed to get auth token:', error);
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function saveLoan(
  loanInput: LoanInput,
  extraPaymentPerPeriod: number,
  lumpSums: LumpSumPayment[],
  name?: string
): Promise<SavedLoan> {
  return apiRequest<SavedLoan>('/loans', {
    method: 'POST',
    body: JSON.stringify({
      loanInput,
      extraPaymentPerPeriod,
      lumpSums,
      name,
    }),
  });
}

export async function getSavedLoans(): Promise<SavedLoan[]> {
  return apiRequest<SavedLoan[]>('/loans');
}

export async function getSavedLoan(id: string): Promise<SavedLoan | null> {
  try {
    return await apiRequest<SavedLoan>(`/loans/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function deleteSavedLoan(id: string): Promise<boolean> {
  try {
    await apiRequest(`/loans/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Failed to delete loan:', error);
    return false;
  }
}

export async function updateSavedLoan(
  id: string,
  updates: Partial<Pick<SavedLoan, 'name' | 'loanInput' | 'extraPaymentPerPeriod' | 'lumpSums'>>
): Promise<SavedLoan | null> {
  try {
    return await apiRequest<SavedLoan>(`/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('Failed to update loan:', error);
    return null;
  }
}
