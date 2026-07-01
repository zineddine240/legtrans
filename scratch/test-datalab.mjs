import fs from "fs";
import path from "path";

// Load env
const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/DATALAB_API_KEY\s*=\s*(.*)/);
const apiKey = match ? match[1].trim().replace(/['"]/g, "") : null;

if (!apiKey) {
  console.error("DATALAB_API_KEY not found in .env.local");
  process.exit(1);
}

console.log("Using API Key:", apiKey.slice(0, 5) + "...");

async function testMarker() {
  // Try to find any png/jpg in the public or root directory to test with
  let testFile = null;
  const files = fs.readdirSync(".");
  for (const file of files) {
    if (file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".pdf")) {
      testFile = file;
      break;
    }
  }

  if (!testFile) {
    // Check tmp or other directories
    console.error("No test file found in the root directory. Please put a test file (PDF or PNG) in the root.");
    process.exit(1);
  }

  console.log("Testing with file:", testFile);
  const buffer = fs.readFileSync(testFile);
  const mimeType = testFile.endsWith(".pdf") ? "application/pdf" : "image/png";

  const formData = new FormData();
  const blob = new Blob([buffer], { type: mimeType });
  formData.append("file", blob, testFile);
  formData.append("output_format", "markdown");
  formData.append("mode", "accurate");

  console.log("Submitting to Datalab...");
  const res = await fetch("https://www.datalab.to/api/v1/marker", {
    method: "POST",
    headers: { "X-API-Key": apiKey },
    body: formData
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Submit failed:", res.status, text);
    return;
  }

  const { request_check_url } = await res.json();
  console.log("Check URL:", request_check_url);

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    console.log(`Polling ${i+1}...`);
    const checkRes = await fetch(request_check_url, {
      headers: { "X-API-Key": apiKey }
    });

    if (!checkRes.ok) {
      console.log("Poll HTTP error:", checkRes.status);
      continue;
    }

    const result = await checkRes.json();
    console.log("Status:", result.status);

    if (result.status === "complete") {
      console.log("SUCCESS!");
      console.log("Markdown output length:", result.markdown?.length || 0);
      console.log("Markdown preview:", result.markdown?.slice(0, 1000));
      break;
    }

    if (result.status === "failed") {
      console.log("FAILED:", result.error);
      break;
    }
  }
}

testMarker().catch(console.error);
