export type TemplateContext = { vars: Record<string, any>; steps: Record<string, any>; env: Record<string, string|undefined>; now: Date; };
const TOKEN = /\$\{([^}]+)\}/g;

// Resolve ${...} placeholders inside strings/arrays/objects.
// Supported forms:
//  - ${steps.<id>.<field>}
//  - ${vars.<name>}
//  - ${env.ENV_NAME}
//  - ${now:yyyyMMdd-HHmmss}
//  - ${path|default}
export function resolveTemplates<T>(input: T, ctx: TemplateContext): T {
  if (input == null) return input as any;
  if (typeof input === 'string') return resolveString(input, ctx) as any;
  if (Array.isArray(input)) return input.map(v => resolveTemplates(v, ctx)) as any;
  if (typeof input === 'object') { const out: any = Array.isArray(input) ? [] : {}; for (const [k,v] of Object.entries(input as any)) out[k] = resolveTemplates(v, ctx); return out; }
  return input;
}

function resolveString(s: string, ctx: TemplateContext): string {
  return s.replace(TOKEN, (_, raw) => {
    const expr = String(raw).trim();
    if (expr.startsWith('now:')) return formatDate(ctx.now, expr.slice(4));
    if (expr.startsWith('env.')) return String(ctx.env[expr.slice(4).trim()] ?? '');
    const [pathExpr, def] = splitDefault(expr);
    const val = getByPath(ctx, pathExpr);
    if (val === undefined || val === null || val === '') return def ?? '';
    return String(val);
  });
}

function splitDefault(expr: string): [string, string|undefined] { const i = expr.indexOf('|'); return i===-1 ? [expr, undefined] : [expr.slice(0,i).trim(), expr.slice(i+1)]; }
function getByPath(ctx: TemplateContext, p: string): any { const segs = p.split('.').map(x=>x.trim()).filter(Boolean); if (!segs.length) return undefined; let root: any; if (segs[0]==='vars') root=ctx.vars; else if (segs[0]==='steps') root=ctx.steps; else return undefined; let cur=root; for (let i=1;i<segs.length;i++){ if (cur==null) return undefined; cur=cur[segs[i]]; } return cur; }
function formatDate(d: Date, fmt: string): string { const pad=(n:number,w=2)=>String(n).padStart(w,'0'); const map:Record<string,string>={ yyyy:String(d.getFullYear()), MM:pad(d.getMonth()+1), dd:pad(d.getDate()), HH:pad(d.getHours()), mm:pad(d.getMinutes()), ss:pad(d.getSeconds()) }; return fmt.replace(/yyyy|MM|dd|HH|mm|ss/g, m=>map[m]); }
