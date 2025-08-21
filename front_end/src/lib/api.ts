import axios from "axios";

const baseURL =
  (import.meta as any).env?.VITE_API_URL ||
  (typeof process !== "undefined" ? (process as any).env?.VITE_API_URL : undefined) ||
  "http://localhost:8000";

export const api = axios.create({ baseURL });

// If JWT is re-enabled later, uncomment below
// api.interceptors.request.use((cfg) => {
//   const token = localStorage.getItem("token");
//   if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
//   return cfg;
// });

export default api;


