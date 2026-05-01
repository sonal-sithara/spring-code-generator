#!/usr/bin/env bash
# PostToolUse hook: run lint + compile after edits to src/**/*.ts
# Catches @typescript-eslint warnings and tsc strict-mode errors immediately.

set -euo pipefail

file_path=$(python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))")

case "$file_path" in
  */src/*.ts)
    cd "$CLAUDE_PROJECT_DIR"
    yarn run lint --quiet
    yarn run compile
    ;;
esac
