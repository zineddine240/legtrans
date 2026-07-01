const fs = require('fs');
const { execSync } = require('child_process');

const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');

for (let line of lines) {
  line = line.trim();
  if (line.startsWith('NEXT_PUBLIC_FIREBASE_')) {
    const parts = line.split('=');
    const name = parts[0];
    let value = parts.slice(1).join('=');
    if (value.startsWith('"')) value = value.substring(1);
    if (value.endsWith('"')) value = value.substring(0, value.length - 1);
    
    console.log(`Updating ${name} to ${value}...`);
    
    try {
      execSync(`vercel env rm ${name} production -y`, { stdio: 'ignore' });
    } catch(e) {}
    
    try {
      execSync(`vercel env add ${name} production --value "${value}" --yes`, { stdio: 'inherit' });
    } catch(e) {
      console.error(`Failed to add ${name}`);
    }
  }
}
