import axios from "axios";

const BASE_URL = "http://localhost:8000"; // change if needed

// ----------------------------
// Read & Write tokens
// ----------------------------
const getAccessToken = () => localStorage.getItem("access");
const getRefreshToken = () => localStorage.getItem("refresh");

const setTokens = (access, refresh) => {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
};

const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login"; 
};



const api = axios.create({
  baseURL: BASE_URL + "/api/",
});


api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        const res = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        setTokens(newAccess, refreshToken);

        // Retry with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        console.log("Token refresh failed", err);
        clearTokens();
      }
    }

    return Promise.reject(error);
  }
);

// ----------------------------
// API Helper Methods
// ----------------------------
export const apiGet = (url) => api.get(url);
export const apiPost = (url, data) => api.post(url, data);
export const apiPut = (url, data) => api.put(url, data);
export const apiPatch = (url, data) => api.patch(url, data);
export const apiDelete = (url) => api.delete(url);

// ----------------------------
// Auth Login
// ----------------------------
export const login = async (username, password) => {
  const res = await axios.post(`${BASE_URL}/api/auth/token/`, {
    username,
    password,
  });
  setTokens(res.data.access, res.data.refresh);
  return res.data;
};

// ----------------------------
// Logout
// ----------------------------
export const logout = () => {
  clearTokens();
};

export default api;
