// Theme-aware inline SVG diagrams. Colours come from CSS variables in site.css, so one SVG serves light and dark.
let uid = 0;
const e = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const svg = (w, h, label, body) => {
  const id = `ah${++uid}`;
  return `<div class="dia-scroll"><svg class="dia" viewBox="0 0 ${w} ${h}" role="img" aria-label="${e(label)}"><defs><marker id="${id}" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path class="ah" d="M0,0 L9,4.5 L0,9 z"/></marker></defs>${body.replaceAll('#AH', `url(#${id})`)}</svg></div>`;
};
const box = (x, y, w, h, t1, t2 = '', cls = '') => `<rect class="bx ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/><text class="t1" x="${x + w / 2}" y="${y + (t2 ? h / 2 - 3 : h / 2 + 5)}" text-anchor="middle">${e(t1)}</text>${t2 ? `<text class="t2" x="${x + w / 2}" y="${y + h / 2 + 15}" text-anchor="middle">${e(t2)}</text>` : ''}`;
const arrow = (d, dash = false) => `<path class="ln${dash ? ' dash' : ''}" d="${d}" marker-end="#AH"/>`;
const txt = (x, y, s, cls = 't2', anchor = 'middle') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${e(s)}</text>`;
const diamond = (cx, cy, w, h, t, cls = '') => `<polygon class="bx ${cls}" points="${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}"/>${txt(cx, cy + 4, t, 't1')}`;

export const DIAGRAMS = {
  pipeline: () => svg(780, 200, 'Pipeline: the repository is scanned, secrets are redacted and instruction-like lines quarantined, a capsule with hashes is written, a human reviews it, it is rendered for an AI tool, and verify later reports whether it is stale.',
    box(8, 60, 112, 70, 'Scan', 'approved folder') + box(140, 60, 112, 70, 'Protect', 'redact, quarantine', 'warn') + box(272, 60, 112, 70, 'Capsule', 'hashes, lines', 'br') + box(404, 60, 112, 70, 'Review', 'human gate', 'br') + box(536, 60, 112, 70, 'Render', 'for your AI tool') + box(668, 60, 104, 70, 'Verify', 'still fresh?', 'ok') +
    arrow('M120 95 H140') + arrow('M252 95 H272') + arrow('M384 95 H404') + arrow('M516 95 H536') + arrow('M648 95 H668') +
    txt(390, 28, 'everything runs on your machine: no network, no API key, no model call') + txt(390, 170, 'when the repository changes, verify says exactly which captured document is stale or new')),

  redaction: () => svg(780, 320, 'Decision flow for each line: secret files are never opened. A line matching a secret pattern is redacted. A line resembling an instruction to an AI is quarantined and only its line number kept. Other lines can become headings, tasks, decisions or excerpts.',
    box(10, 20, 170, 60, 'File name check', '.env, keys, private/', 'br') + box(10, 130, 170, 60, 'Skipped', 'never opened', 'bad') + arrow('M95 80 V130') + txt(104, 108, 'sensitive', 't2', 'start') +
    box(230, 20, 140, 60, 'Read line', 'allowed docs only') + arrow('M180 50 H230') +
    diamond(480, 50, 150, 70, 'Secret?') + arrow('M370 50 H405') + box(620, 20, 150, 60, 'Redact', 'placeholder, count', 'bad') + arrow('M555 50 H620') + txt(588, 42, 'yes') +
    diamond(480, 165, 170, 76, 'Instruction?') + arrow('M480 85 V127') + txt(490, 110, 'no', 't2', 'start') + box(620, 135, 150, 60, 'Quarantine', 'keep line number', 'warn') + arrow('M565 165 H620') + txt(592, 157, 'yes') +
    box(380, 250, 200, 56, 'Capture as quoted data', 'with line reference', 'ok') + arrow('M480 203 V250') + txt(490, 230, 'no', 't2', 'start')),

  lifecycle: () => svg(780, 270, 'Capsule states: a new capsule is CURRENT. Editing, deleting or adding a document makes it STALE. Editing the capsule file makes it INVALID. A rescan creates a new CURRENT capsule, and diff shows what changed.',
    box(40, 90, 170, 70, 'CURRENT', 'matches the repo', 'ok') + box(330, 20, 190, 70, 'STALE', 'doc changed or added', 'warn') + box(330, 170, 190, 70, 'INVALID', 'capsule was edited', 'bad') + box(590, 90, 160, 70, 'Rescan', 'new capsule', 'br') +
    arrow('M210 110 C270 110 270 55 330 55') + arrow('M210 140 C270 140 270 205 330 205') + arrow('M520 55 C560 55 560 110 590 110') + arrow('M520 205 C560 205 560 140 590 140') + arrow('M670 160 V255 H125 V160', true) +
    txt(250, 60, 'repo edit') + txt(250, 200, 'file edit') + txt(400, 266, 'diff old new shows added, removed, changed and decision status changes')),

  trust: () => svg(780, 230, 'Trust boundaries: repository text is untrusted input. ContextSutra reads it with no network and no code execution. Output is written only to paths you choose, and a person decides what is shared.',
    `<rect class="bx zone" x="8" y="20" width="220" height="190" rx="16"/>${txt(118, 44, 'UNTRUSTED INPUT', 't1')}${txt(118, 80, 'README and docs')}${txt(118, 104, 'ADRs and task notes')}${txt(118, 128, 'manifest metadata')}${txt(118, 152, 'planted instructions')}` +
    `<rect class="bx br" x="280" y="20" width="240" height="190" rx="16"/>${txt(400, 44, 'CONTEXTSUTRA', 'tb')}${txt(400, 80, 'no network, no model')}${txt(400, 104, 'never runs your code')}${txt(400, 128, 'skips secrets and symlinks')}${txt(400, 152, 'bounded file sizes')}` +
    `<rect class="bx ok" x="572" y="20" width="200" height="190" rx="16"/>${txt(672, 44, 'YOU DECIDE', 'tg')}${txt(672, 80, 'capsule.json')}${txt(672, 104, 'handoff.md')}${txt(672, 128, 'report .md and .html')}${txt(672, 152, 'who may receive it')}` +
    arrow('M228 115 H280') + arrow('M520 115 H572')),

  arch: () => svg(780, 300, 'Architecture: the CLI uses core capsule, guards and analysis modules, plus reporters, audit and a loopback server. Core never depends on the CLI.',
    box(300, 10, 180, 52, 'CLI', 'packages/cli', 'br') +
    box(10, 120, 140, 60, 'capsule', 'scan, verify, diff') + box(165, 120, 140, 60, 'analyze', 'review, decisions') + box(320, 120, 140, 60, 'reporters', 'MD and HTML') + box(475, 120, 140, 60, 'audit', '47 checks', 'ok') + box(630, 120, 140, 60, 'server', 'loopback only', 'warn') +
    box(90, 230, 180, 54, 'guards', 'paths, secrets', 'warn') +
    arrow('M390 62 V90 H80 V120') + arrow('M390 62 V90 H235 V120') + arrow('M390 62 V120') + arrow('M390 62 V90 H545 V120') + arrow('M390 62 V90 H700 V120') + arrow('M80 180 V205 H150 V230', true) + arrow('M235 180 V205 H200 V230', true) +
    txt(550, 262, 'dependency direction: CLI depends on core, never the reverse')),

  ci: () => svg(780, 250, 'CI gate: on a pull request, contextsutra verify compares the committed capsule with the repository. Exit code 2 means stale and blocks the merge until the capsule is refreshed; otherwise the merge proceeds.',
    box(10, 95, 120, 60, 'Pull request', 'docs changed') + box(170, 95, 150, 60, 'CI job', 'contextsutra verify', 'br') + diamond(420, 125, 130, 90, 'Stale?') +
    box(550, 20, 140, 56, 'Exit 0', 'merge allowed', 'ok') + box(550, 172, 140, 56, 'Exit 2', 'merge blocked', 'bad') + box(702, 172, 72, 56, 'Rescan', 'commit') +
    arrow('M130 125 H170') + arrow('M320 125 H355') + arrow('M420 80 V48 H550') + arrow('M420 170 V200 H550') + arrow('M690 200 H702') + arrow('M738 172 C738 130 260 130 245 155', true) +
    txt(450, 62, 'no', 't2', 'start') + txt(450, 192, 'yes', 't2', 'start')),
};

// Phone layout: the same facts as stacked steps, because a wide SVG is unreadable at 360px. [title, detail, tone]
export const NARROW = {
  pipeline: [['Scan', 'Read the approved folder'], ['Protect', 'Redact secrets, quarantine instructions', 'warn'], ['Capsule', 'Sources with hashes and line numbers'], ['Review', 'A human passes the gate', 'warn'], ['Render', 'Hand-off for your AI tool'], ['Verify', 'Is it still fresh?', 'ok']],
  redaction: [['File name check', 'Secret files such as .env and keys are never opened', 'bad'], ['Read a line', 'Allowed documents only'], ['Looks like a secret?', 'Yes: redact it and count it', 'bad'], ['Looks like an instruction to an AI?', 'Yes: quarantine it, keep only the line number', 'warn'], ['Otherwise', 'Capture as quoted data with a line reference', 'ok']],
  lifecycle: [['CURRENT', 'The capsule matches the repository', 'ok'], ['STALE', 'A document changed, vanished or was added', 'warn'], ['INVALID', 'The capsule file itself was edited', 'bad'], ['Rescan', 'Creates a new CURRENT capsule; diff shows what changed']],
  trust: [['Untrusted input', 'READMEs, ADRs, task notes, manifests, planted instructions', 'warn'], ['ContextSutra', 'No network, no model, never runs your code, skips secrets and symlinks'], ['You decide', 'Capsule, hand-off and reports go where you choose; you choose who receives them', 'ok']],
  arch: [['CLI', 'packages/cli: arguments, files, exit codes'], ['Core', 'capsule: scan, verify, diff. analyze: review, decisions, tasks'], ['Guards', 'Path safety and secret patterns, used by core', 'warn'], ['Outputs', 'reporters (Markdown and HTML), audit, loopback-only server', 'ok']],
  ci: [['Pull request', 'Documents change'], ['CI job', 'contextsutra verify'], ['Stale', 'Exit code 2: merge blocked until rescan', 'bad'], ['Current', 'Exit code 0: merge allowed', 'ok']],
};
export const figure = name => {
  if (!DIAGRAMS[name]) throw new Error('Unknown diagram ' + name);
  return `<figure class="dia">${DIAGRAMS[name]()}<ol class="flow narrow-flow">${NARROW[name].map(([t, d, c]) => `<li class="${c || ''}"><b>${e(t)}</b><span>${e(d)}</span></li>`).join('')}</ol></figure>`;
};
