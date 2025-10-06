#!/usr/bin/env bash
set -euo pipefail

# Deploy hosting using a base64-encoded service account provided via
# the FIREBASE_SERVICE_ACCOUNT_MITCHE_PLATFORM environment variable.
if [ -z "${FIREBASE_SERVICE_ACCOUNT_MITCHE_PLATFORM:-}" ]; then
  echo "FIREBASE_SERVICE_ACCOUNT_MITCHE_PLATFORM not set; skipping deploy"
  exit 0
fi

echo "Decoding service account and deploying to Firebase Hosting..."
SA_FILE="/tmp/fb-sa-$$.json"
echo "$FIREBASE_SERVICE_ACCOUNT_MITCHE_PLATFORM" | base64 --decode > "$SA_FILE"
export GOOGLE_APPLICATION_CREDENTIALS="$SA_FILE"

# Install firebase-tools if not present
if ! command -v firebase >/dev/null 2>&1; then
  echo "Installing firebase-tools..."
  npm install -g firebase-tools --no-audit --no-fund
fi

firebase deploy --only hosting --project mitche-platform

echo "Deploy finished"
