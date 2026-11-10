# 10. CI/CD and release

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request across Ubuntu and Windows with Node 20, 22 and 24, and macOS with Node 24 (7 jobs; macOS runs Node 24 only). Each job runs:

1. `npm test`
2. `npm run demo`
3. `npm run doctor`
4. `contextsutra audit --out artifacts/audit`
5. `node scripts/build-docs.mjs --check`, which fails when the committed HTML documentation is out of date.

On Node 24 the audit and demo artifacts are uploaded. Permissions are read-only. Actions are pinned by major version.

## Release checklist

1. Update `CHANGELOG.md` and the version in `package.json` and `CITATION.cff`.
2. `npm test`, `npm run audit`, `npm run evidence`, `npm run docs`.
3. Commit, push, and wait for all CI jobs to pass. Do not tag on red.
4. Tag `vX.Y.Z` and create a GitHub release with the audit report attached.
5. `npm pack --dry-run` and check the file list contains no secrets or test artifacts.
6. `npm publish --access public` (requires the maintainer's npm login and 2FA).
7. Verify with `npx contextsutra@X.Y.Z version` from an empty directory.

## Versioning

Semantic Versioning. The capsule schema is versioned separately (`contextsutra.capsule.v1`); a breaking schema change needs a new schema string and a migration note.

## Provenance

Releases are not yet signed. Planned: npm provenance from GitHub Actions and Sigstore signatures.
