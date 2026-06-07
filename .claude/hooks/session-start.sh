#!/bin/bash
# SessionStart hook for Claude Code on the web.
# Installs frontend (React/TypeScript) and backend (Python) dependencies so
# that linters, type checks, builds, and tests work in remote sessions.
set -euo pipefail

# Only run automatic setup in the remote (Claude Code on the web) environment.
# Local sessions manage their own environment.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

# --- Frontend: React 18 + TypeScript ---
echo "[session-start] Installing frontend dependencies (npm)..."
cd "$PROJECT_DIR/frontend"
# Use npm install (not ci) so the cached container layer is reused on resume.
npm install --no-audit --no-fund

# --- Backend: Python 3.11 Lambda ---
echo "[session-start] Installing backend dependencies (pip)..."
cd "$PROJECT_DIR/backend"
pip3 install --disable-pip-version-check -r requirements.txt

echo "[session-start] Setup complete."
