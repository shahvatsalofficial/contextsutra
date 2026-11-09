#!/usr/bin/env sh
set -eu
PROJECT_ROOT="${1:-$(pwd)}"
HOST="${2:-generic}"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
node "$SCRIPT_DIR/../packages/cli/index.mjs" install --root "$PROJECT_ROOT" --host "$HOST"
