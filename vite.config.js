import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps paths relative, so the build works on GitHub Pages under /abjad/.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5185 },
});
