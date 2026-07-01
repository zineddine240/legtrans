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

// Locate the screenshot artifact
const screenshotPath = "C:/Users/MSI/.gemini/antigravity/brain/111901d5-522d-40f0-af73-88f23ba68c3a/media__1779756812867.png";

if (!fs.existsSync(screenshotPath)) {
  console.error("Screenshot file not found at:", screenshotPath);
  process.exit(1);
}

console.log("Found screenshot. Size:", fs.statSync(screenshotPath).size, "bytes");

async function testConvert() {
  const buffer = fs.readFileSync(screenshotPath);
  const formData = new FormData();
  const blob = new Blob([buffer], { type: "image/png" });
  formData.append("file", blob, "media__1779756812867.png");
  formData.append("output_format", "markdown");
  formData.append("mode", "accurate");

  console.log("Submitting to /api/v1/convert...");
  const res = await fetch("https://www.datalab.to/api/v1/convert", {
    method: "POST",
    headers: { "X-API-Key": apiKey },
    body: formData
  });

  if (!res.ok) {
    console.error("Submission failed:", res.status, await res.text());
    return;
  }

  const { request_check_url } = await res.json();
  console.log("Check URL:", request_check_url);

  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const checkRes = await fetch(request_check_url, {
      headers: { "X-API-Key": apiKey }
    });

    if (!checkRes.ok) {
      console.log(`Poll ${i+1}: HTTP error`, checkRes.status);
      continue;
    }

    const result = await checkRes.json();
    console.log(`Poll ${i+1}: status = ${result.status}`);

    if (result.status === "complete") {
      console.log("SUCCESS!");
      console.log("Markdown length:", result.markdown?.length || 0);
      console.log("Markdown preview (first 300 chars):");
      console.log(JSON.stringify(result.markdown?.slice(0, 300)));
      break;
    }

    if (result.status === "failed") {
      console.error("FAILED:", result.error);
      break;
    }
  }
}

testConvert().catch(console.error);
