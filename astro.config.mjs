import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://limone-eth.github.io',
  base: '/website-colleferro/',
  vite: {
    plugins: [tailwindcss()],
  },
});
