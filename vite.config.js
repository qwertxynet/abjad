import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Development only: lets review pages save an image into scripts/art/ (POST /__save?name=file.png).
const devSave = {
  name: 'dev-save',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__save', (req, res) => {
      const name = new URL(req.url, 'http://x').searchParams.get('name') || 'sheet.png';
      if (!/^[\w.-]+\.png$/.test(name)) return res.writeHead(400).end();
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        try {
          fs.writeFileSync(server.config.root + '/scripts/art/' + name, Buffer.from(Buffer.concat(chunks).toString(), 'base64'));
          res.end('saved');
        } catch (e) {
          res.writeHead(500).end(String(e));
        }
      });
    });
  },
};

// base: './' keeps paths relative, so the build works on GitHub Pages under /abjad/.
export default defineConfig({
  plugins: [react(), devSave],
  base: './',
  server: { port: 5185 },
});
