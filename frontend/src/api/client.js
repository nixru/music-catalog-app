import axios from 'axios';

// Points at the local Spring Boot backend. Override with VITE_API_URL in
// a .env file when deploying (e.g. VITE_API_URL=https://your-api.onrender.com).
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request if we have one stored.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever returns 401 (expired/invalid token), boot the user
// back to login instead of leaving them stuck on a broken page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ---- Auth ----
export const registerUser = (username, password) =>
  api.post('/api/auth/register', { username, password });

export const loginUser = (username, password) =>
  api.post('/api/auth/login', { username, password });

export const googleAuth = (idToken) =>
  api.post('/api/auth/google', { idToken });

// ---- Search (public) ----
export const searchCatalog = (query, type = 'album', limit = 24) =>
  api.get('/api/search', { params: { query, type, limit } });

// ---- Library (protected) ----
export const getLibrary = () => api.get('/api/library');

export const addToLibrary = (item) => api.post('/api/library', item);

export const updateLibraryItem = (id, updates) => api.put(`/api/library/${id}`, updates);

export const deleteLibraryItem = (id) => api.delete(`/api/library/${id}`);

// ---- Analytics & AI Insights (protected) ----
export const getLibraryStats = () => api.get('/api/library/stats');

export const getLibraryInsights = () => api.get('/api/library/insights');
