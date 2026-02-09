import { useState, useEffect } from 'react';
import { fetchAuthSession, signOut, getCurrentUser } from 'aws-amplify/auth';
import type { AuthUser } from 'aws-amplify/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    
    // Listen for auth state changes
    const interval = setInterval(() => {
      checkAuth();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const session = await fetchAuthSession();
      if (session.tokens?.idToken) {
        setToken(session.tokens.idToken.toString());
      }
    } catch (error) {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ global: true });
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    signOut: handleSignOut,
    refreshAuth: checkAuth,
  };
}
