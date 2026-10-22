const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

console.log('--- AUDITING ' + htmlFiles.length + ' HTML FILES ---');

const missingImgs = [];
const deadLinks = [];
const missingMeta = [];
const missingCss = [];
const missingJs = [];

for (const file of htmlFiles) {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check meta viewport & charset
  if (!content.includes('viewport')) missingMeta.push({ file, issue: 'missing viewport meta' });
  if (!content.includes('charset')) missingMeta.push({ file, issue: 'missing charset meta' });

  // Check <img src="...">
  const imgRegex = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    if (!src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('//') && !src.includes('${')) {
      const clean = path.join(rootDir, src.split('?')[0].replace(/^\//, ''));
      if (!fs.existsSync(clean)) {
        missingImgs.push({ file, src });
      }
    }
  }

  // Check <a href="...">
  const aRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  while ((match = aRegex.exec(content)) !== null) {
    const href = match[1];
    if (!href.startsWith('http') && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('tel:') && !href.startsWith('mailto:') && !href.includes('${')) {
      const cleanPath = href.split('?')[0].split('#')[0].replace(/^\//, '');
      if (cleanPath) {
        const full = path.join(rootDir, cleanPath);
        if (!fs.existsSync(full)) {
          deadLinks.push({ file, href, cleanPath });
        }
      }
    }
  }
}

// Check CSS files for broken url(...)
const cssDir = path.join(rootDir, 'css');
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
const brokenCssUrls = [];

for (const cssFile of cssFiles) {
  const cssPath = path.join(cssDir, cssFile);
  const content = fs.readFileSync(cssPath, 'utf-8');
  const urlRegex = /url\(["']?([^"')]+)["']?\)/gi;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const assetUrl = match[1];
    if (!assetUrl.startsWith('http') && !assetUrl.startsWith('data:') && !assetUrl.startsWith('//')) {
      // Relative to css/ or root
      const relToCss = path.resolve(cssDir, assetUrl.split('?')[0]);
      const relToRoot = path.resolve(rootDir, assetUrl.split('?')[0].replace(/^\//, ''));
      if (!fs.existsSync(relToCss) && !fs.existsSync(relToRoot)) {
        brokenCssUrls.push({ cssFile, assetUrl });
      }
    }
  }
}

// Audit JS files for fetch calls to non-existent API routes
const jsDir = path.join(rootDir, 'js');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
const fetchCalls = [];

for (const jsFile of jsFiles) {
  const jsPath = path.join(jsDir, jsFile);
  const content = fs.readFileSync(jsPath, 'utf-8');
  const fetchRegex = /fetch\(["'`]([^"'`]+)["'`]/gi;
  let match;
  while ((match = fetchRegex.exec(content)) !== null) {
    fetchCalls.push({ jsFile, url: match[1] });
  }
}

console.log('\n=== RESULTS ===');
console.log('Missing Images (' + missingImgs.length + '):', missingImgs);
console.log('\nDead Links (' + deadLinks.length + '):', deadLinks);
console.log('\nMissing Meta (' + missingMeta.length + '):', missingMeta);
console.log('\nBroken CSS URLs (' + brokenCssUrls.length + '):', brokenCssUrls);
console.log('\nFound JS Fetch Calls:', fetchCalls.length);
