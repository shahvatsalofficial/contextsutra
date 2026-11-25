#!/usr/bin/env node
// Builds the documentation website into documents/contextsutra/html from the Markdown beside it. Dependency-free.
// Light theme by default; dark by toggle (remembered). Usage: node scripts/build-docs.mjs [--check]
// Markdown directives (HTML comments, invisible on GitHub): <!--svg:name--> <!--flow:name--> <!--chart:name-->
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { figure } from '../documents/site/diagrams.mjs';
import { esc, inline, mdToHtml, sprite, ic } from '../documents/site/markdown.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MD = path.join(ROOT, 'documents/contextsutra'), OUT = path.join(MD, 'html'), ASSETS = path.join(ROOT, 'documents/site');
const GH = 'https://github.com/shahvatsalofficial/contextsutra';
export const SITE = 'https://shahvatsalofficial.github.io/contextsutra';
const NPM = 'https://www.npmjs.com/package/contextsutra';
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
const V = JSON.parse(read('package.json')).version;
const tests = JSON.parse(read('documents/contextsutra/evidence/test-summary.json'));
const audit = JSON.parse(read('documents/contextsutra/evidence/samples/audit/audit.json'));

const GROUPS = [
  ['Start here', ['01-executive-summary', '05-user-guide', '15-real-world-scenarios', '11-faq-and-glossary']],
  ['Reference', ['02-functional-specification', '04-technical-reference', '06-skills-catalog']],
  ['Design and trust', ['03-architecture', '07-security-and-legal', '08-testing-and-evidence', '09-audit-and-trust', '14-architecture-decisions']],
  ['Project', ['10-ci-cd-and-release', '12-contributor-handbook', '13-roadmap-and-status']],
];
const ORDER = GROUPS.flatMap(g => g[1]);
const title = raw => (raw.match(/^#\s+(.+)$/m)?.[1] ?? '').replace(/^\d+\.\s*/, '');

// ---------- charts and flows ----------
const bars = rows => `<div class="bars">${rows.map(([l, v, max]) => `<div class="bar"><span class="lab">${esc(l)}</span><div class="trk"><div class="fill ok" style="width:${Math.max(3, Math.round(100 * v / max))}%"></div></div><span class="val">${v}</span></div>`).join('')}</div>`;
const chart = (head, body, note) => `<figure class="chart"><h4>${esc(head)}</h4>${body}<p class="note">${esc(note)}</p></figure>`;
const part = (n, c) => `<i style="width:${100 * n / tests.tests}%;background:var(${c})"></i>`;
const CHARTS = {
  tests: () => chart(`${tests.tests} tests`, `<div class="stack" role="img" aria-label="${tests.pass} passed, ${tests.skipped} skipped, ${tests.fail} failed">${part(tests.pass, '--ok')}${part(tests.skipped, '--warn')}${part(tests.fail, '--bad')}</div><p class="legend"><span><b style="background:var(--ok)"></b>${tests.pass} passed</span><span><b style="background:var(--warn)"></b>${tests.skipped} skipped (symlink tests on Windows)</span><span><b style="background:var(--bad)"></b>${tests.fail} failed</span></p>`, 'From a recorded Windows run in the evidence folder. Linux and macOS results come from public CI.'),
  audit: () => { const max = Math.max(...audit.categories.map(c => c.total)); return chart(`${audit.passed} of ${audit.total} self-audit checks passed`, bars(audit.categories.map(c => [c.category, c.passed, max])), 'The self-audit runs in the same process as the code it checks. It is not an independent attestation.'); },
};
const flow = items => `<ol class="flow">${items.map(x => { const k = x.match(/\s*\{(ok|warn|bad)\}\s*$/); const t = k ? x.slice(0, k.index) : x; const m = t.match(/^\*\*(.+?)\*\*\s*(.*)$/); if (!m) throw new Error('Flow step needs a **title**: ' + x); return `<li class="${k?.[1] ?? ''}"><b>${inline(m[1])}</b>${m[2] ? `<span>${inline(m[2])}</span>` : ''}</li>`; }).join('')}</ol>`;
const ctx = {
  directive(kind, name, body) {
    if (kind === 'flow') return flow(body);
    if (kind === 'svg') return figure(name);
    if (!CHARTS[name]) throw new Error('Unknown chart ' + name);
    return CHARTS[name]();
  },
};

// ---------- page shell ----------
const themeInit = `try{var t=localStorage.getItem('contextsutra-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light')}catch(e){document.documentElement.setAttribute('data-theme','light')}`;
const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%234338ca'/%3E%3Ctext x='16' y='22' font-size='15' font-family='Arial' font-weight='700' fill='white' text-anchor='middle'%3ECS%3C/text%3E%3C/svg%3E";
const head = (t, desc, file) => { const canon = `${SITE}/${file === 'index.html' ? '' : file}`; return `<!DOCTYPE html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t)}</title><meta name="description" content="${esc(desc)}"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#4338ca"><meta name="author" content="Vatsal Shah"><link rel="canonical" href="${canon}"><meta property="og:title" content="${esc(t)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:site_name" content="ContextSutra AI"><meta property="og:url" content="${canon}"><meta name="twitter:card" content="summary"><link rel="icon" href="${icon}"><script>${themeInit}</script><link rel="stylesheet" href="assets/site.css">`; };
const brand = href => `<a class="brand" href="${href}"><span class="logo" aria-hidden="true">CS</span><span class="brand-name">Context<b>Sutra</b> AI</span></a>`;
const NAV = [['05-user-guide', 'Guide'], ['15-real-world-scenarios', 'Scenarios'], ['03-architecture', 'Architecture'], ['08-testing-and-evidence', 'Proof'], ['04-technical-reference', 'Reference']];
const topbar = cur => `<header class="topbar"><div class="topbar-in"><button class="icon-btn menu-btn" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="sidebar">${ic('menu')}</button>${brand('index.html')}<span class="ver">v${V}</span>
<nav class="topnav" aria-label="Primary">${NAV.map(([s, t]) => `<a href="${s}.html"${cur === s ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
<div class="search" role="search">${ic('search', 18)}<label class="sr" for="q">Search the documentation</label><input id="q" type="search" placeholder="Search docs" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="results"><kbd aria-hidden="true">/</kbd><ul id="results" role="listbox" hidden></ul></div>
<a class="icon-btn gh" href="${GH}" rel="noopener" aria-label="ContextSutra AI on GitHub">${ic('code')}</a>
<button class="icon-btn theme-btn" type="button" aria-pressed="false" aria-label="Switch to dark theme"><svg class="ic i-sun" width="20" height="20" aria-hidden="true"><use href="#i-sun"/></svg><svg class="ic i-moon" width="20" height="20" aria-hidden="true"><use href="#i-moon"/></svg></button></div></header>`;
const col = (t, links) => `<div><p class="foot-title">${t}</p><ul>${links.map(([u, l]) => `<li><a href="${u}">${l}</a></li>`).join('')}</ul></div>`;
const footer = () => `<footer class="site-foot"><div class="foot-in"><div class="foot-brand">${brand('index.html')}<p>Know your code. Keep your context. Build anywhere.</p><p class="fine">Created by Vatsal Shah. Apache-2.0.</p></div>
${col('Start', [['01-executive-summary.html', 'Overview'], ['05-user-guide.html', 'User guide'], ['15-real-world-scenarios.html', 'Scenarios']])}${col('Reference', [['04-technical-reference.html', 'Technical reference'], ['06-skills-catalog.html', 'Skills'], ['11-faq-and-glossary.html', 'FAQ']])}${col('Trust', [['07-security-and-legal.html', 'Security and legal'], ['09-audit-and-trust.html', 'Audit'], ['../evidence/index.html', 'Evidence']])}${col('Project', [[GH, 'GitHub'], [NPM, 'npm'], [`${GH}/blob/main/CHANGELOG.md`, 'Changelog']])}</div>
<p class="legal">ContextSutra AI ${V}. Redaction is best effort and the capsule digest is a checksum, not a signature. Not a certification or legal advice. Product names mentioned belong to their owners; no affiliation or endorsement is implied.</p></footer>`;

export function buildDocs() {
  const pages = ORDER.map(slug => { const raw = read(`documents/contextsutra/${slug}.md`); return { slug, raw, title: title(raw) }; });
  const unknown = fs.readdirSync(MD).filter(f => f.endsWith('.md') && f !== 'README.md' && !ORDER.includes(f.slice(0, -3)));
  if (unknown.length) throw new Error(`Markdown files missing from GROUPS: ${unknown.join(', ')}`);
  const plain = md => md.replace(/```[\s\S]*?```/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/[`*#>|_\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
  const index = pages.map(p => ({ t: p.title, u: `${p.slug}.html`, x: plain(p.raw).slice(0, 2500) }));
  const tail = `<script>window.__DOCS_INDEX__=${JSON.stringify(index).replace(/</g, '\\u003c')}</script><script src="assets/site.js" defer></script></body></html>\n`;
  const side = cur => `<aside class="sidebar" id="sidebar" aria-label="Documentation"><a class="nav-home" href="index.html">Home</a>${GROUPS.map(([g, slugs]) => `<div class="nav-group"><p class="nav-title">${g}</p><ol>${slugs.map(s => `<li><a href="${s}.html"${s === cur ? ' aria-current="page"' : ''}>${esc(pages.find(x => x.slug === s).title)}</a></li>`).join('')}</ol></div>`).join('')}</aside><div class="scrim" hidden></div>`;
  const doc = ({ file, name, desc, group, html, toc, current = '', extra = '' }) => {
    const ul = toc.length ? `<ul>${toc.map(t => `<li class="l${t.level}"><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ul>` : '';
    const body = html.replace(/<h1>(?:\d+\.\s*)?/, `<p class="eyebrow">${esc(group)}</p><h1>`);
    return `${head(`${name} · ContextSutra AI`, desc, file)}</head><body><a class="skip" href="#content">Skip to content</a>${sprite}${topbar(current)}<div class="layout">${side(current)}<main class="content" id="content" tabindex="-1"><article class="prose">${ul ? `<details class="toc-m"><summary>On this page</summary>${ul}</details>` : ''}${body}${extra}</article></main><nav class="toc" aria-label="On this page">${ul ? `<h2>On this page</h2>${ul}` : ''}</nav></div>${footer()}${tail}`;
  };

  const out = {};
  pages.forEach((p, n) => {
    const { html, toc } = mdToHtml(p.raw, ctx), prev = pages[n - 1], next = pages[n + 1];
    const desc = plain(p.raw.replace(/^#.*$/m, '')).slice(0, 155);
    const extra = `<p class="edit"><a href="${GH}/blob/main/documents/contextsutra/${p.slug}.md" rel="noopener">Edit this page on GitHub</a></p><nav class="pager" aria-label="Pagination">${prev ? `<a class="prev" href="${prev.slug}.html"><span>Previous</span><b>${esc(prev.title)}</b></a>` : '<span></span>'}${next ? `<a class="next" href="${next.slug}.html"><span>Next</span><b>${esc(next.title)}</b></a>` : '<span></span>'}</nav>`;
    out[`${p.slug}.html`] = doc({ file: `${p.slug}.html`, name: p.title, desc, group: GROUPS.find(g => g[1].includes(p.slug))[0], html, toc, current: p.slug, extra });
  });

  // ---------- home ----------
  const INSTALL = 'npx contextsutra demo';
  const install = cls => `<div class="install${cls}"><span class="prompt" aria-hidden="true">$</span><code>${INSTALL}</code><button class="copy-inline" type="button" aria-label="Copy command">${ic('copy', 16)}<span>Copy</span></button></div>`;
  const mock = `<div class="mock" role="img" aria-label="Example: verify reports a stale capsule after an architecture decision changed"><div class="mock-bar"><i></i><i></i><i></i><span>contextsutra verify</span></div><div class="mock-in"><div class="mock-head"><b>Is my AI context still true?</b><span class="pill bad">STALE</span></div><div class="mock-cards"><div><b>4</b><span>sources</span></div><div><b>1</b><span>changed</span></div><div><b>0</b><span>network calls</span></div></div><ul class="mock-list"><li><span class="pill bad">stale</span> <code>docs/adr/0001-local-storage.md</code></li><li><span class="pill ok">current</span> <code>README.md</code></li><li><span class="pill ok">current</span> <code>AGENTS.md</code></li></ul></div></div>`;
  const feat = [['layers', 'Verifiable capsules', 'One JSON file with the documents captured, a SHA-256 per source and line references. Facts you can trace.'], ['clock', 'Knows when it is stale', 'One command lists changed, removed and newly added documents. Exit code 2 makes it a CI gate.'], ['lock', 'Secrets stay home', 'Secret files are never opened. Secret-looking lines are redacted. A review gate can block sharing.'], ['shield', 'Planted instructions held back', 'Lines that try to steer an AI are quarantined and never rendered. Repository text is always data.'], ['file', 'Decisions you can trust', 'An ADR counts as approved only when its source says so. Tasks stay labelled unverified.'], ['terminal', 'Works with your tools', 'Renders Markdown for any assistant and installs 12 skills for Claude Code, Cursor, Codex, Gemini CLI and Copilot. Host activation is untested.']];
  const scnPage = pages.find(p => p.slug === '15-real-world-scenarios');
  const scn = mdToHtml(scnPage.raw, ctx).toc.filter(t => t.text.startsWith('Scenario '));
  const blurbs = { 1: ['A new teammate and their assistant need the real picture.', 'k-info'], 2: ['The architecture decision moved. The briefing did not.', 'k-warn'], 3: ['A key sits in a README. It must not reach a prompt.', 'k-bad'], 4: ['A document tells the AI to upload secrets.', 'k-bad'], 5: ['Two instruction files disagree. Someone must decide.', 'k-warn'], 6: ['Block merges when shared context goes stale.', 'k-info'] };
  const cards = scn.map((t, i) => `<a class="scard ${blurbs[i + 1][1]}" href="15-real-world-scenarios.html#${t.id}"><span class="snum">${i + 1}</span><h3>${esc(t.text.replace(/^Scenario \d+:\s*/, ''))}</h3><p>${blurbs[i + 1][0]}</p><span class="more">Read the scenario ${ic('arrow', 16)}</span></a>`).join('');
  const faq = [['Does it need an API key or internet?', 'No. It runs offline, uses only Node.js built-ins and calls no model.'], ['Is a capsule safe to share?', 'The tool never says so. It can block, and otherwise asks a human to read it. Redaction is best effort.'], ['How is it different from AGENTS.md or CLAUDE.md?', 'Those are written by hand. A capsule is generated, hashed, line-referenced and checkable for staleness.'], ['Does it work in my IDE?', 'It renders Markdown any tool can read and copies skills to documented folders. Whether each host loads them is not yet verified.'], ['Is the digest a signature?', 'No. It is a checksum that detects edits against a trusted copy.'], ['Can I use it commercially?', 'Yes, under Apache-2.0.']];
  const homeDesc = 'Local-first, keyless CLI that builds verifiable, privacy-aware project context capsules for AI coding assistants and tells you when they go stale.';
  const LD = JSON.stringify({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'ContextSutra AI', applicationCategory: 'DeveloperApplication', operatingSystem: 'Windows, macOS, Linux (Node.js 20+)', softwareVersion: V, license: 'https://www.apache.org/licenses/LICENSE-2.0', author: { '@type': 'Person', name: 'Vatsal Shah' }, url: SITE + '/', codeRepository: GH, description: homeDesc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } });
  const sec = (alt, kicker, h2, sub, body) => `<section class="sec${alt ? ' alt' : ''}"><div class="wrap"><p class="kicker">${kicker}</p><h2>${h2}</h2><p class="sub">${sub}</p>${body}</div></section>`;
  const dia = figure;
  out['index.html'] = `${head('ContextSutra AI · Context your AI assistant can trust', homeDesc, 'index.html')}<script type="application/ld+json">${LD}</script></head><body class="home-page" id="top"><a class="skip" href="#main">Skip to content</a>${sprite}${topbar('')}${side('')}
<main id="main"><section class="hero"><div class="wrap hero-grid"><div><p class="badge"><span class="dot"></span>v${V} · Apache-2.0 · zero dependencies</p><h1>Context your AI can <span class="grad">trust</span>.</h1><p class="lead">ContextSutra turns your repository into a verifiable, privacy-aware context capsule, hands it to any AI coding tool, and tells you the moment it goes stale. Local. Offline. Honest.</p>
<div class="cta"><a class="btn primary" href="05-user-guide.html">Get started ${ic('arrow', 18)}</a><a class="btn" href="15-real-world-scenarios.html">See real scenarios</a></div>${install('')}
<ul class="facts"><li>Node 20+</li><li>No API key</li><li>No network</li><li>MD and HTML reports</li></ul></div><div class="hero-art">${mock}</div></div></section>
<section class="statband" aria-label="Key facts"><div class="wrap"><ul><li><b>${tests.pass}</b><span>tests passing</span></li><li><b>${audit.passed}/${audit.total}</b><span>audit checks</span></li><li><b>12</b><span>portable skills</span></li><li><b>3</b><span>operating systems in CI</span></li><li><b>0</b><span>runtime dependencies</span></li></ul></div></section>
${sec(false, 'The problem', 'AI assistants forget, leak and get misled', 'Pasted READMEs go stale, secrets slip into prompts, and a planted line can steer a model. ContextSutra makes each of those visible before it matters.', `<div class="feat-grid">${feat.map(([i, t, d]) => `<div class="feat"><div class="feat-ic">${ic(i, 22)}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>`)}
${sec(true, 'How it works', 'From repository to trusted hand-off', 'Six steps, all on your machine.', `${dia('pipeline')}<ol class="steps"><li><span class="n">1</span><h3>Scan</h3><p>Capture docs, decisions and tasks.</p><pre class="mini-code"><code>contextsutra scan --root .</code></pre></li><li><span class="n">2</span><h3>Review and render</h3><p>Pass the privacy gate, then export.</p><pre class="mini-code"><code>contextsutra review --capsule …</code></pre></li><li><span class="n">3</span><h3>Verify</h3><p>Check freshness any time.</p><pre class="mini-code"><code>contextsutra verify --capsule …</code></pre></li></ol>`)}
${sec(false, 'Privacy by design', 'What happens to every line', 'Deny first, redact second, quarantine third, and only then quote.', dia('redaction'))}
${sec(true, 'Real-world scenarios', 'Situations you will recognise', 'Each one is a step-by-step flowchart with the exact commands.', `<div class="scn-grid">${cards}</div>`)}
${sec(false, 'Proof, with limits', 'Measured, not promised', 'Numbers come from files generated by a recorded run, and the limits are printed next to them.', `${CHARTS.audit()}${CHARTS.tests()}<p class="cta" style="margin-top:1.2rem"><a class="btn" href="../evidence/index.html">Raw evidence ${ic('arrow', 18)}</a><a class="btn ghost" href="../evidence/samples/audit/audit.html">Open the audit report</a><a class="btn ghost" href="../evidence/samples/demo/report.html">Sample capsule report</a></p>`)}
${sec(true, 'Documentation', 'Everything, in order', 'Executive summary to architecture decisions.', `<div class="dgrid">${GROUPS.map(([g, slugs]) => `<div class="dgroup"><h3>${g}</h3><p>${slugs.length} pages</p><ul>${slugs.map(s => `<li><a href="${s}.html">${esc(pages.find(x => x.slug === s).title)}</a></li>`).join('')}</ul></div>`).join('')}</div>`)}
<section class="sec"><div class="wrap narrow"><p class="kicker center">FAQ</p><h2 class="center">Quick answers</h2>${faq.map(([q, a]) => `<details class="qa"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>
<section class="cta-band"><div class="wrap"><h2>Give your assistant facts, not guesses</h2><p>Free, offline and open source.</p>${install(' on-dark')}<div class="cta center"><a class="btn light" href="${GH}" rel="noopener">View on GitHub</a><a class="btn outline" href="05-user-guide.html">Read the guide</a></div></div></section></main>${footer()}${tail}`;

  out['404.html'] = `${head('Page not found · ContextSutra AI', 'Page not found', '404.html').replace('href="assets/', 'href="/contextsutra/assets/')}</head><body>${sprite}<main class="wrap narrow center" style="padding:5rem 0"><h1>Page not found</h1><p>This context has gone stale.</p><p class="cta center"><a class="btn primary" href="/contextsutra/">Back to the home page</a></p></main><script src="/contextsutra/assets/site.js" defer></script></body></html>\n`;
  out['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['', ...pages.map(p => p.slug + '.html'), 'evidence/index.html'].map(u => `<url><loc>${SITE}/${u}</loc></url>`).join('')}</urlset>\n`;
  out['robots.txt'] = `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`;
  out['assets/site.css'] = read('documents/site/site.css');
  out['assets/site.js'] = read('documents/site/site.js');
  // Evidence page sits beside the raw files, one folder away from the pages, so the layout links get a prefix.
  const shell = doc({ file: 'evidence/index.html', name: 'Evidence', desc: 'Test run, sample outputs and self-audit for ContextSutra AI.', group: 'Proof', html: '__BODY__', toc: [] })
    .replace(/(href|src)="(?![a-z]+:|#|\/|\.\.)([^"]+)"/g, '$1="../html/$2"').replace(/"u":"/g, '"u":"../html/');
  out['../evidence/index.html'] = shell.replace('__BODY__', () => mdToHtml(read('documents/contextsutra/evidence/README.md'), ctx).html.replace(/<h1>/, '<h1 id="evidence">'));
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const built = buildDocs();
  if (process.argv.includes('--check')) {
    const stale = Object.entries(built).filter(([f, c]) => !fs.existsSync(path.join(OUT, f)) || fs.readFileSync(path.join(OUT, f), 'utf8').replace(/\r\n/g, '\n') !== c).map(([f]) => f);
    if (stale.length) { console.error(`Stale docs HTML: ${stale.join(', ')}. Run: npm run docs`); process.exit(1); }
  } else {
    fs.rmSync(OUT, { recursive: true, force: true });
    for (const [f, c] of Object.entries(built)) { fs.mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true }); fs.writeFileSync(path.join(OUT, f), c); }
  }
  console.log(`${process.argv.includes('--check') ? 'Checked' : 'Built'} ${Object.keys(built).length} files`);
}
