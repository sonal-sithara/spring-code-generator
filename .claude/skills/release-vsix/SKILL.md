---
name: release-vsix
description: Packages a new VS Code extension release. Bumps the version in package.json, prepends a CHANGELOG entry, runs the full pretest suite (lint + compile + test), and produces a .vsix package via vsce. Use when the user wants to cut a release of spring-code-generator.
disable-model-invocation: true
---

# Release a new .vsix

The user invokes this with `/release-vsix <patch|minor|major>` or `/release-vsix <explicit-version>` (e.g. `3.0.4`).

## Inputs

Parse from `$ARGUMENTS`:
- **Bump kind**: `patch` (default), `minor`, `major`, or an explicit semver like `3.1.0`.
- If no argument is given, default to `patch`.

## Preflight checks

Run these before touching anything. Abort and report on the first failure.

1. `git status --porcelain` must be empty. A release should start from a clean tree. If dirty, ask the user whether to stash, commit, or abort.
2. Current branch should be `master` (or whatever the user confirms). Read `git rev-parse --abbrev-ref HEAD` and warn if not on master.
3. Read `package.json` and capture `version`. Compute the new version from the bump kind.
4. `which vsce` must succeed. If `vsce` is missing, instruct the user to run `npm install -g @vscode/vsce` (or `yarn global add @vscode/vsce`) and stop.
5. Read `CHANGELOG.md` and confirm the heading style (`## [X.Y.Z] - YYYY-MM-DD`). Match it exactly.

## Steps

### 1. Bump version

Edit `package.json` `"version": "<old>"` → `"version": "<new>"`. Use the `Edit` tool.

### 2. Prepend CHANGELOG entry

Ask the user for a one-paragraph summary of the changes (or read from `git log <last-tag>..HEAD --oneline` if they prefer auto-generation). Insert a new section under the top-level heading, above the most recent existing version entry:

```
## [<new-version>] - <today YYYY-MM-DD>

<summary>
```

Use today's date from the environment. Match the existing CHANGELOG voice (concise bullet groups under sub-headings like `### 🐛 Bug Fixes` or `### ✨ New Features`).

### 3. Run pretest

```bash
yarn run pretest
```

This runs lint + compile. Tests via `yarn run test` are not part of `pretest` — ask the user whether to run the full electron test suite (it spawns a VS Code window and is slow). If yes: `yarn run test`. Either way, all chosen steps must pass before continuing.

### 4. Package

```bash
vsce package
```

This produces `spring-code-generator-<new-version>.vsix` in the project root. Confirm the file exists and report its size.

### 5. Stage and report

Do NOT commit, tag, or push automatically. The release is hard-to-reverse once published, so leave that to the user.

Report:
- ✓ Bumped to `<new-version>`
- ✓ Updated CHANGELOG with `<summary>`
- ✓ Lint + compile pass
- ✓ Built `spring-code-generator-<new-version>.vsix` (<size>)
- Suggested next steps:
  - Review with `git diff`
  - `git commit -am "chore: release v<new-version>"`
  - `git tag v<new-version> && git push origin master --tags`
  - `vsce publish` (requires `VSCE_PAT` token) OR upload the `.vsix` manually at https://marketplace.visualstudio.com/manage

## Constraints

- Never run `git commit`, `git tag`, `git push`, or `vsce publish` from this skill — they're irreversible-ish actions that the user must explicitly authorize each time.
- Never use `--no-verify` to bypass lint/compile failures. Fix the underlying issue or abort.
- If `vsce package` warns about missing icons, repository fields, etc., surface the warning verbatim — don't auto-suppress.
- If a `.vsix` for this version already exists, ask before overwriting.
