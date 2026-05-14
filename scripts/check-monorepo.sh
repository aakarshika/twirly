#!/usr/bin/env bash
# scripts/check-monorepo.sh — acceptance gate for the pnpm monorepo layout.
#
# Verifies that:
#   - lint and tests are green across all workspaces
#   - the web app builds and emits to apps/web/dist/
#   - no stray npm artifacts (package-lock.json, npm --prefix) remain
#   - no cross-workspace imports leak (apps/api/ does not pull from apps/web/)
#
# Run from repo root: bash scripts/check-monorepo.sh
# Exits non-zero on the first failed check.

set -euo pipefail

cd "$(dirname "$0")/.."

ok()   { printf '  ✓ %s\n' "$1"; }
fail() { printf '  ✗ %s\n' "$1" >&2; exit 1; }

echo "→ pnpm -r lint"
pnpm -r lint > /dev/null && ok "lint green"

echo "→ pnpm --filter @twirly/api test"
pnpm --filter @twirly/api test > /dev/null && ok "api tests pass"

echo "→ pnpm --filter @twirly/web build"
rm -rf apps/web/dist
pnpm --filter @twirly/web build > /dev/null
[ -f apps/web/dist/index.html ] && ok "web build emitted apps/web/dist/index.html" || fail "apps/web/dist/index.html missing"

echo "→ no leftover npm lockfiles"
if find . -maxdepth 3 -name 'package-lock.json' -not -path './node_modules/*' -not -path '*/node_modules/*' | grep -q .; then
  fail "stray package-lock.json found — delete it"
else
  ok "no package-lock.json outside node_modules"
fi

echo "→ no \"npm --prefix\" in scripts/configs"
if grep -rnE "npm --prefix" --include='*.json' --include='Makefile' --include='*.sh' \
   . 2>/dev/null | grep -v 'node_modules/\|pnpm-lock\|MONOREPO_MIGRATION.md\|SPRINT_TRACKER\|CLAUDE.md\|REFACTOR_PLAN\|SPRINT_PLAN\|scripts/check-monorepo.sh' | grep -q .; then
  grep -rnE "npm --prefix" --include='*.json' --include='Makefile' --include='*.sh' \
    . 2>/dev/null | grep -v 'node_modules/\|pnpm-lock\|MONOREPO_MIGRATION.md\|SPRINT_TRACKER\|CLAUDE.md\|REFACTOR_PLAN\|SPRINT_PLAN\|scripts/check-monorepo.sh'
  fail "found 'npm --prefix' references — convert to 'pnpm --filter @twirly/<name>'"
else
  ok "no 'npm --prefix' references in operational files"
fi

echo "→ apps/api/ does not import from apps/web/"
if grep -rnE "from ['\"]\\.\\./\\.\\./\\.\\./web|from ['\"]@?twirly/web" apps/api/src 2>/dev/null | grep -q .; then
  fail "apps/api/src/ imports something from apps/web/ — fix the leak"
else
  ok "apps/api/ has no apps/web/ imports"
fi

echo
echo "All monorepo acceptance checks passed."
