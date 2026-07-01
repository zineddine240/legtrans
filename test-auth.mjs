import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const emailMatch = env.match(/GOOGLE_CLIENT_EMAIL="([^"]+)"/);
const keyMatch = env.match(/GOOGLE_PRIVATE_KEY="([^"]+)"/);

const clientEmail = emailMatch[1];
let privateKey = keyMatch[1];
privateKey = privateKey.replace(/\\n/g, '\n');

console.log("Email:", clientEmail);
console.log("Private Key starts with:", privateKey.substring(0, 30));

const auth = new GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: "https://www.googleapis.com/auth/cloud-platform"
});

auth.getAccessToken().then(() => console.log("Success!")).catch(console.error);
