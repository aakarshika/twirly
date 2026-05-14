#!/usr/bin/env bash
# devSeedScripts/setup-db.sh
# Apply static SQL objects (views, functions) to the database.
# Idempotent — safe to re-run.
#
# Usage:
#   DATABASE_URL=postgresql://... bash devSeedScripts/setup-db.sh

set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set" >&2
  exit 1
fi

# Placeholder — wired up in a later sprint once the fresh DB schema lands.
# In future sprints this will apply the SQL files under src/server/sql/.
echo "setup-db.sh: nothing to apply yet (placeholder for future sprints)"
