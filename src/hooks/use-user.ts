import { useState, useEffect, useCallback } from 'react';
import type { CTFUser } from '@shared/types';
export function useUser() {
  const [user, setUser] = useState<CTFUser | null>(() => {
    try {
      const stored = localStorage.getItem('ctf_user');
      return stored ? (JSON.parse(stored) as CTFUser) : null;
    } catch {
      return null;
    }
  });
  const login = useCallback((userData: CTFUser) => {
    localStorage.setItem('ctf_user', JSON.stringify(userData));
    setUser(userData);
    // Dispatch custom event for cross-component sync in same tab
    window.dispatchEvent(new Event('user-session-changed'));
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem('ctf_user');
    setUser(null);
    window.dispatchEvent(new Event('user-session-changed'));
  }, []);
  const updateUser = useCallback((userData: CTFUser) => {
    localStorage.setItem('ctf_user', JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event('user-session-changed'));
  }, []);
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | Event) => {
      if (e instanceof StorageEvent && e.key !== 'ctf_user' && e.key !== null) return;
      try {
        const stored = localStorage.getItem('ctf_user');
        const parsed = stored ? (JSON.parse(stored) as CTFUser) : null;
        setUser(parsed);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-session-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-session-changed', handleStorageChange);
    };
  }, []);
  return {
    user,
    isAdmin: user?.isAdmin ?? false,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser
  };
}