# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build/Test Commands

```bash
yarn install          # Install dependencies (use yarn, not npm)
yarn run compile      # Compile TypeScript to out/
yarn run lint         # Run ESLint on src/
yarn run test         # Run extension tests (requires compile first)
yarn run pretest      # Full check: lint + compile + test
yarn run watch        # Watch mode for development
```

## Critical Architecture Notes

- **Templates location**: Template files are in `out/template/*.txt` (compiled output), NOT in `src/` - they're read at runtime by [`readTemplate()`](src/utils/fileUtils.ts:36)
- **Package extraction**: Java package names are extracted by finding `java/` in the folder path via [`extractPackageName()`](src/utils/fileUtils.ts:25) - folder paths must contain `java/` for correct package detection
- **Template placeholders**: Defined in [`src/constants/index.ts`](src/constants/index.ts) - `package-des`, `TempClassName`, `temp-mapping`, `entityName`, `dataType`, `interfaceName`

## Test Framework

- Uses Mocha with **TDD interface** (not BDD) - see [`src/test/suite/index.ts`](src/test/suite/index.ts:7)
- Tests run via VS Code extension host (`@vscode/test-electron`)
- Test files must match pattern `**/**.test.js` in `out/test/`

## Adding New Templates

1. Create template file: `out/template/{template-name}.txt`
2. Add type to `TEMPLATE_TYPES` in [`src/extension.ts`](src/extension.ts:57)
3. Add command config to `commandConfigs` array in [`src/extension.ts`](src/extension.ts:94)

## Code Style (from ESLint)

- `@typescript-eslint/naming-convention`: warn
- `curly`: warn (always use braces)
- `eqeqeq`: warn (strict equality)
- `no-throw-literal`: warn (throw Error objects, not literals)
