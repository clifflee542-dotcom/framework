import fs from "fs";
import path from "path";
import { Page, chromium } from "playwright";
import { PresetInputProvider, setGlobalInput } from "./input.js";
import { Reporter } from "./report.js";
import { withRetry } from "./retry.js";
import { resolveTemplates } from "./template.js";
import { login } from "../utils.js";
import * as Steps from "../steps/index.js";

type Backoff = "none" | "linear" | "exponential";

type RunOptions = {
  maxRetries?: number;
  retryDelayMs?: number;
  backoff?: Backoff;
  resumeFromReport?: string;
  startAt?: number | string;
  stateIn?: string; // load context before run
  stateOut?: string; // save context after run
  stateOutVarsOnly?: boolean; // only persist vars
};

type StepConfig = {
  id?: string; // alias for cross-step reference
  action: keyof typeof Steps;
  inputs?: Record<string, any>;
  retries?: number; // per-step retries override
  exports?: Record<string, string>; // varName -> path in result (e.g., "$.created_id")
};

type FlowConfig = {
  name: string;
  headless?: boolean;
  baseUrl?: string;
  credentials?: { username: string; password: string };
  run?: RunOptions;
  vars?: Record<string, any>; // initial variables
  steps: StepConfig[];
};

function readJSON<T = any>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}
function writeJSON(p: string, obj: any) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf-8");
}

function get(result: any, pathExpr: string) {
  if (!result) return undefined;
  const p = (pathExpr || "").trim();
  if (!p || p === "$") return result;
  if (!p.startsWith("$.")) return undefined;
  const segs = p.slice(2).split(".").filter(Boolean);
  let cur = result;
  for (const s of segs) {
    if (cur == null) return undefined;
    cur = cur[s];
  }
  return cur;
}

async function runStep(page: Page, action: keyof typeof Steps) {
  const fn = (Steps as any)[action] as (p: Page) => Promise<any>;
  if (!fn) throw new Error(`Unknown action: ${action}`);
  return await fn(page);
}

function resolveStartIndex(
  cfg: FlowConfig,
  reportPath?: string,
  startAt?: number | string
): number {
  if (typeof startAt === "number")
    return Math.max(1, Math.min(cfg.steps.length, startAt));
  if (typeof startAt === "string") {
    const idx = cfg.steps.findIndex((s) => (s.id || s.action) === startAt);
    if (idx >= 0) return idx + 1;
  }
  if (reportPath && fs.existsSync(reportPath)) {
    try {
      const report = readJSON<any>(path.join(reportPath, "report.json"));
      const steps = report.steps as any[];
      let last = -1;
      for (let i = 0; i < steps.length; i++) {
        if (steps[i].status === "passed") last = i;
        else break;
      }
      return last + 2;
    } catch {}
  }
  return 1;
}

let aborted = false;
function wireAbortSignals(cleanup: () => Promise<void>) {
  const onAbort = async (sig: string) => {
    if (aborted) return;
    aborted = true;
    console.log(`
⚠️ Caught ${sig}, exiting safely...`);
    await cleanup();
    process.exit(130);
  };
  process.on("SIGINT", () => onAbort("SIGINT"));
  process.on("SIGTERM", () => onAbort("SIGTERM"));
}

export async function runFlow(flowPath: string) {
  const cfg = readJSON<FlowConfig>(flowPath);
  // CLI overrides
  const iResume = process.argv.indexOf("--resume");
  const cliResume = iResume > 0 ? process.argv[iResume + 1] : undefined;
  const iStartAt = process.argv.indexOf("--startAt");
  const cliStartAt = iStartAt > 0 ? process.argv[iStartAt + 1] : undefined;
  const iStateIn = process.argv.indexOf("--stateIn");
  const cliStateIn = iStateIn > 0 ? process.argv[iStateIn + 1] : undefined;
  const iStateOut = process.argv.indexOf("--stateOut");
  const cliStateOut = iStateOut > 0 ? process.argv[iStateOut + 1] : undefined;

  const browser = await chromium.launch({ headless: cfg.headless ?? true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const outDir = path.join(
    "reports",
    cfg.name + "-" + new Date().toISOString().replace(/[:.]/g, "-")
  );
  const reporter = new Reporter(outDir);

  page.on("close", async () => {
    if (!aborted) {
      aborted = true;
      console.log("Browser page closed, stopping...");
      await reporter.flush(cfg.name);
      await context.close();
      process.exit(0);
    }
  });
  wireAbortSignals(async () => {
    await reporter.flush(cfg.name);
    await context.close();
  });

  const run = cfg.run || {};
  const ctx = {
    vars: { ...(cfg.vars || {}) },
    steps: {} as Record<string, any>,
  };
  const stateIn = cliStateIn || run.stateIn;
  if (stateIn && fs.existsSync(stateIn)) {
    try {
      const loaded = readJSON<any>(stateIn);
      if (loaded?.vars) Object.assign(ctx.vars, loaded.vars);
      if (loaded?.steps) Object.assign(ctx.steps, loaded.steps);
      console.log(`✓ Loaded stateIn: ${stateIn}`);
    } catch (e) {
      console.warn(`⚠️ Failed to read stateIn: ${e}`);
    }
  }

  try {
    // login
    setGlobalInput(
      new PresetInputProvider({
        "login.username":
          cfg.credentials?.username ?? process.env.LOGIN_USERNAME ?? "",
        "login.password":
          cfg.credentials?.password ?? process.env.LOGIN_PASSWORD ?? "",
        "login.baseUrl":
          cfg.baseUrl ??
          process.env.TC_BASE_URL ??
          "http://teamcenter14dev.molex.com:3000/#/showHome",
      })
    );
    const recLogin = reporter.beginStep("login");
    const username = await login(page);
    reporter.addMeta(recLogin, { username });
    await reporter.endStep(recLogin, page, "passed");

    const startIndex = resolveStartIndex(
      cfg,
      cliResume || run.resumeFromReport,
      cliStartAt || run.startAt
    );

    for (const [i, step] of cfg.steps.entries()) {
      const seq = i + 1;
      if (seq < startIndex) continue;
      if (aborted) break;
      const stepId =
        step.id || `${String(seq).padStart(2, "0")}-${step.action}`;
      const rec = reporter.beginStep(stepId);

      const inputsResolved = resolveTemplates(step.inputs || {}, {
        vars: ctx.vars,
        steps: ctx.steps,
        env: process.env,
        now: new Date(),
      });
      setGlobalInput(new PresetInputProvider(inputsResolved as any));

      try {
        const result = await withRetry(() => runStep(page, step.action), {
          maxRetries: step.retries ?? run.maxRetries ?? 0,
          delayMs: run.retryDelayMs ?? 0,
          backoff: (run.backoff as Backoff) ?? "none",
        });
        if (result && typeof result === "object") {
          reporter.addMeta(rec, result);
          ctx.steps[stepId] = result;
        }
        if (step.exports && result) {
          for (const [varName, pathExpr] of Object.entries(step.exports)) {
            const val = get(result, pathExpr);
            if (val !== undefined) ctx.vars[varName] = val;
          }
        }
        await reporter.endStep(rec, page, "passed");
      } catch (e) {
        if (aborted) {
          await reporter.endStep(rec, page, "skipped");
          break;
        }
        await reporter.endStep(rec, page, "failed", e);
        throw e;
      }
    }
  } finally {
    await reporter.flush(cfg.name);
    const stateOut = cliStateOut || run.stateOut;
    if (stateOut) {
      const payload = run.stateOutVarsOnly ? { vars: ctx.vars } : ctx;
      try {
        writeJSON(stateOut, payload);
        console.log(`✓ Wrote stateOut: ${stateOut}`);
      } catch (e) {
        console.warn(`⚠️ Failed to write stateOut: ${e}`);
      }
    }
    await context.close();
    await (await page.context().browser())?.close();
  }
}

if (process.argv.includes("--flow")) {
  const idx = process.argv.indexOf("--flow");
  const p = process.argv[idx + 1];
  if (!p) {
    console.error(
      "Usage: node dist/core/flow.js --flow <path> [--resume <reportDir>] [--startAt <n|id|action>] [--stateIn <file>] [--stateOut <file>]"
    );
    process.exit(1);
  }
  runFlow(p).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
