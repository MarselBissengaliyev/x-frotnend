// axiosConfig.ts

import axios from "axios";

// Настроим базовый URL для всех запросов
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Замените на URL вашего API
  headers: {
    "Content-Type": "application/json",
    // Можете добавить другие заголовки, если необходимо
  },
});

export default axiosInstance;
