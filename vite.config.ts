import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  server: {
    port: 3000,
  },
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
});
