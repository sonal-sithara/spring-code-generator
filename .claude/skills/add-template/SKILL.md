---
name: add-template
description: Scaffolds a new template-backed command across all six registration points (template file, TEMPLATE_TYPES, COMMANDS, commandConfigs, package.json activationEvents, contributes.commands, contributes.menus). Use when the user wants to add a new code-generation template to the extension.
disable-model-invocation: true
---

# Add a new template

This skill creates a new template-backed command. The user invokes it with `/add-template <ClassName>` (e.g. `/add-template ServiceInterface`).

## Inputs

Parse from `$ARGUMENTS`:
- **PascalCase name** — e.g. `ServiceInterface`. Required.
- **Optional menu group** — second arg, defaults to `service`. One of: `controller`, `service`, `dto`, `repository`, `entity`, `exception`, `mapper`, `config`, `security`, `test`, `batch`, `structure`, `organize`, `documentation`, `advanced`.

If `$ARGUMENTS` is empty, ask the user for the PascalCase name and (optionally) the menu group, then proceed.

## Derived names

From the PascalCase name, derive:
- **kebab-case**: `ServiceInterface` → `service-interface` (template filename, template-type value)
- **TEMPLATE_TYPES key**: `SERVICE_INTERFACE` (UPPER_SNAKE)
- **COMMANDS key**: `CREATE_SERVICE_INTERFACE`
- **command id**: `spring-code-generator.createServiceInterface` (camelCase)
- **menu title**: `Create Service Interface` (split on capitals)

## Steps

Execute in order. Stop on the first failure and report what was done.

### 1. Create the template file

Path: `out/template/{kebab-case}.txt`

Use a minimal Java starter that includes the standard placeholders. Read `src/constants/index.ts` for the canonical placeholder list, then read `out/template/controller.txt` as a reference and produce a similar shape using:
- `package-des` for the package
- `TempClassName` for the class name

If the user gave specific template content in `$ARGUMENTS` (after `--`), use that verbatim instead.

### 2. Patch `src/extension.ts`

Two edits:
- Add `SERVICE_INTERFACE: "service-interface",` to the `TEMPLATE_TYPES` object. Keep alphabetical-ish grouping with similar entries (e.g. service-related entries together).
- Add `CREATE_SERVICE_INTERFACE: "spring-code-generator.createServiceInterface",` to the `COMMANDS` object.
- Add a `{ command: COMMANDS.CREATE_SERVICE_INTERFACE, type: TEMPLATE_TYPES.SERVICE_INTERFACE },` entry to the `commandConfigs` array.

### 3. Patch `package.json`

Three edits:
- Append `"onCommand:spring-code-generator.createServiceInterface"` to `activationEvents`.
- Append `{ "command": "spring-code-generator.createServiceInterface", "title": "Create Service Interface", "category": "Spring Code Generator" }` to `contributes.commands`.
- Append `{ "command": "spring-code-generator.createServiceInterface", "group": "<menu-group>" }` to `contributes.menus["Spring Code Generator"]`.

### 4. Verify

Run `yarn run lint --quiet && yarn run compile`. Both must succeed. If lint or tsc fail, fix the introduced lines (trailing comma, naming-convention) and rerun. Do not proceed past a failure.

### 5. Report

Print a summary:
- ✓ Created `out/template/{kebab-case}.txt`
- ✓ Updated `src/extension.ts` (TEMPLATE_TYPES, COMMANDS, commandConfigs)
- ✓ Updated `package.json` (activationEvents, commands, menus)
- ✓ Lint + compile pass
- Suggested next step: open the new template file and customize the body, then F5 to launch the extension dev host and try the new command.

## Constraints

- Do NOT touch any generator files in `src/generators/` — template-backed commands all flow through the existing `createFile()` registered in the `commandConfigs` loop.
- Do NOT add the command to `contributes.menus` if the user passes `--no-menu` in `$ARGUMENTS`.
- If a command id with the same name already exists in `COMMANDS`, abort with an error (don't silently skip — that hides registration drift).
- Use the `Edit` tool for targeted patches; never rewrite the whole file.
