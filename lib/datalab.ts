const DATALAB_API_KEY = process.env.DATALAB_API_KEY!;
const DATALAB_URL = "https://www.datalab.to/api/v1/convert";

export async function extractWithDatalab(
  file: Buffer,
  fileName: string,
  mimeType: string,
  mode: "accurate" | "fast" = "fast",
): Promise<{ markdown: string; pageCount: number; costCents: number }> {
  if (!DATALAB_API_KEY) {
    throw new Error("DATALAB_API_KEY non configurée");
  }

  // Bypass Datalab's hash-based permacache by appending a random byte.
  // Datalab ignores skip_cache for /convert and caches failed LLM attempts permanently.
  const cacheBusterByte = Math.floor(Math.random() * 256);
  const cacheBustedFile = Buffer.concat([file, Buffer.from([cacheBusterByte])]);
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(cacheBustedFile)], { type: mimeType });
  formData.append("file", blob, fileName);
  formData.append("output_format", "markdown");
  formData.append("mode", mode);
  formData.append("skip_cache", "true");
  formData.append("use_llm", "true");
  formData.append("langs", "ar,fr,en");

  console.log("[Datalab] Submitting to:", DATALAB_URL);
  
  // Use axios to bypass Next.js patched fetch
  const axios = require('axios');
  let submitData;
  try {
    const submitRes = await axios.post(DATALAB_URL, formData, {
      headers: { "X-API-Key": DATALAB_API_KEY }
    });
    submitData = submitRes.data;
  } catch (err: any) {
    throw new Error(`Échec soumission: ${err.message} - ${err.response?.data ? JSON.stringify(err.response.data) : ''}`);
  }

  console.log("[Datalab] Submit response:", JSON.stringify(submitData));
  const { request_check_url } = submitData;

  // Poll up to 60 × 2s = 2 minutes
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    let result;
    try {
      const checkRes = await axios.get(request_check_url, {
        headers: { "X-API-Key": DATALAB_API_KEY },
      });
      result = checkRes.data;
    } catch (err: any) {
      console.error("[Datalab Convert Poll Error]", err.message);
      continue;
    }
    console.log("[Datalab Convert Poll]", result.status, "markdown_len:", result.markdown?.length ?? 0);

    if (result.status === "complete") {
      return {
        markdown: result.markdown || "",
        pageCount: result.page_count || 0,
        costCents: result.cost_breakdown?.total_cents || 0,
      };
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Échec OCR");
    }
  }

  throw new Error("Délai d'attente OCR dépassé");
}

export async function runCustomProcessor(
  file: Buffer,
  fileName: string,
  mimeType: string,
  pipelineId: string,
): Promise<{
  markdown: string;
  html: string;
  json: any;
  results: any;
  pageCount: number;
  costCents: number;
}> {
  if (!DATALAB_API_KEY) {
    throw new Error("DATALAB_API_KEY non configurée");
  }

  const CUSTOM_PROCESSOR_URL = "https://www.datalab.to/api/v1/custom-processor";
  console.log("[Handwriting Debug] Sending to:", CUSTOM_PROCESSOR_URL);
  console.log("[Handwriting Debug] pipeline_id:", pipelineId);
  console.log("[Handwriting Debug] file:", fileName, mimeType, file.length, "bytes");

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(file)], { type: mimeType });
  formData.append("file", blob, fileName);
  formData.append("pipeline_id", pipelineId);

  // Use axios to bypass Next.js patched fetch (same as extractWithDatalab)
  const axios = require('axios');
  let submitData;
  try {
    const submitRes = await axios.post(CUSTOM_PROCESSOR_URL, formData, {
      headers: { "X-API-Key": DATALAB_API_KEY },
    });
    submitData = submitRes.data;
  } catch (err: any) {
    throw new Error(`Échec soumission Custom Processor: ${err.message} - ${err.response?.data ? JSON.stringify(err.response.data) : ''}`);
  }

  console.log("[Handwriting Debug] Submit response:", JSON.stringify(submitData));
  const { request_check_url } = submitData;

  // Poll up to 90 × 2s = 3 minutes
  for (let i = 0; i < 90; i++) {
    await new Promise(r => setTimeout(r, 2000));

    let result: any;
    try {
      const checkRes = await axios.get(request_check_url, {
        headers: { "X-API-Key": DATALAB_API_KEY },
      });
      result = checkRes.data;
    } catch (err: any) {
      console.error("[Handwriting Debug] Poll error:", err.message);
      continue;
    }

    console.log("[Handwriting Debug] Poll status:", result?.status, "markdown_len:", result?.markdown?.length ?? 0);

    if (result.status === "complete") {
      // Debug raw response
      console.log("[Handwriting Debug] response_keys", Object.keys(result || {}));
      console.log("[Handwriting Debug] status", result?.status);
      console.log("[Handwriting Debug] markdown_len", result?.markdown?.length);
      console.log("[Handwriting Debug] markdown_preview", result?.markdown?.slice(0, 2000));
      console.log("[Handwriting Debug] html_len", result?.html?.length);
      console.log("[Handwriting Debug] html_preview", result?.html?.slice(0, 1000));
      console.log("[Handwriting Debug] results_keys", result?.results ? Object.keys(result.results) : null);

      // Build markdown with best-available content + multi-page combination
      let finalMarkdown = "";

      // Priority 1: Top-level markdown
      if (result.markdown?.trim()) {
        finalMarkdown = result.markdown.trim();
      }

      // Priority 2: Combine page-level results if top-level markdown is empty or shorter
      if (result.results) {
        const pagesArray: any[] = Array.isArray(result.results)
          ? result.results
          : Object.values(result.results);

        if (pagesArray.length > 0) {
          const pagesMarkdown = pagesArray
            .map((page: any, idx: number) => {
              const pageText = page.markdown?.trim() || page.text?.trim() || page.html?.trim() || "";
              if (!pageText) return null;
              return pagesArray.length > 1 ? `--- Page ${idx + 1} ---\n\n${pageText}` : pageText;
            })
            .filter(Boolean)
            .join("\n\n");

          // Use page-level if it's significantly longer than top-level markdown
          if (pagesMarkdown && pagesMarkdown.length > (finalMarkdown.length + 50)) {
            console.log("[Handwriting Debug] Using page-level combined markdown, length:", pagesMarkdown.length);
            finalMarkdown = pagesMarkdown;
          }
        }
      }

      // Priority 3: Fall back to HTML content if no markdown found
      if (!finalMarkdown && result.html?.trim()) {
        console.log("[Handwriting Debug] Falling back to HTML as markdown source");
        finalMarkdown = result.html.trim();
      }

      console.log("[Handwriting Debug] Final markdown length:", finalMarkdown.length);

      return {
        markdown: finalMarkdown,
        html: result.html || "",
        json: result.json || null,
        results: result.results || null,
        pageCount: result.page_count || 1,
        costCents: result.cost_breakdown?.total_cents || 0,
      };
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Échec Custom Processor");
    }
  }

  throw new Error("Délai d'attente Custom Processor dépassé");
}

