const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public');

const entries = ['index.html', 'styles.css', 'script.js', 'assets'];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of entries) {
  const from = path.join(root, entry);
  const to = path.join(outDir, entry);

  fs.cpSync(from, to, { recursive: true });
}

console.log(`Built static site into ${path.relative(root, outDir)}`);
