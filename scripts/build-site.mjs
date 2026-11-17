#!/usr/bin/env node
// Assembles the GitHub Pages site into ./_site: landing page, docs HTML, evidence and sample reports.
// Offline, no dependencies. Run: node scripts/build-site.mjs
import { cpSync, mkdirSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { page } from '../packages/reporters/theme.mjs';
import { mdToHtml } from '../packages/reporters/markdown.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '_site');
const DOCS = join(ROOT, 'documents/contextsutra');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(DOCS, 'html'), join(OUT, 'docs'), { recursive: true });
cpSync(join(DOCS, 'evidence'), join(OUT, 'evidence'), { recursive: true });
for (const f of ['llms.txt', 'compatibility-matrix.json']) copyFileSync(join(ROOT, f), join(OUT, f));
writeFileSync(join(OUT, '.nojekyll'), '');
const ev = mdToHtml(readFileSync(join(DOCS, 'evidence/README.md'), 'utf8').replace(/\r\n/g, '\n')).html;
writeFileSync(join(OUT, 'evidence/index.html'), page({ title: 'Evidence · ContextSutra AI', description: 'Generated test run, samples and audit for ContextSutra AI.', body: `<article>${ev}</article>` }));

const card = (href, title, text) => `<a class="card" href="${href}" style="text-decoration:none;color:inherit"><h3>${title}</h3><p>${text}</p></a>`;
const body = `<section class="hero"><p class="tag">Know your code. Keep your context. Build anywhere.</p><h1>ContextSutra AI</h1>
<p>A local-first, keyless, offline CLI that turns a repository into a verifiable, privacy-aware context capsule, tells you when it goes stale, and ships 12 portable agent skills for Claude Code, Cursor, Codex, Gemini CLI and Copilot.</p></section>
<h2>Get started</h2><pre><code>npx contextsutra demo --out contextsutra-demo</code></pre>
<p>No API key, no network calls, no telemetry, zero dependencies. Apache-2.0, created by Vatsal Shah.</p>
<h2>Explore</h2><div class="grid">
${card('docs/index.html', 'Documentation', 'Executive summary, functional spec, architecture, technical reference, user guide, security and legal.')}
${card('evidence/samples/audit/audit.html', 'Self-audit report', '47 checks with expected and observed values.')}
${card('evidence/samples/demo/report.html', 'Sample capsule report', 'What the report looks like on the bundled demo repository.')}
${card('evidence/', 'Evidence', 'Full test run, exit-code table, redaction proof and drift demo.')}
${card('https://github.com/shahvatsalofficial/contextsutra', 'Source on GitHub', 'Code, issues, releases and CI.')}
${card('https://www.npmjs.com/package/contextsutra', 'npm package', 'npx contextsutra help')}
</div>
<h2>Honest limits</h2><ul><li>Redaction is regex best effort; a human must review every capsule before sharing.</li><li>The integrity digest is a checksum, not a digital signature.</li><li>Host activation in each IDE is untested; see the <a href="compatibility-matrix.json">compatibility matrix</a>.</li></ul>`;
writeFileSync(join(OUT, 'index.html'), page({ title: 'ContextSutra AI', description: 'Local-first, keyless CLI for verifiable, privacy-aware project context capsules and 12 portable agent skills.', body, canonical: 'https://shahvatsalofficial.github.io/contextsutra/' }));
console.log('site built at _site');
