import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080';

console.log("======================================");
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("API_BASE_URL =", API_BASE_URL);
console.log("======================================");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );
    console.log("Request Data:", config.data);

    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    console.error("❌ API ERROR");

    if (error.config) {
      console.error(
        `${error.config.method?.toUpperCase()} ${error.config.baseURL}${error.config.url}`
      );
    }

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    } else {
      console.error(error.message);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;


export const registerUser = (username, password) =>
  api.post("/api/auth/register", {
    username,
    password,
  });

export const loginUser = (username, password) =>
  api.post("/api/auth/login", {
    username,
    password,
  });

export const googleAuth = (idToken) =>
  api.post("/api/auth/google", {
    idToken,
  });


export const searchCatalog = (
  query,
  type = "album",
  limit = 24
) =>
  api.get("/api/search", {
    params: {
      query,
      type,
      limit,
    },
  });


export const getLibrary = () =>
  api.get("/api/library");

export const addToLibrary = (item) =>
  api.post("/api/library", item);

export const updateLibraryItem = (id, updates) =>
  api.put(`/api/library/${id}`, updates);

export const deleteLibraryItem = (id) =>
  api.delete(`/api/library/${id}`);


export const getLibraryStats = () =>
  api.get("/api/library/stats");

export const getLibraryInsights = () =>
  api.get("/api/library/insights");