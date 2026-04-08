const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const redirectsSrc = path.join(projectRoot, 'netlify', '_redirects');
const redirectsDest = path.join(distDir, '_redirects');
const headersSrc = path.join(projectRoot, 'netlify', '_headers');
const headersDest = path.join(distDir, '_headers');

if (!fs.existsSync(distDir)) {
  process.exit(0);
}

if (fs.existsSync(redirectsSrc)) {
  fs.copyFileSync(redirectsSrc, redirectsDest);
}

if (fs.existsSync(headersSrc)) {
  fs.copyFileSync(headersSrc, headersDest);
}
