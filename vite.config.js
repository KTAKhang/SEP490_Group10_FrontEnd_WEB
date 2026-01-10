import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src", // Đảm bảo rằng `@` trỏ tới thư mục src
    },
  },
  optimizeDeps: {
    exclude: [], // Có thể thêm dependencies gây vấn đề vào đây nếu cần
    force: true, // Force rebuild để fix chunk errors
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    fs: {
      strict: false, // Cho phép truy cập files ngoài project root nếu cần
    },
  },
});
