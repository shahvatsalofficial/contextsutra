#!/usr/bin/env node
// Builds documents/contextsutra/html/*.html from the Markdown sources. Offline, no dependencies.
// Usage: node scripts/build-docs.mjs [--check]   (--check fails if committed HTML is stale)
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, page } from '../packages/reporters/theme.mjs';
import { mdToHtml, slug, unmd, inline } from '../packages/reporters/markdown.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'documents/contextsutra');
const OUT = join(SRC, 'html');

export function buildDocs() {
  const files = readdirSync(SRC).filter(f => f.endsWith('.md')).sort();
  const docs = files.map(f => {
    const md = readFileSync(join(SRC, f), 'utf8');
    const title = /^#\s+(.*)$/m.exec(md)?.[1] ?? f;
    return { file: f, name: f.replace(/\.md$/, ''), title: unmd(title), md };
  });
  const nav = cur => `<nav aria-label="Documentation">${docs.filter(d => d.name !== 'README').slice(0, 7).map(d => `<a href="${d.name}.html"${d.name === cur ? ' aria-current="page"' : ''}>${esc(d.title.replace(/^\d+\.\s*/, '').split(/[—:–]/)[0].trim())}</a>`).join('')}<a href="index.html"${cur === 'index' ? ' aria-current="page"' : ''}>All docs</a></nav>`;
  const built = {};
  for (const d of docs) {
    if (d.name === 'README') continue;
    const { html, toc } = mdToHtml(d.md);
    const tocHtml = toc.length > 3 ? `<nav class="toc" aria-label="On this page"><strong>On this page</strong><ul>${toc.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('')}</ul></nav>` : '';
    const body = html.replace(/(<\/h1>)/, `$1${tocHtml}`);
    built[`${d.name}.html`] = page({ title: `${d.title} · ContextSutra AI`, description: `${d.title}: ContextSutra AI documentation by Vatsal Shah.`, body: `<article>${body}</article>`, nav: nav(d.name), canonical: "" });
  }
  const cards = docs.filter(d => d.name !== 'README').map(d => {
    const first = d.md.split('\n').find(l => l.trim() && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('|')) ?? '';
    return `<a class="card" href="${d.name}.html" style="text-decoration:none;color:inherit"><h3>${esc(d.title)}</h3><p>${esc(unmd(first)).slice(0, 170)}</p></a>`;
  }).join('');
  const ev = existsSync(join(SRC, 'evidence'));
  built['index.html'] = page({
    title: 'ContextSutra AI documentation', description: 'Complete documentation for ContextSutra AI: executive summary, functional spec, architecture, technical reference, user guide, security, legal, testing evidence and audit.',
    nav: nav('index'), canonical: "",
    body: `<section class="hero"><p class="tag">Know Your Code. Keep Your Context. Build Anywhere.</p><h1>ContextSutra AI documentation</h1><p>Everything needed to understand, use, audit, extend and publish ContextSutra, without asking anyone. Created by Vatsal Shah. Apache-2.0.</p></section><div class="grid">${cards}</div>${ev ? '<h2>Proof</h2><p>Raw evidence lives in <a href="../evidence/">evidence/</a>: the full test run, sample reports in JSON, Markdown, HTML and JUnit, and the self-audit report.</p>' : ''}`
  });
  return built;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const built = buildDocs();
  const check = process.argv.includes('--check');
  mkdirSync(OUT, { recursive: true });
  const stale = [];
  for (const [name, html] of Object.entries(built)) {
    const p = join(OUT, name);
    if (check) { if (!existsSync(p) || readFileSync(p, 'utf8').replace(/\r\n/g, '\n') !== html) stale.push(name); }
    else writeFileSync(p, html);
  }
  const assets = join(SRC, 'assets');
  if (!check && existsSync(assets)) { mkdirSync(join(OUT, 'assets'), { recursive: true }); for (const f of readdirSync(assets)) copyFileSync(join(assets, f), join(OUT, 'assets', f)); }
  if (check && stale.length) { console.error(`Stale docs HTML: ${stale.join(', ')}. Run: node scripts/build-docs.mjs`); process.exit(1); }
  console.log(`${check ? 'Checked' : 'Built'} ${Object.keys(built).length} HTML pages`);
}
