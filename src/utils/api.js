import axios from 'axios';

const getBaseURL = () => {
  let envUrl = process.env.REACT_APP_API_URL || '';
  if (!envUrl) return '/api/';
  envUrl = envUrl.replace(/\/$/, '');
  if (!envUrl.endsWith('/api')) envUrl += '/api';
  return envUrl + '/';
};

const api = axios.create({ baseURL: getBaseURL() });

api.interceptors.request.use(cfg => {
  // Ensure URL doesn't start with / so it joins correctly to baseURL ending in /api/
  if (cfg.url && cfg.url.startsWith('/')) {
    cfg.url = cfg.url.substring(1);
  }
  const token = localStorage.getItem('rl_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rl_token');
      localStorage.removeItem('rl_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
