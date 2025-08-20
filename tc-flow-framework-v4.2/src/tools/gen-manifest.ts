import fs from 'fs';
import path from 'path';
import { MANIFEST, StepSpec } from '../steps/manifest.js';

function write(p: string, s: string) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s, 'utf-8'); }

function toMd(manifest: StepSpec[]) {
  const lines: string[] = [];
  lines.push('# Steps Manifest','');
  lines.push('This document lists **inputs** required by each step, indicating required fields, types, examples, and common outputs.');
  lines.push('Reuse outputs via `${steps.<id>.<field>}` or export them into `vars` in your flow.','');
  for (const step of manifest) {
    lines.push(`## ${step.title} (\`${step.action}\`)`,'**Inputs**','- Required fields are marked with **(required)**.','');
    for (const i of step.inputs) {
      const req = i.required ? '**(required)** ' : '(optional) ';
      const note = i.notes ? ` — ${i.notes}` : '';
      const ex = i.example !== undefined ? ` — example: \`${i.example}\`` : '';
      lines.push(`- ${req}\`${i.key}\` — ${i.label} — type: *${i.type || ''}*${ex}${note}`);
    }
    if (step.outputs?.length) { lines.push('', `**Common outputs**: ${step.outputs.map(o=>`\`${o}\``).join(', ')}`, ''); }
  }
  return lines.join('');
}

function catalogToMd(cat: any) {
  const lines: string[] = [];
  lines.push('# Catalog (Enums Index)','', '> Numeric indices used by inputs map to the values below.', '');
  const section = (title: string) => lines.push(`
## ${title}
`);
  const list = (obj: Record<string, string>) => { Object.entries(obj).forEach(([k,v])=>lines.push(`- ${k} => ${v}`)); lines.push(''); };
  if (!cat) { lines.push('_catalog.json not found; run `npm run catalog` first._'); return lines.join(''); }
  if (cat.advancedSearch) { section('advancedSearch'); lines.push('**ADVANCED_QUERY_TYPE**'); list(cat.advancedSearch.ADVANCED_QUERY_TYPE); lines.push('**SEARCH_TYPE**'); list(cat.advancedSearch.SEARCH_TYPE); }
  if (cat.saveAs) { section('saveAs'); lines.push('**SEARCH_TYPE**'); list(cat.saveAs.SEARCH_TYPE); }
  if (cat.submitWorkflow) { section('submitWorkflow'); lines.push('**WORKFLOW_TEMPLATES**'); list(cat.submitWorkflow.WORKFLOW_TEMPLATES); }
  if (cat.runWorkflow) { section('runWorkflow'); lines.push('**Priority**'); list(cat.runWorkflow.Priority); lines.push('**Business_Impact**'); list(cat.runWorkflow.Business_Impact); lines.push('**Plant_Code_for_PCN**'); list(cat.runWorkflow.Plant_Code_for_PCN); }
  if (cat.createChanges) { section('createChanges'); lines.push('**PROBLEM_CHANGE_TYPE**'); list(cat.createChanges.PROBLEM_CHANGE_TYPE); lines.push('**PRIMARY_CHANGE_REASON**'); list(cat.createChanges.PRIMARY_CHANGE_REASON); }
  if (cat.createMechDesign) { section('createMechDesign'); lines.push('**DOCUMENT_TYPE**'); list(cat.createMechDesign.DOCUMENT_TYPE); Object.entries(cat.createMechDesign.DOCUMENT_SUBTYPE || {}).forEach(([k,obj]: any)=>{ lines.push(`**DOCUMENT_SUBTYPE for ${k}**`); list(obj); }); lines.push('**SAP_DOC_TYPES**'); list(cat.createMechDesign.SAP_DOC_TYPES); lines.push('**MOLEX_RESTRICTION**'); list(cat.createMechDesign.MOLEX_RESTRICTION); }
  return lines.join('');
}

(function main(){
  const manifestJson = { generatedAt: new Date().toISOString(), steps: MANIFEST };
  write('flow-manifest.json', JSON.stringify(manifestJson, null, 2));
  // steps-manifest.md
  write('docs/steps-manifest.md', toMd(MANIFEST));
  // combined
  let cat: any = undefined; try { cat = JSON.parse(fs.readFileSync('catalog.json','utf-8')); } catch {}
  const combined = ['# Flow Inputs & Catalog (Combined)','', toMd(MANIFEST),'', catalogToMd(cat)].join('');
  write('docs/inputs-and-catalog.md', combined);
  console.log('✔ Generated docs/steps-manifest.md, docs/inputs-and-catalog.md, flow-manifest.json');
})();
