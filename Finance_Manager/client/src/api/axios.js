import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cendric_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 → clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cendric_token');
      localStorage.removeItem('cendric_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
