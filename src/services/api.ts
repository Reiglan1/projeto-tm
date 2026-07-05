import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API,
});

// Anexa o Bearer token automaticamente em toda requisição, quando existir
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? window.localStorage?.getItem("token")
      : null;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Fetcher no formato esperado pelo swr: fetcher(url) => Promise<data>
export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default api;
