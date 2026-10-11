const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  // Extract inline script contents
  const scriptRegex = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptIndex = 0;
  while ((match = scriptRegex.exec(content)) !== null) {
    scriptIndex++;
    const code = match[1].trim();
    if (!code) continue;
    // Skip json-ld or ld+json scripts
    if (code.startsWith('{') && code.endsWith('}')) continue;
    try {
      new vm.Script(code);
      console.log(`[VALID INLINE JS] ${file} (script #${scriptIndex})`);
    } catch (e) {
      console.error(`[SYNTAX ERROR IN HTML] ${file} (script #${scriptIndex}):`, e.message);
    }
  }
}
