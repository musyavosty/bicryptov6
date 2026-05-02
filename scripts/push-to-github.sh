#!/usr/bin/env bash
# scripts/push-to-github.sh
#
# Push current HEAD to GitHub — triggers Railway auto-deploy.
# Requires GITHUB_PERSONAL_ACCESS_TOKEN in the environment (Replit Secret).
#
# Usage:
#   bash scripts/push-to-github.sh
#   bash scripts/push-to-github.sh "feat: my commit message"

set -euo pipefail

TOKEN="${GITHUB_PERSONAL_ACCESS_TOKEN:-}"
REPO="musyavosty/bicryptov6"
BRANCH="main"

if [[ -z "$TOKEN" ]]; then
  echo "❌  GITHUB_PERSONAL_ACCESS_TOKEN is not set." >&2
  echo "    Add it via Replit Secrets and try again." >&2
  exit 1
fi

MSG="${1:-chore: agent checkpoint}"

# Stage everything and commit (skip if nothing to commit)
git add -A
if git diff --cached --quiet; then
  echo "ℹ️  Nothing new to commit — pushing existing HEAD."
else
  git commit -m "$MSG"
  echo "✅  Committed: $MSG"
fi

# Push using token inline in URL — no permanent remote mutation
git push "https://x-access-token:${TOKEN}@github.com/${REPO}.git" "HEAD:${BRANCH}"

echo ""
echo "🚀  Pushed → github.com/${REPO} (${BRANCH})"
echo "    Railway auto-deploy will start in ~30 seconds."
