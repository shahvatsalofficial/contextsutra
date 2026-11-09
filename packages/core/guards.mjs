import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_EXCLUDES = new Set([
  '.git','.svn','.hg','node_modules','.venv','venv','__pycache__','.next','.nuxt','.cache',
  '.turbo','dist','build','coverage','target','.idea','.vscode','.contextsutra','.ssh','.aws',
  '.azure','.kube','secrets','private','tmp','.terraform','.pnpm-store','.gnupg','.docker'
]);
export const SENSITIVE_NAMES = /^(?:\.env(?:\..*)?|\.npmrc|\.pypirc|\.netrc|\.git-credentials|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?|credentials(?:\..*)?|secrets?(?:\..*)?|.*\.(?:pem|key|p12|pfx|keystore|jks|sqlite|db|kdbx|tfstate))$/i;
export const SAFE_DOC = /^(README|AGENTS|CLAUDE|GEMINI|ROADMAP|TASKS|TODO|CONTRIBUTING|ARCHITECTURE|DECISIONS|CHANGELOG)\.md$/i;

// Best-effort credential patterns. Regex scanning is NOT a guarantee; a human must review exports.
export const SECRET_PATTERNS = [
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{12,}\b/,
  /\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{12,}\b/,
  /\bnpm_[A-Za-z0-9]{30,}\b/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
  /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{8,}\b/,
  /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/i,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}/,
  /(?:password|passwd|api[_-]?key|client[_-]?secret|private[_-]?key|access[_-]?token|auth[_-]?token|authorization)\s*[:=]\s*["']?\S{4,}/i,
  /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----/
];
export const PEM_BEGIN = /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----/;
export const PEM_END = /-----END (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----/;

// Phrases that try to steer an AI reader. Matching lines are quarantined, never rendered as excerpts.
export const INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+|any\s+)?(?:the\s+)?(?:previous|prior|above|earlier)\s+(?:instructions|rules|prompts?)/i,
  /disregard\s+(?:all\s+|any\s+)?(?:the\s+)?(?:previous|prior|above|system)\s+(?:instructions|rules|prompts?)/i,
  /you\s+are\s+now\s+(?:in\s+)?(?:developer|admin|dan|jailbreak)/i,
  /(?:reveal|print|show|output)\s+(?:your\s+)?(?:system\s+prompt|hidden\s+instructions)/i,
  /(?:send|post|upload|transmit|exfiltrate)\s+.{0,40}(?:secrets?|credentials?|tokens?|\.env|api\s*keys?)\s+(?:to|at)\s/i,
  /(?:curl|wget)\s+\S+\s*\|\s*(?:sh|bash)/i,
  /<\s*\/?\s*(?:system|assistant|tool_call|function_call)\s*>/i,
  /(?:new|updated)\s+instructions?\s*:/i
];

export const isSafeRel = (rel) => typeof rel === 'string' && rel !== '' && !path.isAbsolute(rel) && !/^(?:[A-Za-z]:|[\\/])/.test(rel) &&!rel.split(/[\\/]+/).some(x => x === '..' || x === '.' || !x);
export function safeFile(root, rel) {
  if (!isSafeRel(rel)) throw new Error('Invalid relative file path');
  const resolved = path.resolve(root,rel);
  const realRoot = fs.realpathSync(root);
  const stat = fs.lstatSync(resolved);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Unsafe file type');
  const real = fs.realpathSync(resolved);
  if (real !== realRoot && !real.startsWith(realRoot + path.sep)) throw new Error('File outside root');
  return real;
}
export function shouldSkipName(name) { return DEFAULT_EXCLUDES.has(name) || SENSITIVE_NAMES.test(name); }
export const hasSecret = (text) => SECRET_PATTERNS.some(re => re.test(text));
export const hasInjection = (text) => INJECTION_PATTERNS.some(re => re.test(text));
export function redact(line) {
  if (hasSecret(line)) return { text:'[REDACTED: potentially sensitive line]', redacted:1 };
  if (line.length > 400) return {text:line.slice(0,397)+'...',redacted:0};
  return {text:line,redacted:0};
}
export function sanitizeLines(raw,max=18) {
  let reds=0;
  const lines = raw.split(/\r?\n/).filter(Boolean).slice(0,max).map(x=>{const s=redact(x);reds+=s.redacted;return s.text;});
  return {lines,redactions:reds};
}
