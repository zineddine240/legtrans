import fs from "fs";

// Load env
const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/DATALAB_API_KEY\s*=\s*(.*)/);
const apiKey = match ? match[1].trim().replace(/['"]/g, "") : null;

if (!apiKey) {
  console.error("DATALAB_API_KEY not found in .env.local");
  process.exit(1);
}

// Find any test file passed as argument, or scan Downloads
const testFilePath = process.argv[2];
if (!testFilePath) {
  console.error("Usage: node scratch/test-file.mjs <path-to-your-file>");
  process.exit(1);
}

if (!fs.existsSync(testFilePath)) {
  console.error("File not found:", testFilePath);
  process.exit(1);
}

const stat = fs.statSync(testFilePath);
console.log("File:", testFilePath);
console.log("Size:", stat.size, "bytes");

const ext = testFilePath.split(".").pop().toLowerCase();
const mimeMap = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", tiff: "image/tiff", tif: "image/tiff" };
const mimeType = mimeMap[ext] || "application/octet-stream";
console.log("MIME type:", mimeType);

const buffer = fs.readFileSync(testFilePath);
const formData = new FormData();
const blob = new Blob([buffer], { type: mimeType });
formData.append("file", blob, testFilePath.split(/[\\/]/).pop());
formData.append("output_format", "markdown");
formData.append("mode", "accurate");
formData.append("langs", "ar,fr,en");
formData.append("skip_cache", "true");
formData.append("force_ocr", "true");

console.log("\nSubmitting to /api/v1/convert...");
const res = await fetch("https://www.datalab.to/api/v1/convert", {
  method: "POST",
  headers: { "X-API-Key": apiKey },
  body: formData
});

if (!res.ok) {
  console.error("Submit failed:", res.status, await res.text());
  process.exit(1);
}

const submitData = await res.json();
console.log("Submit response:", JSON.stringify(submitData, null, 2));
const { request_check_url } = submitData;

for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 2000));
  const checkRes = await fetch(request_check_url, { headers: { "X-API-Key": apiKey } });
  if (!checkRes.ok) { console.log(`Poll ${i+1}: HTTP ${checkRes.status}`); continue; }
  const result = await checkRes.json();
  console.log(`Poll ${i+1}: status=${result.status} markdown_len=${result.markdown?.length ?? 0} blocks=${JSON.stringify(result.metadata?.page_stats)}`);
  if (result.status === "complete") {
    console.log("\n=== RESULT ===");
    console.log("Markdown length:", result.markdown?.length ?? 0);
    console.log("Preview:\n", result.markdown?.slice(0, 500));
    break;
  }
  if (result.status === "failed") { console.error("FAILED:", result.error); break; }
}
