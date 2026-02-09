import { useState, useEffect } from 'react';
import { fetchAuthSession, signOut, getCurrentUser } from 'aws-amplify/auth';
import type { AuthUser } from 'aws-amplify/auth';

// Helper to decode JWT and extract user info
function decodeJWT(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

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
        const idToken = session.tokens.idToken.toString();
        setToken(idToken);
        
        // Decode JWT to get user's name
        const claims = decodeJWT(idToken);
        if (claims) {
          // Prefer name, then given_name, then email
          const name = claims.name || claims.given_name || claims.email?.split('@')[0] || null;
          setUserName(name || null);
        }
      }
    } catch (error) {
      setUser(null);
      setToken(null);
      setUserName(null);
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
    userName,
    isLoading,
    isAuthenticated: !!user,
    signOut: handleSignOut,
    refreshAuth: checkAuth,
  };
}
