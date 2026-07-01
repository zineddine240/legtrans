const fs = require('fs');
const path = require('path');

const foldersToMove = [
  '(marketing)',
  'account',
  'admin',
  'auth',
  'dashboard',
  'document-translation',
  'legal',
  'ocr',
  'payment',
  'translate',
  'workspace',
  'layout.tsx'
];

const sourceDir = path.join(__dirname, 'app');
const targetDir = path.join(__dirname, 'app', '[locale]');

foldersToMove.forEach(folder => {
  const sourcePath = path.join(sourceDir, folder);
  const targetPath = path.join(targetDir, folder);
  
  if (fs.existsSync(sourcePath)) {
    // using git mv is better for tracking, but fs.renameSync works for local
    fs.renameSync(sourcePath, targetPath);
    console.log(`Moved ${folder} to app/[locale]`);
  } else {
    console.log(`Not found: ${folder}`);
  }
});
