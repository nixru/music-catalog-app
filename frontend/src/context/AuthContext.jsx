import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, registerUser, googleAuth } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (usernameInput, password) => {
    console.log("========== LOGIN ==========");
    console.log("Username:", usernameInput);

    setLoading(true);
    setError(null);

    try {
      console.log("Calling loginUser()...");

      const { data } = await loginUser(usernameInput, password);

      console.log("Login Success:", data);

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setUsername(data.username);

      return true;
    } catch (err) {
      console.error("Login Error:", err);

      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response:", err.response.data);
      }

      setError(
        err.response?.data?.message ||
        'Login failed. Check your credentials.'
      );

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (usernameInput, password) => {
    console.log("========== REGISTER ==========");
    console.log("Username:", usernameInput);
    console.log("Password Length:", password.length);

    setLoading(true);
    setError(null);

    try {
      console.log("Calling registerUser()...");

      const { data } = await registerUser(usernameInput, password);

      console.log("Registration Success:", data);

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setUsername(data.username);

      return true;
    } catch (err) {
      console.error("Registration Error:", err);

      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response:", err.response.data);
      } else {
        console.error("No response received:", err.message);
      }

      setError(
        err.response?.data?.message ||
        'Registration failed. Try a different username.'
      );

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    console.log("========== GOOGLE LOGIN ==========");

    setLoading(true);
    setError(null);

    try {
      console.log("Calling googleAuth()...");

      const { data } = await googleAuth(idToken);

      console.log("Google Login Success:", data);

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setUsername(data.username);

      return true;
    } catch (err) {
      console.error("Google Login Error:", err);

      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response:", err.response.data);
      }

      setError(
        err.response?.data?.message ||
        'Google sign-in failed. Try again.'
      );

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log("Logging out...");

    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        username,
        isAuthenticated: !!username,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}