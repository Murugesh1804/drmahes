const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../website/assets/style.css');
const destPath = path.join(__dirname, '../website/assets/style.min.css');

try {
  console.log('Reading style.css...');
  const css = fs.readFileSync(srcPath, 'utf8');
  const originalSize = Buffer.byteLength(css, 'utf8');

  console.log('Minifying CSS...');
  const minified = css
    .replace(/\/\*[\s\S]*?\*\//g, '')    // Remove comments
    .replace(/\s+/g, ' ')                // Collapse whitespace
    .replace(/\s*([{\}:;,])\s*/g, '$1')  // Remove spaces around brackets, colons, semi-colons and commas
    .replace(/;\}/g, '}')                // Remove redundant semi-colons before closing bracket
    .trim();

  const minifiedSize = Buffer.byteLength(minified, 'utf8');

  fs.writeFileSync(destPath, minified, 'utf8');
  console.log('Successfully wrote style.min.css');
  console.log(`Original Size: ${(originalSize / 1024).toFixed(2)} KB (${originalSize} bytes)`);
  console.log(`Minified Size: ${(minifiedSize / 1024).toFixed(2)} KB (${minifiedSize} bytes)`);
  console.log(`Reduction: ${((1 - minifiedSize / originalSize) * 100).toFixed(2)}%`);
} catch (err) {
  console.error('Error during minification:', err);
  process.exit(1);
}
