import axios from 'axios';

// Services use absolute paths like /api/users/me — baseURL must be origin-only (no /api suffix)
const baseURL = import.meta.env.VITE_API_URL || '';

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

export default apiClient;
