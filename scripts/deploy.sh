#!/usr/bin/env bash
# Deploy RoomCraft to Railway via GitHub push (or Railway CLI if RAILWAY_TOKEN is set).
set -euo pipefail

cd "$(dirname "$0")/.."

MESSAGE="${1:-chore: deploy to Railway}"

echo "==> Installing dependencies (if needed)..."
npm install --include=dev --silent

echo "==> Building production bundle..."
npm run build

if [[ -n "$(git status --porcelain)" ]]; then
  echo "==> Committing changes..."
  git add -A
  git commit -m "$MESSAGE"
else
  echo "==> No uncommitted changes."
fi

# Optional: direct Railway CLI deploy when token is configured
if [[ -n "${RAILWAY_TOKEN:-}" ]]; then
  echo "==> Deploying with Railway CLI..."
  npx railway up --detach 2>/dev/null || npx @railway/cli up --detach
  echo "==> Railway CLI deploy submitted."
fi

echo "==> Pushing to GitHub (triggers Railway auto-deploy)..."
git push origin main

echo ""
echo "Deploy triggered. Check your Railway dashboard for build status."
echo "Ensure these variables are set in Railway:"
echo "  VITE_SUPABASE_URL"
echo "  VITE_SUPABASE_ANON_KEY"
