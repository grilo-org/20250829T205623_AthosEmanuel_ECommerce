import axios from "axios";

const API = "http://localhost:4000";

// Cria uma instância do Axios configurada com a baseURL da API
const api = axios.create({
  baseURL: API,
});

// Intercepta todas as requisições para adicionar o token JWT no header Authorization
api.interceptors.request.use(
  (config) => {
    if (!config.headers) {
      config.headers = {};
    }
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },

  (error) => Promise.reject(error)
);

export default api;
