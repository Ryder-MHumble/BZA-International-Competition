#!/usr/bin/env sh
set -eu
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
for path in \
  "frontend/public-site/src/main.tsx" \
  "frontend/public-site/src/styles.css" \
  "frontend/admin-console/src/main.tsx" \
  "frontend/admin-console/src/styles.css" \
  "backend/src/server.mjs" \
  "backend/data/catalog.json" \
  "backend/data/dev-db.json" \
  "backend/templates/registration-success-email.txt" \
  "shared/contracts/registration.schema.ts" \
  "docs/08-current-business-rules.md" \
  "docs/source/北京少年人工智能学院-国际AI赛事报名网站.md"
do
  if [ ! -e "$ROOT/$path" ]; then
    echo "Missing required scaffold path: $path" >&2
    exit 1
  fi
done
echo "Project scaffold structure is present."
