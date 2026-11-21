// Renders Open Peeps (CC0) characters to static SVG strings in the journal palette.
// Usage: import { peep } from './peeps.mjs'; peep({ head, face, body, ... })
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(HERE, '..', '..', 'node_modules', '@opeepsfun', 'open-peeps', 'build');
globalThis.require = createRequire(path.join(root, 'Effigy.js')); // Effigy loads its parts with require()
const React = (await import('react')).default;
const { renderToStaticMarkup } = await import('react-dom/server');
const { Effigy } = await import(pathToFileURL(path.join(root, 'Effigy.js')).href);
export const INK = '#2A2118';
export function peep({ head, face, body, beard, accessory }) {
  const el = React.createElement(Effigy, { body, head, face, beard, accessory });
  return renderToStaticMarkup(el).replace(/width="[^"]*px" height="[^"]*px"/, '');
}
