import axios from 'axios';

const getBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (!envUrl) return '/api';
  return envUrl.endsWith('/api') || envUrl.endsWith('/api/') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({ baseURL: getBaseURL() });

api.interceptors.request.use(cfg => {
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
