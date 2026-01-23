import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src", // Đảm bảo rằng `@` trỏ tới thư mục src
    },
    dedupe: ['@ckeditor/ckeditor5-react', '@ckeditor/ckeditor5-build-classic'],
    conditions: ['import', 'module', 'browser', 'default'],
  },
  optimizeDeps: {
    include: [
      '@ckeditor/ckeditor5-react',
      '@ckeditor/ckeditor5-build-classic'
    ],
    exclude: [], // Có thể thêm dependencies gây vấn đề vào đây nếu cần
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'top-level-await': true
      },
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    fs: {
      strict: false, // Cho phép truy cập files ngoài project root nếu cần
    },
  },
  // Fix cho CKEditor 5
  ssr: {
    noExternal: ['@ckeditor/ckeditor5-build-classic']
  }
});
