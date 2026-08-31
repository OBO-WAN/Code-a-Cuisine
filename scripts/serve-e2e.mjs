import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const port = Number(process.env.PORT ?? 4300);
const distRoot = resolve('dist');

function findIndex(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isFile() && entry.name === 'index.html') return fullPath;
    if (entry.isDirectory()) {
      const nested = findIndex(fullPath);
      if (nested) return nested;
    }
  }
  return null;
}

if (!existsSync(distRoot)) {
  throw new Error('dist/ does not exist. Run the Angular build before starting the E2E server.');
}

const indexPath = findIndex(distRoot);
if (!indexPath) {
  throw new Error('Could not find the built Angular index.html under dist/.');
}

const browserRoot = resolve(indexPath, '..');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendFile(response, filePath) {
  response.statusCode = 200;
  response.setHeader('Content-Type', mimeTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream');
  response.setHeader('Cache-Control', 'no-store');
  createReadStream(filePath).pipe(response);
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = normalize(decodedPath).replace(/^[/\\]+/, '');
  const candidate = resolve(browserRoot, relativePath);

  // Never allow a request to escape the build directory.
  const insideRoot = candidate === browserRoot || candidate.startsWith(`${browserRoot}/`);
  if (insideRoot && existsSync(candidate) && statSync(candidate).isFile()) {
    sendFile(response, candidate);
    return;
  }

  // Angular client-side routes (for example /cookbook) fall back to index.html.
  sendFile(response, indexPath);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`E2E production server listening at http://127.0.0.1:${port}`);
});
