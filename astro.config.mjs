import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.colleferrocalcio.it',
  vite: {
    plugins: [tailwindcss()],
  },
});
