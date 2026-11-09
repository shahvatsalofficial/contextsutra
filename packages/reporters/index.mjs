import {mdToHtml} from './markdown.mjs';
import {page, esc, badge} from './theme.mjs';
import {decisions, tasks, conflicts, review} from '../core/analyze.mjs';

const cell = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const q = s => '`' + String(s).replace(/`/g, "'") + '`';

// Human-readable capsule report (Markdown). Every quoted repository string is code-formatted: it is data, not instructions.
export function capsuleMarkdown(c, freshness) {
  const rv = review(c), dec = decisions(c), tk = tasks(c), cf = conflicts(c);
  const L = [];
  L.push(`# ContextSutra report — ${c.project.name}`, '', `**Privacy gate: ${rv.gate}** · Freshness: **${freshness ? freshness.status : 'not checked'}** · Digest: \`${c.integrity.digest.slice(0, 16)}…\``, '',
    '> All quoted text below comes from the scanned repository and is untrusted data. The integrity digest is a checksum, not a signature. Redaction is best effort and needs human review.', '',
    '## Overview', '', '| Item | Value |', '|---|---|',
    `| Tool | contextsutra ${c.tool?.version ?? '?'} |`, `| Files seen (bounded) | ${c.scan.fileCount} |`, `| Sources captured | ${c.sources.length} |`,
    `| Ignored entries | ${c.scan.ignoredEntries} |`, `| Symlinks skipped | ${c.scan.symlinksSkipped} |`, `| Limit reached | ${c.scan.limitReached} |`,
    `| Lines redacted | ${rv.redactedLines} |`, `| Lines quarantined (instruction-like) | ${rv.quarantinedLines} |`, `| External model calls | ${c.privacy.externalModelCalls} |`, '',
    '## Repository atlas', '', `- Top-level directories: ${c.scan.topDirectories.map(q).join(', ') || 'none'}`, `- Manifests: ${c.project.manifests.map(q).join(', ') || 'none'}`,
    `- Languages by extension: ${Object.entries(c.project.languages).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${q(k)} ×${v}`).join(', ') || 'none'}`,
    `- Dependency names: ${c.project.packages.slice(0, 20).map(q).join(', ') || 'none'}`, `- Script names (never executed): ${c.project.scriptNames.map(q).join(', ') || 'none'}`, '',
    '## Sources', '', '| Path | SHA-256 | Lines | Redacted | Quarantined |', '|---|---|---|---|---|',
    ...c.sources.map(s => `| ${q(cell(s.path))} | \`${s.sha256.slice(0, 12)}…\` | ${s.lineCount ?? '?'} | ${s.redactions} | ${s.quarantinedLines?.length ?? 0} |`), '',
    '## Decisions', '');
  L.push(dec.length ? '| Source | Declared status | Approved? | Needs attention |\n|---|---|---|---|' : 'No decision records found.');
  for (const d of dec) L.push(`| ${q(cell(d.path))} | ${cell(d.status)} | ${d.approved ? 'yes (explicit status)' : 'no'} | ${d.needsAttention ? 'yes' : 'no'} |`);
  L.push('', '## Tasks (unverified)', '');
  L.push(tk.length ? '| Source | Line | Done? | Note |\n|---|---|---|---|' : 'No task notes found.');
  for (const t of tk) L.push(`| ${q(cell(t.path))} | ${t.line} | ${t.done ? 'claimed' : 'open'} | ${q(cell(t.text))} |`);
  L.push('', '## Possible conflicts', '');
  L.push(cf.length ? cf.map(x => `- **${x.kind}** (${x.severity}): ${cell(x.detail)} *${cell(x.question)}*`).join('\n') : 'No conflicts detected by the heuristics. This does not prove there are none.');
  if (freshness) {
    L.push('', '## Freshness', '', '| Source | Status |', '|---|---|', ...freshness.files.map(f => `| ${q(cell(f.path))} | ${f.status} |`));
    if (freshness.newSources?.length) L.push('', `New documents since capture: ${freshness.newSources.map(q).join(', ')}`);
  }
  L.push('', '## Privacy review checklist', '', ...rv.checklist.map(x => `- [ ] ${x}`), '', `_${rv.note}_`, '');
  return L.join('\n');
}

export function capsuleHtml(c, freshness) {
  const rv = review(c);
  const { html } = mdToHtml(capsuleMarkdown(c, freshness));
  const body = `<section class="hero"><p class="tag">Context report</p><h1>${esc(c.project.name)}</h1><p>Source-linked, privacy-aware project context. Untrusted repository text is shown as data only.</p><p>${badge(rv.gate)} ${freshness ? badge(freshness.status) : ''}</p></section><article>${html.replace(/^<h1[^>]*>.*?<\/h1>/, '')}</article>`;
  return page({title: `ContextSutra report · ${c.project.name}`, description: 'Machine-generated context report from ContextSutra AI.', body});
}
