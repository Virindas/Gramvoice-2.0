const fs = require('fs');
const path = require('path');

function getTsxFiles(dir) {
  let list = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (item !== 'node_modules' && item !== 'dist' && item !== '.git' && item !== '.expo') {
        list = list.concat(getTsxFiles(full));
      }
    } else if (item.endsWith('.tsx')) {
      list.push(full);
    }
  }
  return list;
}

function auditFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const hardcoded = [];

  lines.forEach((line, idx) => {
    // Check for raw text between tags: >Text<
    const tagRegex = />([^<>{}\n]+)</g;
    let m;
    while ((m = tagRegex.exec(line)) !== null) {
      const text = m[1].trim();
      // Ignore punctuation, numbers, single letters
      if (text.length > 2 && !/^[0-9#·:—\s.,+()/\-]+$/.test(text) && !text.startsWith('&')) {
        // Also ignore if it's already translated or simple code
        if (!text.includes('t(') && !text.includes('JSON')) {
          hardcoded.push({ line: idx + 1, type: 'tag', text });
        }
      }
    }

    // Check for hardcoded string props: title="...", label="...", subtitle="...", placeholder="..."
    const propRegex = /\b(title|label|subtitle|placeholder|description|hint)\s*=\s*"([^"]+)"/g;
    while ((m = propRegex.exec(line)) !== null) {
      const prop = m[1];
      const val = m[2].trim();
      if (val.length > 2 && !/^[0-9#·:—\s.,+()/\-]+$/.test(val)) {
        hardcoded.push({ line: idx + 1, type: 'prop', prop, text: val });
      }
    }
  });

  return hardcoded;
}

console.log('Scanning Web Screens...');
const webScreens = fs.readdirSync('web/src/pages').map(f => path.join('web/src/pages', f)).filter(f => f.endsWith('.tsx'));
for (const s of webScreens) {
  const res = auditFile(s);
  if (res.length > 0) {
    console.log(`[WEB] ${path.basename(s)}: ${res.length} hardcoded strings`);
    res.slice(0, 4).forEach(r => console.log(`   L${r.line} (${r.type}): "${r.text}"`));
  }
}

console.log('\nScanning Mobile Screens...');
const mobileScreens = getTsxFiles('mobile/app');
for (const s of mobileScreens) {
  const rel = path.relative('mobile/app', s);
  const res = auditFile(s);
  if (res.length > 0) {
    console.log(`[MOBILE] ${rel}: ${res.length} hardcoded strings`);
    res.slice(0, 4).forEach(r => console.log(`   L${r.line} (${r.type}): "${r.text}"`));
  }
}
