import { createContext, useCallback, useContext, useState } from 'react';
import { API_BASE_URL } from '../api';

const AuthContext = createContext(null);

function loadStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('authUser'));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(loadStoredUser);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  }, []);

  // Wrapper around fetch that attaches the bearer token and treats any 401
  // as "session is no longer valid" — covers both a missing token and one
  // that has expired since the page loaded.
  const authFetch = useCallback(
    async (path, options = {}) => {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        throw new Error('Session expired');
      }

      return res;
    },
    [token, logout],
  );

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
