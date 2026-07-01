import { loadEnvConfig } from '@next/env';
import { GoogleAuth } from 'google-auth-library';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

let privateKey = process.env.GOOGLE_PRIVATE_KEY || "";
console.log("Raw from env length:", privateKey.length);
console.log("Includes literal \\n:", privateKey.includes("\\n"));

if (privateKey.includes("\\n")) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.slice(1, -1);
}

const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: privateKey,
  },
  scopes: "https://www.googleapis.com/auth/cloud-platform"
});

auth.getAccessToken()
  .then(() => console.log("Success!"))
  .catch(e => console.log("Auth Error:", e.message));
