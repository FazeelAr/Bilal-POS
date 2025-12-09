import axios from "axios";

const BASE_URL = "http://localhost:8000"; // change if needed

// ----------------------------
// Read & Write tokens
// ----------------------------
const getAccessToken = () => {
  const token = localStorage.getItem("access");
  console.log("🔑 getAccessToken called, token exists:", !!token);
  return token;
};

const getRefreshToken = () => {
  const token = localStorage.getItem("refresh");
  console.log("🔄 getRefreshToken called, token exists:", !!token);
  return token;
};

const setTokens = (access, refresh) => {
  console.log("💾 Setting tokens:", { access: !!access, refresh: !!refresh });
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
};

const clearTokens = () => {
  console.log("🗑️ Clearing tokens");
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login"; 
};

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL + "/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    console.log("📤 Request Interceptor - URL:", config.url);
    console.log("📤 Request Interceptor - Token exists:", !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("📤 Added Authorization header");
    } else {
      console.log("❌ No token found for request");
    }
    
    console.log("📤 Request Headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response Interceptor - Status:", response.status);
    return response;
  },
  async (error) => {
    console.log("❌ Response Interceptor Error:");
    console.log("Status:", error.response?.status);
    console.log("URL:", error.config?.url);
    console.log("Data:", error.response?.data);
    
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔄 Attempting token refresh...");
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.log("❌ No refresh token available");
          throw new Error("No refresh token");
        }
        
        console.log("🔄 Refreshing token...");
        const res = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        console.log("✅ Token refresh successful");
        setTokens(newAccess, refreshToken);

        // Retry with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        console.log("🔄 Retrying original request with new token");
        return api(originalRequest);
      } catch (err) {
        console.log("❌ Token refresh failed", err);
        clearTokens();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ----------------------------
// API Helper Methods
// ----------------------------
export const apiGet = (url) => {
  console.log("📡 apiGet called:", url);
  return api.get(url);
};

export const apiPost = (url, data) => {
  console.log("📡 apiPost called:", url);
  return api.post(url, data);
};

export const apiPut = (url, data) => api.put(url, data);
export const apiPatch = (url, data) => api.patch(url, data);
export const apiDelete = (url) => api.delete(url);

// ----------------------------
// Auth Login
// ----------------------------
export const login = async (username, password) => {
  console.log("🔐 Login attempt for:", username);
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/token/`, {
      username,
      password,
    });
    console.log("✅ Login successful, tokens received");
    setTokens(res.data.access, res.data.refresh);
    return res.data;
  } catch (error) {
    console.error("❌ Login failed:", error);
    throw error;
  }
};

// ----------------------------
// Logout
// ----------------------------
export const logout = () => {
  clearTokens();
};

export default api;