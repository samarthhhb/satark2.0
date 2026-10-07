import axios from 'axios';

// Determine default API base URL
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In local browser dev (localhost:5173), point directly to FastAPI backend on port 8000
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port !== '8000') {
      return `http://${hostname}:8000`;
    }
  }
  return '';
};

// Base API instance
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach user name and token if present
api.interceptors.request.use((config) => {
  const userName = localStorage.getItem('satark_user_name') || 'Analyst';
  config.headers['X-User-Name'] = userName;

  const token = localStorage.getItem('satark_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const predictionAPI = {
  getStates: async () => {
    const res = await api.get('/api/states');
    return res.data;
  },
  getDistricts: async (state) => {
    const res = await api.get('/api/districts', { params: { state } });
    return res.data;
  },
  getYears: async (state, district) => {
    const res = await api.get('/api/years', { params: { state, district } });
    return res.data;
  },
  predict: async (state, district, year) => {
    const res = await api.post('/api/predict', { state, district, year: parseInt(year) });
    return res.data;
  },
  getPredictions: async () => {
    const res = await api.get('/api/predictions');
    return res.data;
  },
  deletePrediction: async (id) => {
    const res = await api.delete(`/api/predictions/${id}`);
    return res.data;
  },
};

export const dashboardAPI = {
  getStats: async () => {
    const res = await api.get('/api/dashboard');
    return res.data;
  },
};

export const assistantAPI = {
  sendMessage: async (messages, context = null) => {
    const res = await api.post('/api/assistant/chat', { messages, context });
    return res.data;
  },
};

export default api;
