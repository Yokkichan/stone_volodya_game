import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0", // Разрешаем доступ с любых хостов
    cors: {
      origin: "*", // Разрешаем все источники
      methods: ["GET", "POST", "OPTIONS"], // Разрешаем методы
      allowedHeaders: ["Content-Type", "Authorization"], // Разрешаем заголовки
      preflightContinue: false, // Отключаем префлайт-обработку
    },
  },
});