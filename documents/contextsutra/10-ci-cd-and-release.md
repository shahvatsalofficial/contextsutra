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

## Automatic npm publish

`.github/workflows/release.yml` runs on every push to `main`. If the `version` in `package.json` is not on npm yet, it runs the tests, the audit and the docs check, confirms `CHANGELOG.md` has a section for that version, publishes with npm provenance, and creates a GitHub release with the audit reports attached. If the version is already published it does nothing.

One-time setup (trusted publishing, no token):

1. On npmjs.com open the package settings, then **Trusted Publisher**, choose **GitHub Actions**, and enter user `shahvatsalofficial`, repository `contextsutra`, workflow filename `release.yml`, empty environment, and tick **Allow npm publish**.
2. To release: bump `version` in `package.json` and `CITATION.cff`, add a `## X.Y.Z` section to `CHANGELOG.md`, run `npm run docs`, commit, push to `main`.

npm exchanges a short-lived GitHub identity token for publish rights, so no long-lived secret is stored. Requires npm 11.5.1 or newer, which ships with Node 24.
