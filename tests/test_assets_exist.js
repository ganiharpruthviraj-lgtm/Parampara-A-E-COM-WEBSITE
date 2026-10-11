const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

let issues = [];

for (const file of htmlFiles) {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check script src
  const scriptSrcRegex = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = scriptSrcRegex.exec(content)) !== null) {
    const src = match[1];
    if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//')) {
      const cleanPath = path.join(rootDir, src.split('?')[0].replace(/^\//, ''));
      if (!fs.existsSync(cleanPath)) {
        issues.push(`[MISSING SCRIPT] In ${file}: src="${src}" not found on disk (${cleanPath})`);
      }
    }
  }

  // Check link href (stylesheets, icons)
  const linkHrefRegex = /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  while ((match = linkHrefRegex.exec(content)) !== null) {
    const href = match[1];
    if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//') && !href.startsWith('data:')) {
      const cleanPath = path.join(rootDir, href.split('?')[0].replace(/^\//, ''));
      if (!fs.existsSync(cleanPath)) {
        issues.push(`[MISSING ASSET] In ${file}: href="${href}" not found on disk (${cleanPath})`);
      }
    }
  }
}

if (issues.length === 0) {
  console.log('✅ All local scripts and stylesheets in all HTML files exist!');
} else {
  issues.forEach(i => console.warn(i));
}
