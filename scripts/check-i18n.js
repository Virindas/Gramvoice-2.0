const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to recursively find files
function getFiles(dir, exts = ['.ts', '.tsx']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git' && file !== '.expo') {
        results = results.concat(getFiles(filePath, exts));
      }
    } else {
      if (exts.some((ext) => filePath.endsWith(ext))) {
        results.push(filePath);
      }
    }
  }
  return results;
}

// Extract keys from translation file
function extractDictionaryKeys(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Dictionary file not found: ${filePath}`);
    return new Set();
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();
  // Match "key": or 'key': or key:
  const regex = /(?:["']([^"']+)["']|([a-zA-Z0-9_]+))\s*:/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1] || match[2];
    if (key && !['export', 'const', 'type'].includes(key)) {
      keys.add(key);
    }
  }
  return keys;
}

// Extract t("key") calls from source files
function extractUsedKeys(files) {
  const used = new Map(); // key -> list of { file, line }
  const regex = /\bt\(\s*["']([^"']+)["']/g;

  for (const file of files) {
    // Ignore translation files themselves
    if (file.includes('i18n') || file.includes('translations')) continue;
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        const key = match[1];
        if (!used.has(key)) {
          used.set(key, []);
        }
        used.get(key).push({ file: path.relative(ROOT_DIR, file), line: idx + 1 });
      }
    });
  }

  return used;
}

function auditApp(appName, srcDir, transDir) {
  console.log(`\n========================================`);
  console.log(`Auditing i18n for: ${appName}`);
  console.log(`Source: ${srcDir}`);
  console.log(`Translations: ${transDir}`);
  console.log(`========================================`);

  const files = getFiles(srcDir);
  const usedKeys = extractUsedKeys(files);

  const locales = ['en', 'hi', 'ta'];
  const dicts = {};
  for (const loc of locales) {
    const dictPath = path.join(transDir, `${loc}.ts`);
    dicts[loc] = extractDictionaryKeys(dictPath);
    console.log(`Loaded ${loc}.ts: ${dicts[loc].size} keys`);
  }

  let hasError = false;
  let totalMissing = 0;

  for (const [key, occurrences] of usedKeys.entries()) {
    for (const loc of locales) {
      if (!dicts[loc].has(key)) {
        hasError = true;
        totalMissing++;
        console.error(`❌ [${appName}] Missing key in ${loc}.ts: "${key}"`);
        occurrences.forEach((occ) => {
          console.error(`   at ${occ.file}:${occ.line}`);
        });
      }
    }
  }

  if (hasError) {
    console.error(`\nFAILED: Found ${totalMissing} missing key instances in ${appName}.`);
  } else {
    console.log(`\n✅ PASSED: All ${usedKeys.size} translation keys in ${appName} exist in en, hi, and ta!`);
  }

  return !hasError;
}

function main() {
  const webOk = auditApp(
    'Web App',
    path.join(ROOT_DIR, 'web', 'src'),
    path.join(ROOT_DIR, 'web', 'src', 'i18n', 'translations')
  );

  const mobileOk = auditApp(
    'Mobile App',
    path.join(ROOT_DIR, 'mobile'),
    path.join(ROOT_DIR, 'mobile', 'i18n', 'translations')
  );

  if (!webOk || !mobileOk) {
    console.error('\n❌ i18n Audit Failed. Please fix the missing keys above.\n');
    process.exit(1);
  } else {
    console.log('\n🎉 100% i18n key resolution verified across both Web and Mobile!\n');
    process.exit(0);
  }
}

main();
