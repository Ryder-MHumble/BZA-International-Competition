#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

export API_PORT="${API_PORT:-3000}"
export HOST="${HOST:-127.0.0.1}"
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://127.0.0.1:3000}"

cleanup() {
  kill 0 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "[1/3] starting backend on ${HOST}:${API_PORT}"
npm run dev:backend &

echo "[2/3] starting public site on 127.0.0.1:5173"
npm run dev:public &

echo "[3/3] starting admin console on 127.0.0.1:5174"
npm run dev:admin &

wait
