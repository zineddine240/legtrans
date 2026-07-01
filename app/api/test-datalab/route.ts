import { NextRequest, NextResponse } from "next/server";

const DATALAB_API_KEY = process.env.DATALAB_API_KEY!;
const axios = require('axios');
const BASE = "https://www.datalab.to/api/v1";
const H = () => ({ "X-API-Key": DATALAB_API_KEY });
const HJ = () => ({ "X-API-Key": DATALAB_API_KEY, "Content-Type": "application/json" });

export const maxDuration = 300;

// ─── GET: HTML test UI ──────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get("action") === "discover") return handleDiscover();

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Datalab Pipeline Test</title>
  <style>
    body { font-family: monospace; background: #1a1a1a; color: #eee; padding: 32px; max-width: 1000px; margin: 0 auto; }
    h1 { color: #4ade80; } h2 { color: #60a5fa; margin-top:0; }
    label { display: block; margin-bottom: 8px; color: #aaa; }
    input[type=file] { background: #2a2a2a; border: 1px solid #444; padding: 8px; color: #eee; border-radius: 6px; width: 100%; }
    .btns { display:flex; gap:12px; margin-top:16px; flex-wrap:wrap; }
    button { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: bold; }
    .btn-blue { background: #1d4ed8; color: white; }
    .btn-green { background: #0d6e4e; color: white; }
    button:disabled { background: #444 !important; cursor: not-allowed; }
    #status { margin-top: 16px; color: #facc15; font-weight: bold; }
    .box { background: #2a2a2a; border: 1px solid #555; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .good { border-color: #4ade80; } .bad { border-color: #f87171; } .info { border-color: #60a5fa; }
    .stat { color: #94a3b8; font-size: 13px; margin: 3px 0; }
    pre { white-space: pre-wrap; word-break: break-word; background: #111; padding: 12px; border-radius: 6px; font-size: 12px; max-height: 350px; overflow-y: auto; }
    .tag { display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; margin-left:8px; }
    .tag-old { background:#78350f; color:#fde68a; }
    .tag-new { background:#064e3b; color:#6ee7b7; }
  </style>
</head>
<body>
  <h1>🔬 Datalab Pipeline Tester</h1>

  <div class="box info">
    <h2>Step 1 — Discover available pipelines & processors</h2>
    <p style="color:#aaa">No file needed. Queries your account for available pipelines, custom processors, and templates.</p>
    <div class="btns">
      <button class="btn-blue" id="btn-d" onclick="discover()">🔍 Discover</button>
    </div>
    <div id="discover-status"></div>
    <div id="discover-out"></div>
  </div>

  <div class="box">
    <h2>Step 2 — Run Tests (5–15 min)</h2>
    <p style="color:#aaa">Tests 4 strategies on the same file and compares quality.</p>
    <label>Select file:</label>
    <input type="file" id="file" accept=".pdf,.jpg,.jpeg,.png,.tiff">
    <div class="btns">
      <button class="btn-green" id="btn-t" onclick="runTest()">▶ Run All Tests</button>
    </div>
    <div id="test-status"></div>
    <div id="test-out"></div>
  </div>

  <script>
    async function discover() {
      const btn = document.getElementById('btn-d');
      btn.disabled = true; btn.textContent = '⏳ Discovering...';
      document.getElementById('discover-status').textContent = 'Querying Datalab...';
      document.getElementById('discover-out').innerHTML = '';
      try {
        const r = await fetch('/api/test-datalab?action=discover');
        const d = await r.json();
        document.getElementById('discover-status').textContent = '✅ Done!';
        document.getElementById('discover-out').innerHTML = '<pre>' + JSON.stringify(d, null, 2).replace(/</g,'&lt;') + '</pre>';
      } catch(e) { document.getElementById('discover-status').textContent = '❌ ' + e.message; }
      finally { btn.disabled = false; btn.textContent = '🔍 Discover'; }
    }

    async function runTest() {
      const fi = document.getElementById('file');
      if (!fi.files[0]) { alert('Select a file first.'); return; }
      const btn = document.getElementById('btn-t');
      const status = document.getElementById('test-status');
      btn.disabled = true; btn.textContent = '⏳ Running...';
      status.textContent = 'Running tests — may take 5–15 minutes...';
      document.getElementById('test-out').innerHTML = '';
      try {
        const fd = new FormData();
        fd.append('file', fi.files[0]);
        const res = await fetch('/api/test-datalab', { method: 'POST', body: fd });
        const data = await res.json();
        status.textContent = '✅ Done!';
        const out = document.getElementById('test-out');
        for (const r of (data.results || [])) {
          const isErr = !!r.error;
          const mdLen = r.markdown_len ?? 0;
          const qual = mdLen > 5000 ? '🟢 Good' : mdLen > 1000 ? '🟡 Medium' : '🔴 Poor/Empty';
          const div = document.createElement('div');
          div.className = 'box ' + (isErr ? 'bad' : 'good');
          div.innerHTML = \`
            <h2>\${r.label}</h2>
            \${isErr ? '<div style="color:#f87171">❌ '+r.error+'</div>' : \`
              <div class="stat">\${qual} — markdown_len: <strong>\${mdLen}</strong></div>
              <div class="stat">page_count: \${r.page_count??'N/A'} | cost_cents: \${r.cost_cents??'N/A'} | html_len: \${r.html_len??'N/A'}</div>
              \${r.pipeline_id ? '<div class="stat">pipeline_id: <strong>'+r.pipeline_id+'</strong></div>' : ''}
              \${r.execution_id ? '<div class="stat">execution_id: <strong>'+r.execution_id+'</strong></div>' : ''}
              \${r.pipeline_version != null ? '<div class="stat">pipeline_version: <strong>'+r.pipeline_version+'</strong></div>' : ''}
              \${r.step_statuses ? '<div class="stat">step statuses: <strong>'+JSON.stringify(r.step_statuses)+'</strong></div>' : ''}
              <div class="stat">response_keys: \${(r.response_keys||[]).join(', ')}</div>
              <div class="stat" style="margin-top:8px">Markdown preview (1500 chars):</div>
              <pre>\${(r.markdown_preview||'(empty)').replace(/</g,'&lt;')}</pre>
            \`}
          \`;
          out.appendChild(div);
        }
      } catch(e) {
        status.textContent = '❌ ' + e.message;
      } finally { btn.disabled = false; btn.textContent = '▶ Run All Tests'; }
    }
  </script>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// ─── Discovery ──────────────────────────────────────────────────────────────
async function handleDiscover() {
  const out: any = {};

  // 1. List existing pipelines
  try {
    const r = await axios.get(`${BASE}/pipelines`, { headers: H() });
    out.pipelines = r.data;
    console.log("[Discover] pipelines:", JSON.stringify(r.data).slice(0, 800));
  } catch(e: any) { out.pipelines_error = e.response?.status + " " + e.message; }

  // 2. List processor templates (handwriting template lives here)
  try {
    const r = await axios.get(`${BASE}/processor-templates`, { headers: H() });
    out.processor_templates = r.data;
    console.log("[Discover] processor-templates:", JSON.stringify(r.data).slice(0, 1000));
  } catch(e: any) {
    // try alternate path
    try {
      const r2 = await axios.get(`${BASE}/pipeline-templates`, { headers: H() });
      out.pipeline_templates = r2.data;
      console.log("[Discover] pipeline-templates:", JSON.stringify(r2.data).slice(0, 1000));
    } catch(e2: any) { out.templates_error = e.response?.status + " / " + (e2 as any).response?.status; }
  }

  // 3. Custom processors (beta)
  try {
    const r = await axios.get(`${BASE}/custom_processors`, { headers: H() });
    out.custom_processors = r.data;
  } catch(e: any) { out.custom_processors_error = e.response?.status + " " + e.message; }

  // 4. Pipeline access check
  try {
    const r = await axios.get(`${BASE}/custom_processors/access`, { headers: H() });
    out.pipeline_access = r.data;
  } catch(e: any) { out.pipeline_access_error = e.response?.status + " " + e.message; }

  // 5. Try listing templates from both paths
  for (const path of ["/processor-templates", "/pipeline-templates", "/templates"]) {
    try {
      const r = await axios.get(`${BASE}${path}`, { headers: H() });
      out[`try_${path.replace(/\//g,"_")}`] = r.data;
      console.log(`[Discover] ${path}:`, JSON.stringify(r.data).slice(0, 500));
    } catch(e: any) { out[`try_${path.replace(/\//g,"_")}_err`] = e.response?.status; }
  }

  return NextResponse.json(out);
}

// ─── Helpers ────────────────────────────────────────────────────────────────
async function sleepMs(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function pollCheckUrl(checkUrl: string, label: string, maxAttempts = 90) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleepMs(3000);
    try {
      const res = await axios.get(checkUrl, { headers: H() });
      const d = res.data;
      console.log(`[${label}] poll ${i+1}: status=${d.status} md=${d.markdown?.length ?? 0}`);
      if (d.status === "complete") return d;
      if (d.status === "failed") throw new Error(`${label} failed: ${d.error}`);
    } catch(e: any) { if (e.message?.includes("failed")) throw e; }
  }
  throw new Error(`${label} timed out`);
}

async function pollPipelineExecution(executionId: string, label: string, maxAttempts = 120) {
  const url = `${BASE}/pipelines/executions/${executionId}`;
  for (let i = 0; i < maxAttempts; i++) {
    await sleepMs(3000);
    const res = await axios.get(url, { headers: H() });
    const d = res.data;
    const stepInfo = d.steps ? d.steps.map((s: any) => `${s.step_type}:${s.status}`).join(" → ") : "N/A";
    console.log(`[${label}] pipeline poll ${i+1}: status=${d.status} steps=[${stepInfo}]`);
    if (["completed", "completed_with_errors", "failed"].includes(d.status)) return d;
  }
  throw new Error(`${label} pipeline timed out`);
}

async function getStepResult(executionId: string, stepIndex: number) {
  try {
    const res = await axios.get(
      `${BASE}/pipelines/executions/${executionId}/steps/${stepIndex}/result`,
      { headers: H() }
    );
    return res.data;
  } catch(e: any) { console.error(`[getStepResult] step${stepIndex}:`, e.response?.status, e.message); return null; }
}

function summarize(label: string, result: any, extra?: any) {
  return {
    label,
    status: result.status,
    markdown_len: result.markdown?.length ?? 0,
    markdown_preview: result.markdown?.slice(0, 2000) ?? null,
    html_len: result.html?.length,
    results_keys: result.results ? Object.keys(result.results) : null,
    response_keys: Object.keys(result),
    page_count: result.page_count,
    cost_cents: result.cost_breakdown?.total_cents ?? null,
    ...extra,
  };
}

// ─── POST: Run Tests ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get("action") === "discover") return handleDiscover();

  if (!DATALAB_API_KEY) return NextResponse.json({ error: "DATALAB_API_KEY not set" }, { status: 500 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = () => new Blob([new Uint8Array(buffer)], { type: file.type });
  const results: any[] = [];

  // ── Test A: OLD way — /custom-processor  pipeline_id=handwriting-detection ──
  try {
    console.log("\n[Test A] OLD: /custom-processor + pipeline_id=handwriting-detection");
    const fd = new FormData();
    fd.append("file", blob(), file.name);
    fd.append("pipeline_id", "handwriting-detection");
    const s = await axios.post(`${BASE}/custom-processor`, fd, { headers: H() });
    console.log("[Test A] submit:", JSON.stringify(s.data));
    const r = await pollCheckUrl(s.data.request_check_url, "A");
    results.push(summarize("A [OLD] custom-processor / handwriting-detection", r));
  } catch(e: any) { results.push({ label: "A [OLD] custom-processor / handwriting-detection", error: e.message }); }

  // ── Test B: NEW Pipelines API — create pipeline convert → custom(handwriting-detection) ──
  try {
    console.log("\n[Test B] NEW: /pipelines  convert → custom(handwriting-detection)");

    // Step 1: Create pipeline
    const createRes = await axios.post(`${BASE}/pipelines`, {
      steps: [
        { type: "convert", settings: { mode: "accurate", output_format: "markdown", langs: ["ar", "fr", "en"] } },
        { type: "custom", settings: {}, custom_processor_id: "handwriting-detection" }
      ]
    }, { headers: HJ() });
    const pipelineId = createRes.data.pipeline_id;
    console.log("[Test B] Created pipeline:", pipelineId);

    // Step 2: Run it
    const fd = new FormData();
    fd.append("file", blob(), file.name);
    fd.append("skip_cache", "true");
    const runRes = await axios.post(`${BASE}/pipelines/${pipelineId}/run`, fd, { headers: H() });
    const executionId = runRes.data.execution_id;
    console.log("[Test B] execution_id:", executionId);
    console.log("[Test B] pipeline_id:", pipelineId);
    console.log("[Test B] run response:", JSON.stringify(runRes.data));

    // Step 3: Poll execution
    const execResult = await pollPipelineExecution(executionId, "B");
    console.log("[Test B] Final status:", execResult.status);
    console.log("[Test B] Steps:", JSON.stringify(execResult.steps));
    console.log("[Test B] pipeline_version:", execResult.pipeline_version);

    // Step 4: Get step results for each step
    const stepStatuses: any = {};
    let finalMarkdown = "";
    if (execResult.steps) {
      for (let i = 0; i < execResult.steps.length; i++) {
        const step = execResult.steps[i];
        stepStatuses[`step${i}(${step.step_type})`] = step.status;
        const stepResult = await getStepResult(executionId, i);
        if (stepResult) {
          console.log(`[Test B] Step ${i} (${step.step_type}) result keys:`, Object.keys(stepResult));
          console.log(`[Test B] Step ${i} markdown_len:`, stepResult.markdown?.length ?? 0);
          if ((stepResult.markdown?.length ?? 0) > finalMarkdown.length) {
            finalMarkdown = stepResult.markdown || "";
          }
        }
      }
    }

    results.push({
      label: "B [NEW] Pipelines API: convert → custom(handwriting-detection)",
      status: execResult.status,
      markdown_len: finalMarkdown.length,
      markdown_preview: finalMarkdown.slice(0, 2000),
      pipeline_id: pipelineId,
      execution_id: executionId,
      pipeline_version: execResult.pipeline_version,
      step_statuses: stepStatuses,
      response_keys: Object.keys(execResult),
    });
  } catch(e: any) {
    const errDetail = e.response?.data ? JSON.stringify(e.response.data) : e.message;
    results.push({ label: "B [NEW] Pipelines API: convert → custom(handwriting-detection)", error: errDetail });
  }

  // ── Test C: NEW Pipelines API — convert only (accurate mode, baseline) ──
  try {
    console.log("\n[Test C] NEW: /pipelines  convert only (accurate, as baseline)");

    const createRes = await axios.post(`${BASE}/pipelines`, {
      steps: [
        { type: "convert", settings: { mode: "accurate", output_format: "markdown", langs: ["ar", "fr", "en"] } }
      ]
    }, { headers: HJ() });
    const pipelineId = createRes.data.pipeline_id;
    console.log("[Test C] pipeline_id:", pipelineId);

    const fd = new FormData();
    fd.append("file", blob(), file.name);
    fd.append("skip_cache", "true");
    const runRes = await axios.post(`${BASE}/pipelines/${pipelineId}/run`, fd, { headers: H() });
    const executionId = runRes.data.execution_id;
    console.log("[Test C] execution_id:", executionId);

    const execResult = await pollPipelineExecution(executionId, "C");
    const stepResult = await getStepResult(executionId, 0);
    const markdown = stepResult?.markdown || "";
    console.log("[Test C] markdown_len:", markdown.length);

    results.push({
      label: "C [NEW] Pipelines API: convert only (accurate baseline)",
      status: execResult.status,
      markdown_len: markdown.length,
      markdown_preview: markdown.slice(0, 2000),
      pipeline_id: pipelineId,
      execution_id: executionId,
      pipeline_version: execResult.pipeline_version,
      step_statuses: execResult.steps ? Object.fromEntries(execResult.steps.map((s: any, i: number) => [`step${i}`, s.status])) : {},
      response_keys: Object.keys(execResult),
    });
  } catch(e: any) {
    const errDetail = e.response?.data ? JSON.stringify(e.response.data) : e.message;
    results.push({ label: "C [NEW] Pipelines API: convert only (accurate baseline)", error: errDetail });
  }

  // Log summary
  console.log("\n===== TEST SUMMARY =====");
  for (const r of results) {
    console.log(`\n[${r.label}]`);
    console.log("  error:", r.error ?? "none");
    console.log("  markdown_len:", r.markdown_len ?? "N/A");
    console.log("  pipeline_id:", r.pipeline_id ?? "N/A");
    console.log("  execution_id:", r.execution_id ?? "N/A");
    console.log("  pipeline_version:", r.pipeline_version ?? "N/A");
    console.log("  step_statuses:", JSON.stringify(r.step_statuses ?? {}));
    console.log("  markdown_preview:", r.markdown_preview?.slice(0, 400));
  }

  return NextResponse.json({ results });
}
