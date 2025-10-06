awardRitual callable

This module provides a callable Cloud Function `awardRitual` that enforces once-per-day ritual awarding and writes an auditable ledger entry into `hope_ledger` while updating the user's hope points atomically.

How it works:
- Authenticated user calls `awardRitual` via Firebase client SDK.
- Server checks `users/{uid}.lastRitualTimestamp` against UTC midnight.
- If allowed, server creates a ledger entry in `hope_ledger` and increments `users/{uid}.hopePoints` and `hopePointsBreakdown.Ritual` inside a transaction.
- Optionally writes an analytics event to `analytics` collection as best-effort.

Testing locally (emulator):
1. Start emulators: `npx firebase emulators:start --only functions,firestore,auth`
2. Use a test script or curl to call the function. The repo includes `scripts/callable-award-ritual.mjs` as a simple client example.

Deployment:
- Build functions: `npm --prefix functions run build`
- Deploy functions: `npx firebase deploy --only functions`

Security:
- Update Firestore rules to prevent clients from writing to `hope_ledger` and `leaderboard_aggregates`. See `../firestore.rules.suggested.txt`.
