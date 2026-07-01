const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../messages');
const defaultLocaleFile = path.join(localesDir, 'fr.json');

const defaultMessages = JSON.parse(fs.readFileSync(defaultLocaleFile, 'utf8'));

const files = fs.readdirSync(localesDir);

function getFlattenedKeys(obj, prefix = '') {
  let keys = {};
  for (const key in obj) {
    const value = obj[key];
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(keys, getFlattenedKeys(value, newPrefix));
    } else {
      keys[newPrefix] = value;
    }
  }
  return keys;
}

const defaultKeys = getFlattenedKeys(defaultMessages);

let hasErrors = false;

files.forEach(file => {
  if (file === 'fr.json') return;
  const filePath = path.join(localesDir, file);
  const locale = file.replace('.json', '');
  try {
    const messages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const flatKeys = getFlattenedKeys(messages);
    
    const missing = [];
    Object.keys(defaultKeys).forEach(key => {
      if (flatKeys[key] === undefined) {
        missing.push(key);
      }
    });

    if (missing.length > 0) {
      console.log(`\n❌ Locale [${locale}] is missing ${missing.length} keys:`);
      missing.forEach(key => console.log(`  - ${key}`));
      hasErrors = true;
    } else {
      console.log(`\n✅ Locale [${locale}] is perfectly synchronized!`);
    }
  } catch (err) {
    console.error(`Error parsing ${file}:`, err);
    hasErrors = true;
  }
});

if (hasErrors) {
  process.exit(1);
} else {
  console.log('\n🎉 All translation files are complete and synchronized!');
  process.exit(0);
}
