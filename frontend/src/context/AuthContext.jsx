import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, registerUser, googleAuth } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (usernameInput, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginUser(usernameInput, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setUsername(data.username);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (usernameInput, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await registerUser(usernameInput, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setUsername(data.username);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different username.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await googleAuth(idToken);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setUsername(data.username);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{ username, isAuthenticated: !!username, loading, error, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
