const fs = require('fs');
const path = require('path');

const locales = ['ar', 'fr', 'en', 'es', 'it'];
const messagesDir = path.join(__dirname, 'messages');

locales.forEach(locale => {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Update Pro price from 3k/3000 to 4k/4000
    content = content.replace(/3k DA/g, "4k DA");
    content = content.replace(/3000 DA/g, "4000 DA");
    content = content.replace(/3k د.ج/g, "4k د.ج");
    content = content.replace(/3000 د.ج/g, "4000 د.ج");
    content = content.replace(/3 000/g, "4 000");

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${locale}.json text prices.`);
  }
});
