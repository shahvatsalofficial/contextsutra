#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildCapsule, validateCapsule, checkFreshness, compareCapsules, renderCapsule, HOSTS, VERSION} from '../core/capsule.mjs';
import {decisions, tasks, conflicts, review} from '../core/analyze.mjs';
import {capsuleMarkdown, capsuleHtml} from '../reporters/index.mjs';
import {makeServer} from '../server/index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const args = process.argv.slice(2), cmd = args[0] || 'help';
const val = (flag, def) => { const i = args.indexOf(flag); if (i < 0) return def; const v = args[i + 1]; if (v === undefined || v.startsWith('--')) throw new Error(`${flag} needs a value`); return v; };
const need = flag => { const v = val(flag); if (!v) throw new Error(`${flag} is required (see: contextsutra help)`); return v; };
const has = flag => args.includes(flag);
const root = () => path.resolve(val('--root', process.cwd()));
const getJson = file => { try { return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')); } catch (e) { throw new Error(`Cannot read JSON from ${file}: ${e.message}`); } };
const writeSafe = (file, text) => { const abs = path.resolve(file); fs.mkdirSync(path.dirname(abs), {recursive: true}); fs.writeFileSync(abs, text, 'utf8'); return abs; };
const print = o => console.log(JSON.stringify(o, null, 2));
const fail = (msg, code = 1) => { console.error('ContextSutra: ' + msg); process.exitCode = code; };
const hosts = {claude: '.claude/skills', cursor: '.cursor/skills', codex: '.agents/skills', gemini: '.gemini/skills', copilot: '.github/skills', generic: '.agents/skills'};

const HELP = `ContextSutra AI v${VERSION} — Created by Vatsal Shah
Portable, privacy-aware, evidence-linked project context. No API key. No network.

Capture and check
  scan      --root <dir> [--out <capsule.json>]        Build a context capsule (default .contextsutra/capsule.json)
  verify    --root <dir> --capsule <file>              Check capsule integrity and source freshness (exit 2 if stale)
  validate  --capsule <file>                           Check schema and integrity only
  diff      --old <file> --new <file>                  Compare two capsules

Review and share
  review    --capsule <file>                           Privacy gate: BLOCK or HUMAN_REVIEW_REQUIRED (never "safe")
  render    --capsule <file> [--host <h>] [--budget <chars>] [--out <file.md>]
  report    --capsule <file> [--root <dir>] --out <dir> Human report as report.md and report.html
  decisions --capsule <file>                           Decision register (approved only if status says so)
  tasks     --capsule <file>                           Task notes, always unverified
  conflicts --capsule <file>                           Possible contradictions for a human to resolve

Hosts and trust
  install   --root <dir> --host claude|cursor|codex|gemini|copilot|generic [--force]
  doctor    --root <dir>                               Inspect installed skills (presence and drift; not activation)
  audit     [--out <dir>]                              Self-audit; writes audit.json, audit.md, audit.html
  demo      [--out <dir>]                              Scan the bundled sample repo and write every output
  serve     --capsule <file> [--token-env <VAR>] [--port 8787]   Loopback, token-protected, read-only
  version

Exit codes: 0 ok · 1 error · 2 stale, invalid or audit failure
Hosts for render: ${Object.keys(HOSTS).join(', ')}
Docs: https://github.com/shahvatsalofficial/contextsutra`;

const skillsDir = path.join(repoRoot, 'skills/portable');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

async function main() {
  switch (cmd) {
    case 'help': case '--help': case '-h': console.log(HELP); return;
    case 'version': case '--version': case '-v': console.log(VERSION); return;
    case 'scan': {
      const r = root(), c = buildCapsule(r), out = val('--out', path.join(r, '.contextsutra/capsule.json'));
      const dest = writeSafe(out, JSON.stringify(c, null, 2) + '\n');
      print({status: 'created', path: dest, sources: c.sources.length, files: c.scan.fileCount, redactions: c.privacy.redactedLines, quarantined: c.privacy.quarantinedLines, digest: c.integrity.digest, next: 'Run `contextsutra review` before sharing this file. Add .contextsutra/ to .gitignore.'});
      return;
    }
    case 'verify': { const r = checkFreshness(getJson(need('--capsule')), root()); print(r); if (r.status !== 'CURRENT') process.exitCode = 2; return; }
    case 'validate': { const r = validateCapsule(getJson(need('--capsule'))); print(r); if (!r.valid) process.exitCode = 2; return; }
    case 'diff': print(compareCapsules(getJson(need('--old')), getJson(need('--new')))); return;
    case 'review': { const r = review(getJson(need('--capsule'))); print(r); if (r.gate === 'BLOCK') process.exitCode = 2; return; }
    case 'decisions': print(decisions(getJson(need('--capsule')))); return;
    case 'tasks': print(tasks(getJson(need('--capsule')))); return;
    case 'conflicts': print(conflicts(getJson(need('--capsule')))); return;
    case 'render': {
      const budgetRaw = val('--budget'), budget = budgetRaw === undefined ? Infinity : Number(budgetRaw);
      if (!(budget > 0)) throw new Error('--budget must be a positive number of characters');
      const text = renderCapsule(getJson(need('--capsule')), val('--host', 'generic'), {budget}), out = val('--out', '');
      if (out) console.log('Created ' + writeSafe(out, text)); else console.log(text);
      return;
    }
    case 'report': {
      const c = getJson(need('--capsule')), out = path.resolve(need('--out'));
      const fr = has('--root') ? checkFreshness(c, root()) : undefined;
      writeSafe(path.join(out, 'report.md'), capsuleMarkdown(c, fr)); writeSafe(path.join(out, 'report.html'), capsuleHtml(c, fr));
      print({status: 'created', markdown: path.join(out, 'report.md'), html: path.join(out, 'report.html'), freshness: fr?.status ?? 'not checked'});
      return;
    }
    case 'install': {
      const host = val('--host', 'generic'); if (!(host in hosts)) throw new Error('Invalid host. Choose ' + Object.keys(hosts).join(', '));
      const target = root(), dst = path.join(target, hosts[host]);
      if (!fs.existsSync(skillsDir)) throw new Error('Canonical skills directory not found');
      const resolvedRoot = fs.realpathSync(target);
      const items = fs.readdirSync(skillsDir, {withFileTypes: true}).filter(x => x.isDirectory() && fs.existsSync(path.join(skillsDir, x.name, 'SKILL.md')))
        .map(x => ({source: path.join(skillsDir, x.name, 'SKILL.md'), dest: path.join(dst, x.name, 'SKILL.md')}));
      // Preflight every destination first: no partial installs on collisions or symlink escapes.
      for (const item of items) {
        const rel = path.relative(resolvedRoot, path.resolve(item.dest));
        if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('Skill destination outside requested root');
        let cur = resolvedRoot;
        for (const part of rel.split(path.sep).slice(0, -1)) { cur = path.join(cur, part); if (fs.existsSync(cur) && fs.lstatSync(cur).isSymbolicLink()) throw new Error('Refusing to install through symlink: ' + cur); }
        if (fs.existsSync(item.dest)) {
          if (fs.lstatSync(item.dest).isSymbolicLink()) throw new Error('Refusing to overwrite a symlink');
          if (!has('--force')) throw new Error('Already exists: ' + item.dest + '; rerun with --force after review');
        }
      }
      const done = [];
      try { for (const item of items) { fs.mkdirSync(path.dirname(item.dest), {recursive: true}); fs.copyFileSync(item.source, item.dest); done.push(item); } }
      catch (e) { for (const d of done) fs.rmSync(d.dest, {force: true}); throw new Error('Install failed and was rolled back: ' + e.message); }
      print({host, directory: hosts[host], skillCount: done.length, installed: done.map(d => path.relative(target, d.dest).split(path.sep).join('/')), warning: 'Copying skills does not prove the host loaded or activated them. See compatibility-matrix.json.'});
      return;
    }
    case 'doctor': {
      const r = root(), canon = fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir).filter(n => fs.existsSync(path.join(skillsDir, n, 'SKILL.md'))) : [];
      const found = Object.fromEntries(Object.entries(hosts).map(([h, d]) => {
        const installed = canon.filter(n => fs.existsSync(path.join(r, d, n, 'SKILL.md')));
        const drifted = installed.filter(n => sha(path.join(r, d, n, 'SKILL.md')) !== sha(path.join(skillsDir, n, 'SKILL.md')));
        return [h, {expectedPath: d, present: fs.existsSync(path.join(r, d)), skillsInstalled: installed.length, skillsOutOfDate: drifted, activation: 'untested'}];
      }));
      const cap = path.join(r, '.contextsutra/capsule.json');
      const capsule = fs.existsSync(cap) ? (() => { try { return checkFreshness(JSON.parse(fs.readFileSync(cap, 'utf8')), r).status; } catch { return 'UNREADABLE'; } })() : 'none';
      print({root: r, version: VERSION, node: process.version, os: os.platform(), canonicalSkills: canon.length, capsule, hosts: found, warning: 'Directory and file detection is not proof that any IDE loaded or executed a skill.'});
      return;
    }
    case 'audit': {
      const {runAudit, auditMarkdown, auditHtml} = await import('../audit/audit.mjs');
      const a = await runAudit(), out = val('--out');
      if (out) { writeSafe(path.join(out, 'audit.json'), JSON.stringify(a, null, 2) + '\n'); writeSafe(path.join(out, 'audit.md'), auditMarkdown(a)); writeSafe(path.join(out, 'audit.html'), auditHtml(a)); }
      print({verdict: a.verdict, passed: a.passed, total: a.total, failed: a.failed, failures: a.checks.filter(c => c.status === 'fail').map(c => `${c.id}: ${c.title}`), written: out ? ['audit.json', 'audit.md', 'audit.html'].map(f => path.join(path.resolve(out), f)) : []});
      if (a.verdict !== 'PASS') process.exitCode = 2;
      return;
    }
    case 'demo': {
      const out = path.resolve(val('--out', 'contextsutra-demo')), demo = path.join(repoRoot, 'examples/demo-repo');
      const c = buildCapsule(demo), fr = checkFreshness(c, demo);
      writeSafe(path.join(out, 'capsule.json'), JSON.stringify(c, null, 2) + '\n'); writeSafe(path.join(out, 'claude-context.md'), renderCapsule(c, 'claude'));
      writeSafe(path.join(out, 'report.md'), capsuleMarkdown(c, fr)); writeSafe(path.join(out, 'report.html'), capsuleHtml(c, fr));
      print({status: 'created', directory: out, files: ['capsule.json', 'claude-context.md', 'report.md', 'report.html'], privacyGate: review(c).gate, freshness: fr.status});
      return;
    }
    case 'serve': {
      const envName = val('--token-env', 'CONTEXTSUTRA_SERVER_TOKEN'), token = process.env[envName], port = Number(val('--port', '8787'));
      if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid port');
      const server = makeServer({capsulePath: need('--capsule'), token});
      server.listen(port, '127.0.0.1', () => console.log(`Read-only ContextSutra service on http://127.0.0.1:${server.address().port} (loopback only; token from $${envName})`));
      return;
    }
    default: console.log(HELP); fail('Unknown command ' + cmd);
  }
}
main().catch(e => fail(e.message));
