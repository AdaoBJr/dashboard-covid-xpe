import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  server: {
    port: 3000,
  },
  base: '/',
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
});
