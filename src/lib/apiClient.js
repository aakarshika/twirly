import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const payload = err?.response?.data?.error;
    if (payload?.message) {
      err.message = payload.message;
      err.code = payload.code;
    }
    return Promise.reject(err);
  }
);
