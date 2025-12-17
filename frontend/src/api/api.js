import axios from "axios";

const BASE_URL = "";

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
  baseURL: "/api/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
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
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");
        
        const res = await axios.post("/api/auth/token/refresh/", {
          refresh: refreshToken,
        });
        
        setTokens(res.data.access, refreshToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (err) {
        clearTokens();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const apiGet = (url) => api.get(url);
export const apiPost = (url, data) => api.post(url, data);
export const apiPut = (url, data) => api.put(url, data);
export const apiPatch = (url, data) => api.patch(url, data);
export const apiDelete = (url) => api.delete(url);

export const login = async (username, password) => {
  const res = await api.post(`auth/token/`, {
    username,
    password,
  });
  setTokens(res.data.access, res.data.refresh);
  return res.data;
};

export const logout = clearTokens;

export const getReceiptByOrderId = (orderId) => apiGet(`sales/receipts/by-order/${orderId}/`);
export const getReceipt = (receiptId) => apiGet(`sales/receipts/${receiptId}/`);
export const reprintReceipt = (receiptId) => apiPost(`sales/receipts/${receiptId}/reprint/`, {});
export const getReceiptsByCustomer = (customerId, startDate, endDate) => {
  let url = `sales/receipts/?customer=${customerId}`;
  if (startDate && endDate) {
    url += `&start_date=${startDate}&end_date=${endDate}`;
  }
  return apiGet(url);
};

export const checkAuthStatus = async () => {
  try {
    const token = getAccessToken();
    if (!token) return { isAuthenticated: false, message: "No token found" };
    const response = await apiGet("auth/verify/");
    return { isAuthenticated: true, message: "Authenticated", user: response.data };
  } catch (error) {
    return { isAuthenticated: false, message: error.response?.data?.detail || "Authentication failed" };
  }
};

export const getApiBaseUrl = () => BASE_URL;
export default api;