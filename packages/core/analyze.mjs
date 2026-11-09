import {SECRET_PATTERNS, hasInjection} from './guards.mjs';
import {validateCapsule} from './capsule.mjs';

const need = c => { const v = validateCapsule(c); if (!v.valid) throw new Error('Invalid capsule: ' + v.errors.join('; ')); return c; };
const APPROVED = new Set(['accepted', 'approved']);
const ATTENTION = new Set(['deprecated', 'superseded', 'rejected', 'proposed', 'draft']);

// Decision register. A decision is "approved" only when the source declares an explicit accepted/approved status.
export function decisions(c) {
  need(c);
  return c.sources.filter(s => s.decisions.length || /(^|\/)(adr|decisions)\b/i.test(s.path)).map(s => ({
    path:s.path, status:s.adrStatus ?? 'unstated', approved:APPROVED.has(s.adrStatus), needsAttention:!s.adrStatus || ATTENTION.has(s.adrStatus),
    evidence:s.decisions.map(d => ({line:d.line, text:d.text}))
  }));
}

// Task index. Every task stays "unverified-repository-note": a checkbox is a claim, not proof of work.
export function tasks(c) {
  need(c);
  return c.sources.flatMap(s => s.tasks.map(t => ({path:s.path, line:t.line, done:Boolean(t.done), text:t.text, provenance:t.provenance})));
}

// Heuristic contradiction finder. It reports candidates for a human; it never decides which instruction wins.
export function conflicts(c) {
  need(c);
  const out = [];
  const instr = c.sources.filter(s => /(^|\/)(AGENTS|CLAUDE|GEMINI|CONTRIBUTING|README)\.md$/i.test(s.path) && s.tooling?.packageManagers?.length);
  const all = new Set(instr.flatMap(s => s.tooling.packageManagers));
  if (all.size > 1) out.push({kind:'package-manager', severity:'medium', detail:`Docs recommend different package managers: ${[...all].sort().join(', ')}.`, sources:instr.map(s => ({path:s.path, packageManagers:s.tooling.packageManagers})), question:'Which package manager is canonical for this repository?'});
  const num = new Map();
  for (const s of c.sources) { const m = /(?:^|\/)(?:adr[-_ ]?)?(\d{3,4})[-_]/i.exec(s.path); if (m && /adr|decision/i.test(s.path)) num.set(m[1], [...(num.get(m[1]) ?? []), s.path]); }
  for (const [n, files] of num) if (files.length > 1) out.push({kind:'duplicate-adr-number', severity:'medium', detail:`ADR number ${n} is used by ${files.length} files.`, sources:files.map(path => ({path})), question:'Renumber or confirm which ADR is current.'});
  for (const s of c.sources) if (s.adrStatus && ATTENTION.has(s.adrStatus) && s.adrStatus !== 'proposed' && s.adrStatus !== 'draft') out.push({kind:'non-current-decision', severity:'low', detail:`${s.path} is declared ${s.adrStatus}; confirm nothing still follows it.`, sources:[{path:s.path}], question:'Is any code or doc still following this decision?'});
  const files = c.sources.filter(s => /(^|\/)(AGENTS|CLAUDE|GEMINI)\.md$/i.test(s.path));
  if (files.length > 1) out.push({kind:'multiple-instruction-files', severity:'info', detail:`Instruction files present: ${files.map(f => f.path).join(', ')}. ContextSutra does not rank them.`, sources:files.map(f => ({path:f.path})), question:'Confirm these agree; if they differ, record which one your organisation treats as authoritative.'});
  return out;
}

// Privacy review gate. It can BLOCK on residual secret-like text, but it can never certify a capsule as safe.
export function review(c) {
  need(c);
  const leaks = [];
  const walk = (v, where) => {
    if (typeof v === 'string') { if (SECRET_PATTERNS.some(re => re.test(v)) || hasInjection(v)) leaks.push(where); }
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${where}.${k}`);
  };
  walk(c.sources, 'sources'); walk(c.project, 'project');
  const perSource = c.sources.filter(s => s.redactions || s.quarantinedLines?.length).map(s => ({path:s.path, redactedLines:s.redactions, quarantinedLines:s.quarantinedLines ?? []}));
  return {
    gate:leaks.length ? 'BLOCK' : 'HUMAN_REVIEW_REQUIRED',
    residualFindings:leaks,
    redactedLines:c.privacy.redactedLines, quarantinedLines:c.privacy.quarantinedLines ?? 0, perSource,
    checklist:['Open the capsule JSON and read every excerpt.', 'Confirm no customer data, personal data or internal URLs appear.', 'Confirm redaction counts match what you expect.', 'Share only with tools and people you are authorised to share with.'],
    note:'Regex redaction is best effort. This gate can block, but it never certifies a capsule as safe.'
  };
}
