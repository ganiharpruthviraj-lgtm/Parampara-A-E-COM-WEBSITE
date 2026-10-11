const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git') checkDir(full);
    } else if (f.endsWith('.js')) {
      try {
        execSync(`node -c "${full}"`, { stdio: 'pipe' });
        console.log('[OK]', full);
      } catch (e) {
        console.error('[SYNTAX ERROR]', full, e.message);
      }
    }
  }
}

checkDir('js');
checkDir('backend');
