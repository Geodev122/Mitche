Repository housekeeping notes (short)

Summary of recent actions (2025-10-06):

- Removed workflows from `.github/workflows`:
  - `deploy-on-main.yml` (deleted)
  - `e2e.yml` (deleted)

- Purged a committed secret file `functions_config.json` from the repository history using a filtered mirror clone and `git filter-repo`.
  - A safety backup branch was pushed before the rewrite: `backup/remove-functions_config-2025-10-06` (exists on `origin`).

Recommended immediate follow-ups:

1. Rotate any credentials that were present in `functions_config.json` (OpenAI key, other tokens) — treat them as compromised.
2. Instruct all contributors to re-clone the repository (recommended) or reset their local `main` to `origin/main`:

   git fetch origin
   git checkout main
   git reset --hard origin/main

3. Check forks, mirrors, or CI runners that may still hold the old secret; rotate or update as appropriate.

Notes about build & chunk warning:

- A production build was run locally (vite). The `firebase` chunk is large (~627 KB gz). This is expected for the Firebase SDK being used; if you want to reduce initial client payload we can split `services/firebase.ts` into smaller modules and lazy-load only what callers need.
- If you prefer not to act on chunk size, we can silence the Vite warning by setting `build.chunkSizeWarningLimit` in `vite.config.ts`.

If you'd like, next I can:
- Add a short `README.md` section explaining the history rewrite and how to re-sync.
- Split `services/firebase.ts` into smaller modules to reduce firebase chunk size.
- Create a small GitHub Actions workflow to run a security check on pushes (optional).

If you want any of these done now, tell me which one and I'll implement it.
