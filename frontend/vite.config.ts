import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 20104,
    host: "0.0.0.0",
    // 本地开发时将 /api 代理到后端（容器内由 nginx 反代，见 frontend/nginx.conf）
    proxy: { "/api": { target: process.env.BACKEND_URL ?? "http://localhost:3000", changeOrigin: true } }
  }
});
