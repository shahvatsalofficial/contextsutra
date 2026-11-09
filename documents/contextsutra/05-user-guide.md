# 05. User guide

## 60-second start

```bash
npx contextsutra demo --out contextsutra-demo
```

Open `contextsutra-demo/report.html` in a browser. You have just scanned the bundled sample repository and produced a capsule, a Claude-ready hand-off and a human report. Nothing left your machine.

## Use it on your own project

```bash
cd your-project
npx contextsutra scan --root . --out .contextsutra/capsule.json
npx contextsutra review --capsule .contextsutra/capsule.json
npx contextsutra report --capsule .contextsutra/capsule.json --root . --out .contextsutra/report
npx contextsutra render --capsule .contextsutra/capsule.json --host claude --out .contextsutra/handoff.md
```

Add `.contextsutra/` to your `.gitignore`. Open `.contextsutra/report/report.html` and **read it before sharing anything**.

## Check that context is still fresh

```bash
npx contextsutra verify --root . --capsule .contextsutra/capsule.json
```

`CURRENT` means every captured document still matches. `STALE` lists what changed or is new; rescan and use `diff` to see the delta. Exit code 2 makes this easy to use in CI.

## Fit a small context window

```bash
npx contextsutra render --capsule .contextsutra/capsule.json --host cursor --budget 4000 --out handoff.md
```

Instruction files and ADRs are kept first. The output says what was omitted.

## Install the skills

```bash
npx contextsutra install --root . --host cursor
npx contextsutra doctor --root .
```

`install` refuses to overwrite existing files; add `--force` only after looking at them. Then reload your IDE and invoke a skill the way that IDE documents. ContextSutra cannot tell whether the IDE loaded it.

## Reading the results

| You see | It means | You do |
|---|---|---|
| `HUMAN_REVIEW_REQUIRED` | No residual secret pattern found; a person must still read it | Read the capsule |
| `BLOCK` | A secret-like or instruction-like string survived | Fix the source, rescan |
| `STALE` | A document changed, vanished or was added | Rescan, run `diff` |
| `quarantinedLines > 0` | Lines that looked like instructions to an AI were withheld | Check why they are in your docs |
| `approved: false` on a decision | No explicit accepted status | Ask a maintainer |

## Do and do not

- Do review output before sharing.
- Do keep capsules out of Git.
- Do not treat a green result as proof of safety.
- Do not expect it to find personal data, customer names or internal URLs.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `--capsule is required` | Pass the file path after the flag |
| `Already exists ... rerun with --force` | Compare the files, then add `--force` if intended |
| `Refusing to install through symlink` | Replace the symlinked directory with a real one |
| `Capsule integrity digest mismatch` | The file was edited; rescan |
| Scan finds 0 sources | No README, AGENTS, CLAUDE, ADR or similar file at the allowed paths |
