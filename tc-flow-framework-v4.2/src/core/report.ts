import { Page } from 'playwright';
import fs from 'fs';
import path from 'path';

// Execution status
export type StepStatus = 'passed' | 'failed' | 'skipped';

// A single step record
export type StepRecord = {
  name: string;            // step name (e.g., 01-advancedSearch)
  startedAt: string;       // ISO timestamp
  finishedAt?: string;     // ISO timestamp
  status?: StepStatus;     // result status
  error?: string;          // error stack/message for failures
  screenshot?: string;     // relative path to screenshot
  meta?: Record<string, any>; // optional metadata
};

// Reporter writes JSON / Markdown / HTML reports and manages step records
export class Reporter {
  private steps: StepRecord[] = [];
  constructor(private outDir: string) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(path.join(outDir, 'screenshots'), { recursive: true });
  }

  // start a step
  beginStep(name: string): StepRecord {
    const rec: StepRecord = { name, startedAt: new Date().toISOString() };
    this.steps.push(rec);
    return rec;
  }

  // finish a step and optionally capture a screenshot
  async endStep(
    rec: StepRecord,
    page?: Page,
    status: StepStatus = 'passed',
    error?: unknown
  ): Promise<void> {
    rec.finishedAt = new Date().toISOString();
    rec.status = status;

    if (status === 'failed' && error) {
      rec.error = toErrorString(error);
    }

    if (page && !safeIsClosed(page)) {
      const file = path.join(this.outDir, 'screenshots', `${sanitizeFile(rec.name)}.png`);
      try {
        await page.screenshot({ path: file, fullPage: true });
        rec.screenshot = path.relative(this.outDir, file).replace(/\\/g, '/');
      } catch {
        // ignore screenshot errors
      }
    }
  }

  // merge arbitrary metadata into a step record
  addMeta(rec: StepRecord, meta: Record<string, any>) {
    rec.meta = { ...(rec.meta || {}), ...meta };
  }

  // persist JSON, Markdown and HTML reports
  async flush(flowName: string): Promise<void> {
    // JSON
    const jsonPath = path.join(this.outDir, 'report.json');
    fs.writeFileSync(
      jsonPath,
      JSON.stringify({ flow: flowName, generatedAt: new Date().toISOString(), steps: this.steps }, null, 2),
      'utf-8'
    );

    // Markdown
    const md: string[] = [
      '# Run Report',
      '',
      `**Flow**: ${flowName}`,
      `**Generated**: ${new Date().toLocaleString()}`,
      '',
      '## Steps',
    ];
    for (const s of this.steps) {
      md.push(`- **${s.name}** — ${s.status?.toUpperCase()} (${s.startedAt} -> ${s.finishedAt})`);
      if (s.error) md.push(`  - Error: \`${inlineCode(s.error)}\``);
      if (s.screenshot) md.push(`  - Screenshot: ${s.screenshot}`);
      if (s.meta && Object.keys(s.meta).length) {
        md.push('  - Meta:');
        md.push('```json');
        md.push(JSON.stringify(s.meta, null, 2));
        md.push('```');
      }
    }
    fs.writeFileSync(path.join(this.outDir, 'report.md'), md.join(''), 'utf-8');

    // HTML
    const html = this.renderHTML(flowName);
    fs.writeFileSync(path.join(this.outDir, 'report.html'), html, 'utf-8');
  }

  // build a single-file HTML report (lightweight, no external deps)
  private renderHTML(flowName: string): string {
    const esc = (v: any) => String(v).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c));
    const rows = this.steps
      .map((s) => {
        const err = s.error ? `<pre class="err">${esc(s.error)}</pre>` : '';
        const meta = s.meta && Object.keys(s.meta).length ? `<pre class="meta">${esc(JSON.stringify(s.meta, null, 2))}</pre>` : '';
        const shot = s.screenshot ? `<img src="${esc(s.screenshot)}" alt="screenshot"/>` : '';
        return `
      <details class="step ${s.status}">
        <summary>
          <span class="status">${esc(s.status?.toUpperCase() || '')}</span>
          <span class="name">${esc(s.name)}</span>
          <span class="time">${esc(s.startedAt)} → ${esc(s.finishedAt || '')}</span>
        </summary>
        ${err}
        ${meta}
        ${shot}
      </details>`;
      })
      .join('');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Report - ${esc(flowName)}</title>
  <style>
    :root{ --ok:#22c55e; --err:#ef4444; --skip:#a3a3a3; --bd:#e5e7eb; --fg:#111827; --muted:#6b7280; --bg:#ffffff; --code-bg:#0b1020; --code-fg:#e5e7eb; }
    *{box-sizing:border-box} body{font-family:ui-sans-serif,system-ui,'Segoe UI',Arial,sans-serif;margin:24px;color:var(--fg);background:var(--bg)}
    h1{margin:0 0 12px} .summary{color:var(--muted);margin-bottom:16px}
    .step{border:1px solid var(--bd);border-radius:8px;margin:12px 0;padding:8px;background:#fff} .step>summary{cursor:pointer;font-weight:600;outline:none}
    .step.passed{border-left:4px solid var(--ok)} .step.failed{border-left:4px solid var(--err)} .step.skipped{border-left:4px solid var(--skip)}
    .status{display:inline-block;width:90px} .name{margin-left:8px} .time{float:right;color:var(--muted);font-weight:400}
    pre{background:var(--code-bg);color:var(--code-fg);padding:10px;border-radius:6px;overflow:auto;margin:10px 0 0}
    img{max-width:100%;margin-top:10px;border:1px solid var(--bd);border-radius:4px}
    @media (prefers-color-scheme: dark) { :root { --bg:#0b0f19; --fg:#e5e7eb; --bd:#374151; --muted:#9ca3af; } .step{background:#111827} }
  </style>
</head>
<body>
  <h1>Run Report</h1>
  <div class="summary"><b>Flow:</b> ${esc(flowName)} &nbsp; <b>Generated:</b> ${esc(new Date().toLocaleString())}</div>
  ${rows}
</body>
</html>`;
  }
}

// utils
function toErrorString(err: unknown): string {
  if (!err) return '';
  const anyErr: any = err as any;
  if (anyErr?.stack) return String(anyErr.stack);
  if (anyErr?.message) return String(anyErr.message);
  try { return JSON.stringify(err); } catch { return String(err); }
}
function inlineCode(s: string) { return s.replace(/`/g, '\`'); }
function safeIsClosed(page: Page): boolean { try { return page.isClosed(); } catch { return true; } }
function sanitizeFile(s: string): string { return s.replace(/[^a-z0-9\-_.]+/ig, '_').slice(0, 120); }
