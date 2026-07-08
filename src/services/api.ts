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


// Endpoints onde um 401 significa "credenciais erradas", não "sessão
// expirada" — não fazem sentido disparar logout automático.
const AUTH_ENDPOINTS = ["/login", "/register"];

// Ponte pra fora do axios: como este arquivo não é um componente React, não
// dá pra chamar logout()/navigate() daqui. Disparamos um evento global que um
// componente montado na raiz do app escuta (ver SessionWatcher em router.tsx).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => url.includes(path));

    if (status === 401 && !isAuthEndpoint && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }

    return Promise.reject(error);
  }
);

// Fetcher no formato esperado pelo swr: fetcher(url) => Promise<data>
export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default api;
