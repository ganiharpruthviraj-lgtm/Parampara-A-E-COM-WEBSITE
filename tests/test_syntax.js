const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

function checkDir(dirName) {
  const dir = path.join(rootDir, dirName);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git') checkDir(path.join(dirName, f));
    } else if (f.endsWith('.js')) {
      try {
        execSync(`node -c "${full}"`, { stdio: 'pipe' });
        console.log('[OK]', path.relative(rootDir, full));
      } catch (e) {
        console.error('[SYNTAX ERROR]', path.relative(rootDir, full), e.message);
      }
    }
  }
}

checkDir('js');
checkDir('backend');
