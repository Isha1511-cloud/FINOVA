#!/usr/bin/env bash
# Builds, serves and runs the browser smoke tests (demo mode). Needs: pip install playwright && playwright install chromium
set -e
cd "$(dirname "$0")/.."
npx vite build >/dev/null
VITE_DEMO_INSIGHT_SAVE=true npx vite build --outDir dist-save >/dev/null
npx vite preview --port 4173 >/tmp/preview.log 2>&1 &
P1=$!
npx vite preview --outDir dist-save --port 4174 >/tmp/preview-save.log 2>&1 &
P2=$!
trap "kill $P1 $P2 2>/dev/null" EXIT
for i in $(seq 1 30); do curl -sf localhost:4173 >/dev/null && curl -sf localhost:4174 >/dev/null && break; sleep 0.5; done
node scripts/verify-contract.mjs
python3 tests/smoke.py
python3 tests/smoke_save.py
