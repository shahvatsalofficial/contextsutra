import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {buildCapsule,validateCapsule,checkFreshness,compareCapsules,renderCapsule,digest,CAP_VERSION} from '../packages/core/capsule.mjs';
import {safeFile,redact,isSafeRel,shouldSkipName} from '../packages/core/guards.mjs';
import {makeServer} from '../packages/server/index.mjs';
const repo=path.resolve(import.meta.dirname,'..');
const demo=path.join(repo,'examples/demo-repo');
const tempRepo=(files={})=>{
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'contextsutra-test-'));
 for(const [file,body] of Object.entries(files)){
  const f=path.join(d,file);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,body);
 }
 return d;
};
const cli=(...args)=>spawnSync(process.execPath,[path.join(repo,'packages/cli/index.mjs'),...args],{cwd:repo,encoding:'utf8'});

test('v1 capsule has declared schema and checksum',()=>{const c=buildCapsule(demo);assert.equal(c.schema,CAP_VERSION);assert.equal(c.integrity.digest,digest(c));assert.deepEqual(validateCapsule(c),{valid:true,errors:[]});});
test('demo project metadata is recognized',()=>{const c=buildCapsule(demo);assert.equal(c.project.packageName,'contextsutra-example');assert.ok(c.project.scriptNames.includes('test'));assert.ok(c.scan.fileCount>=4);});
test('safe docs are included',()=>{const c=buildCapsule(demo);assert.ok(c.sources.some(x=>x.path==='README.md'));assert.ok(c.sources.some(x=>x.path==='TASKS.md'));});
test('ADR decision status is captured with line references',()=>{const c=buildCapsule(demo);const adr=c.sources.find(x=>x.path.includes('0001-local-storage'));assert.ok(adr);assert.ok(adr.decisions.some(x=>x.text.includes('accepted')));assert.ok(adr.decisions.every(x=>x.line>0));});
test('tasks remain unverified notes, not verified tickets',()=>{const c=buildCapsule(demo);const t=c.sources.find(x=>x.path==='TASKS.md').tasks;assert.ok(t.length>=2);assert.ok(t.every(x=>x.provenance==='unverified-repository-note'));});
test('sensitive line is redacted from excerpts and tasks',()=>{const d=tempRepo({'README.md':'# Hello\npassword: exampleverysecretpassword\n- [ ] keep this private api_key: SECRETABCDE12345\nPublic note.\n'});const c=buildCapsule(d);const str=JSON.stringify(c);assert.ok(!str.includes('exampleverysecretpassword'));assert.ok(!str.includes('SECRETABCDE12345'));assert.ok(c.privacy.redactedLines>=2);});
test('common credentials and private dirs are skipped',()=>{const d=tempRepo({'README.md':'# Safe','node_modules/x.js':'bad','private/token.txt':'bad','.env':'key','credentials.json':'key','.contextsutra/capsule.json':'{}'});const c=buildCapsule(d);assert.equal(c.scan.fileCount,1);assert.ok(c.scan.ignoredEntries>=4);});
test('invalid relative paths are refused',()=>{assert.equal(isSafeRel('../foo'),false);assert.equal(isSafeRel('/etc/passwd'),false);assert.equal(isSafeRel('doc.md'),true);assert.throws(()=>safeFile(demo,'../outside'),/Invalid/);});
test('symlink source paths are not allowed', {skip:process.platform==='win32'},()=>{const d=tempRepo({'README.md':'# Safe'});fs.symlinkSync(path.join(d,'README.md'),path.join(d,'link.md'));assert.throws(()=>safeFile(d,'link.md'),/Unsafe/);const c=buildCapsule(d);assert.equal(c.scan.symlinksSkipped,1);});
test('known credential patterns identified',()=>{assert.equal(redact('password=someLongPassword123').redacted,1);assert.equal(redact('ghp_0123456789012345678901234567890').redacted,1);assert.equal(redact('This is a normal architecture note').redacted,0);});
test('valid source digest remains current',()=>{const c=buildCapsule(demo);const v=checkFreshness(c,demo);assert.equal(v.status,'CURRENT');assert.equal(v.stale,0);});
test('edits to a source document mark old capsule stale',()=>{const d=tempRepo({'README.md':'# Before'});const c=buildCapsule(d);fs.writeFileSync(path.join(d,'README.md'),'# After');const v=checkFreshness(c,d);assert.equal(v.status,'STALE');assert.equal(v.files[0].status,'STALE');});
test('removed source is marked missing or blocked',()=>{const d=tempRepo({'README.md':'# Before'});const c=buildCapsule(d);fs.unlinkSync(path.join(d,'README.md'));assert.equal(checkFreshness(c,d).files[0].status,'MISSING_OR_BLOCKED');});
test('capsule tampering detected',()=>{const c=buildCapsule(demo);c.project.name='Not real';assert.equal(validateCapsule(c).valid,false);assert.equal(checkFreshness(c,demo).status,'INVALID');});
test('capsule comparison identifies additions, removals and changes',()=>{const d=tempRepo({'README.md':'# One','TODO.md':'# Tasks'});const a=buildCapsule(d);fs.writeFileSync(path.join(d,'README.md'),'# Two');fs.unlinkSync(path.join(d,'TODO.md'));fs.writeFileSync(path.join(d,'AGENTS.md'),'# Conventions');const b=buildCapsule(d);const cmp=compareCapsules(a,b);assert.equal(cmp.status,'CHANGED');assert.deepEqual(cmp.changed,['README.md']);assert.deepEqual(cmp.removed,['TODO.md']);assert.deepEqual(cmp.added,['AGENTS.md']);});
test('comparison without changed files is stable',()=>{const c=buildCapsule(demo);assert.equal(compareCapsules(c,c).status,'SAME');});
test('rendered context marks untrusted source content and digest',()=>{const c=buildCapsule(demo);const text=renderCapsule(c,'claude');assert.match(text,/SECURITY BOUNDARY/);assert.ok(text.includes(c.integrity.digest));assert.match(text,/Target: Claude Code/);});
test('unsupported render host fails explicitly',()=>{assert.throws(()=>renderCapsule(buildCapsule(demo),'unreleased-ide'),/Unsupported host/);});
test('capsule render rejects checksum mismatch',()=>{const c=buildCapsule(demo);c.privacy.redactedLines=999;assert.throws(()=>renderCapsule(c),/digest mismatch/);});
test('CLI help returns operating commands',()=>{const r=cli('--help');assert.equal(r.status,0);assert.match(r.stdout,/scan +--root/);assert.match(r.stdout,/serve +--capsule/);});
test('CLI scan and verify work without keys',()=>{const d=tempRepo({'README.md':'# Demo'}),out=path.join(d,'capsule-output.json');let r=cli('scan','--root',d,'--out',out);assert.equal(r.status,0,r.stderr);r=cli('verify','--root',d,'--capsule',out);assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/CURRENT/);});
test('CLI verify returns nonzero on stale context',()=>{const d=tempRepo({'README.md':'# Before'}),out=path.join(d,'old.json');assert.equal(cli('scan','--root',d,'--out',out).status,0);fs.writeFileSync(path.join(d,'README.md'),'# After');assert.equal(cli('verify','--root',d,'--capsule',out).status,2);});
test('CLI install writes skills to requested host path',()=>{const d=tempRepo();const r=cli('install','--root',d,'--host','claude');assert.equal(r.status,0,r.stderr);assert.ok(fs.existsSync(path.join(d,'.claude/skills/contextsutra-prime/SKILL.md')));assert.equal(JSON.parse(r.stdout).skillCount,12);});
test('CLI install refuses to overwrite without force',()=>{const d=tempRepo();assert.equal(cli('install','--root',d,'--host','cursor').status,0);const r=cli('install','--root',d,'--host','cursor');assert.equal(r.status,1);assert.match(r.stderr,/Already exists/);});
test('CLI install rejects parent symlink escape', {skip:process.platform==='win32'},()=>{const d=tempRepo();fs.symlinkSync(os.tmpdir(),path.join(d,'.claude'));const r=cli('install','--root',d,'--host','claude');assert.equal(r.status,1);assert.match(r.stderr,/symlink/);});
test('CLI render emits a file',()=>{const d=tempRepo({'README.md':'# Example'});const out=path.join(d,'context.json');assert.equal(cli('scan','--root',d,'--out',out).status,0);const md=path.join(d,'handoff.md');assert.equal(cli('render','--capsule',out,'--host','gemini','--out',md).status,0);assert.match(fs.readFileSync(md,'utf8'),/Gemini CLI/);});
test('CLI doctor reports detection without activation claim',()=>{const r=cli('doctor','--root',demo);assert.equal(r.status,0);const doc=JSON.parse(r.stdout);assert.ok(doc.hosts.claude.expectedPath);assert.match(doc.warning,/not proof/);});
test('server rejects missing or short bearer token',()=>{const d=tempRepo({'README.md':'# Demo'});const p=path.join(d,'capsule.json');fs.writeFileSync(p,JSON.stringify(buildCapsule(d)));assert.throws(()=>makeServer({capsulePath:p,token:'short'}),/16/);});
test('server provides health and protects capsule',async()=>{
 const d=tempRepo({'README.md':'# Demo'});const p=path.join(d,'capsule.json');fs.writeFileSync(p,JSON.stringify(buildCapsule(d)));
 const t='TestOnlyLongBearerToken123456789',srv=makeServer({capsulePath:p,token:t});
 await new Promise((resolve,reject)=>srv.listen(0,'127.0.0.1',err=>err?reject(err):resolve()));
 try{
 const base=`http://127.0.0.1:${srv.address().port}`;
 const health=await fetch(base+'/health');assert.equal(health.status,200);
 const denied=await fetch(base+'/capsule');assert.equal(denied.status,401);
 const good=await fetch(base+'/capsule',{headers:{Authorization:'Bearer '+t}});assert.equal(good.status,200);
 const obj=await good.json();assert.equal(obj.schema,CAP_VERSION);
 const post=await fetch(base+'/capsule',{method:'POST'});assert.equal(post.status,405);
 }finally{await new Promise(resolve=>srv.close(resolve));}
});
test('invalid null, array and malformed source records are rejected without crash',()=>{
 assert.equal(validateCapsule(null).valid,false);assert.equal(validateCapsule([]).valid,false);
 const c=buildCapsule(demo);c.sources.push(null);c.integrity.digest=digest(c);assert.equal(validateCapsule(c).valid,false);
});
test('dangerous manifest labels are redacted',()=>{
 const d=tempRepo({'README.md':'# Demo','package.json':JSON.stringify({name:'password=MySecret12345',scripts:{'api_key=SuperSecretXYZ':'echo test'}})});
 const c=buildCapsule(d);assert.ok(!JSON.stringify(c).includes('MySecret12345'));assert.ok(!JSON.stringify(c).includes('SuperSecretXYZ'));
});
