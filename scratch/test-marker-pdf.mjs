import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/DATALAB_API_KEY\s*=\s*(.*)/);
const apiKey = match ? match[1].trim().replace(/['"]/g, "") : null;

const filePath = process.argv[2];
if (!filePath) { console.error("Usage: node scratch/test-marker-pdf.mjs <pdf-path>"); process.exit(1); }

const buffer = fs.readFileSync(filePath);
const ext = filePath.split(".").pop().toLowerCase();
const mimeType = ext === "pdf" ? "application/pdf" : "image/png";

console.log("File:", filePath, "Size:", buffer.length, "MIME:", mimeType);

// Test 1: /marker with force_ocr + langs
console.log("\n=== TEST: /marker with force_ocr=true + langs=ar,fr,en ===");
{
  const fd = new FormData();
  fd.append("file", new Blob([buffer], { type: mimeType }), filePath.split(/[\\/]/).pop());
  fd.append("output_format", "markdown");
  fd.append("mode", "accurate");
  fd.append("langs", "ar,fr,en");
  fd.append("force_ocr", "true");

  const res = await fetch("https://www.datalab.to/api/v1/marker", {
    method: "POST", headers: { "X-API-Key": apiKey }, body: fd
  });
  if (!res.ok) { console.error("Submit failed:", await res.text()); } else {
    const { request_check_url } = await res.json();
    console.log("Check URL:", request_check_url);
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const cr = await fetch(request_check_url, { headers: { "X-API-Key": apiKey } });
      const result = await cr.json();
      console.log(`Poll ${i+1}: status=${result.status} markdown_len=${result.markdown?.length ?? 0} blocks=${JSON.stringify(result.metadata?.page_stats)}`);
      if (result.status === "complete") {
        console.log("Markdown preview:\n", result.markdown?.slice(0, 400));
        break;
      }
      if (result.status === "failed") { console.error("FAILED:", result.error); break; }
    }
  }
}

// Test 2: /convert with use_llm=true
console.log("\n=== TEST: /convert with use_llm=true ===");
{
  const fd = new FormData();
  fd.append("file", new Blob([buffer], { type: mimeType }), filePath.split(/[\\/]/).pop());
  fd.append("output_format", "markdown");
  fd.append("mode", "accurate");
  fd.append("use_llm", "true");
  fd.append("skip_cache", "true");

  const res = await fetch("https://www.datalab.to/api/v1/convert", {
    method: "POST", headers: { "X-API-Key": apiKey }, body: fd
  });
  if (!res.ok) { console.error("Submit failed:", await res.text()); } else {
    const { request_check_url } = await res.json();
    console.log("Check URL:", request_check_url);
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const cr = await fetch(request_check_url, { headers: { "X-API-Key": apiKey } });
      const result = await cr.json();
      console.log(`Poll ${i+1}: status=${result.status} markdown_len=${result.markdown?.length ?? 0} blocks=${JSON.stringify(result.metadata?.page_stats)}`);
      if (result.status === "complete") {
        console.log("Markdown preview:\n", result.markdown?.slice(0, 400));
        break;
      }
      if (result.status === "failed") { console.error("FAILED:", result.error); break; }
    }
  }
}
