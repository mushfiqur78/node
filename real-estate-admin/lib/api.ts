import axios from 'axios';

const DEFAULT_API_URL = 'https://node-flax-eight.vercel.app/api/v1';

const getApiBaseUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configuredUrl) return configuredUrl;

  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    return 'http://localhost:5001/api/v1';
  }

  return DEFAULT_API_URL;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // required for referral cookie (httpOnly) to be sent
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
