import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
    dedupe: [
      "@ckeditor/ckeditor5-react",
      "@ckeditor/ckeditor5-core",
      "@ckeditor/ckeditor5-utils",
    ],
  },
});
