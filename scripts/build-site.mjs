#!/usr/bin/env node
// Assembles the GitHub Pages site into ./_site (pages at the root, evidence under evidence/) and fails on any broken local link.
import { cpSync, rmSync, writeFileSync, readFileSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '_site'), DOCS = join(ROOT, 'documents/contextsutra');
rmSync(OUT, { recursive: true, force: true });
cpSync(join(DOCS, 'html'), OUT, { recursive: true });
cpSync(join(DOCS, 'evidence'), join(OUT, 'evidence'), { recursive: true });
for (const f of ['llms.txt', 'compatibility-matrix.json']) copyFileSync(join(ROOT, f), join(OUT, f));
writeFileSync(join(OUT, '.nojekyll'), '');
const rewrite = (file, from, to) => writeFileSync(file, readFileSync(file, 'utf8').replaceAll(from, to));
for (const f of readdirSync(OUT).filter(f => f.endsWith('.html'))) rewrite(join(OUT, f), 'href="../evidence/', 'href="evidence/');
rewrite(join(OUT, 'evidence/index.html'), '../html/', '../');

const broken = [];
const pages = [...readdirSync(OUT).filter(f => f.endsWith('.html') && f !== '404.html'), 'evidence/index.html'];
for (const page of pages) {
  const html = readFileSync(join(OUT, page), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  for (const [, url] of html.matchAll(/<(?:a|link|script)\b[^>]*?(?:href|src)="([^"]+)"/g)) {
    if (/^(?:[a-z]+:|\/)/i.test(url)) continue;
    const [file, hash] = url.split('#');
    const target = file ? join(OUT, dirname(page), file) : join(OUT, page);
    if (!existsSync(target)) broken.push(`${page} -> ${url}`);
    else if (hash && target.endsWith('.html') && !readFileSync(target, 'utf8').includes(`id="${hash}"`)) broken.push(`${page} -> ${url} (anchor)`);
  }
}
if (broken.length) { console.error('Broken links:\n' + broken.join('\n')); process.exit(1); }
console.log(`site built at _site; ${pages.length} pages, no broken local links`);
