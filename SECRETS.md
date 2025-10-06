SECRETS and CI Quick-Remediation

This file documents the secrets we removed, what must be rotated, and exact steps to securely configure CI (GitHub Actions) for the `mitche-platform` project.

TL;DR — actions you should take now
- Rotate the OpenAI API key that was leaked in `functions_config.json` immediately.
- Add these repository secrets in GitHub (Settings → Secrets and variables → Actions):
  - GCP_WORKLOAD_PROVIDER = projects/62893727673/locations/global/workloadIdentityPools/github-pool/providers/github-provider
  - GCP_SERVICE_ACCOUNT_EMAIL = firebase-adminsdk-fbsvc@mitche-platform.iam.gserviceaccount.com
  - FIREBASE_PROJECT = mitche-platform
- Remove any long-lived service-account JSON secrets from GitHub after OIDC is working.

Files we removed/ignored
- functions_config.json — contained a leaked OpenAI API key and was removed from source control and added to `.gitignore`.

What to rotate (immediately)
1) OpenAI API key (the value in the removed functions_config.json). Delete/rotate the key in the OpenAI dashboard.
2) Any service-account keys (JSON) that were ever placed in the repo or in GitHub secrets; revoke them and create new keys only if necessary.

How to add the necessary GitHub secrets (UI)
1. Go to your repository → Settings → Secrets and variables → Actions → New repository secret.
2. Add the three secrets above, with the exact names.

How to add them with `gh` (optional)

# if you have `gh` installed and authenticated
```
gh secret set GCP_WORKLOAD_PROVIDER --body "projects/62893727673/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
gh secret set GCP_SERVICE_ACCOUNT_EMAIL --body "firebase-adminsdk-fbsvc@mitche-platform.iam.gserviceaccount.com"
gh secret set FIREBASE_PROJECT --body "mitche-platform"
```

Workload Identity + minimal IAM roles summary
- We created a Workload Identity Provider: the resource name is the `GCP_WORKLOAD_PROVIDER` value above.
- We bound that provider to the service account `firebase-adminsdk-fbsvc@mitche-platform.iam.gserviceaccount.com` with `roles/iam.workloadIdentityUser`.
- The service account was given the roles needed for deploy (common set):
  - roles/firebasehosting.admin
  - roles/cloudfunctions.admin
  - roles/iam.serviceAccountUser
  - roles/storage.admin

How to test CI auth (manual run)
1. Ensure the three GitHub secrets are set.
2. Go to GitHub → Actions → `Deploy on main` → Run workflow (choose the default branch and Run workflow). The workflow will use OIDC to impersonate the service account and deploy.

How to re-enable automatic deploy-on-push
- The `deploy-on-main.yml` file currently uses `workflow_dispatch` (manual). After you confirm secrets are set and a manual run succeeded, tell us to re-enable and we will change it to `on: push`.

Security follow-ups (recommended)
- Revoke the leaked OpenAI key and any service-account keys that may have been exposed.
- Audit repository history for other secrets (use `git log --all -p` or the GitHub secret scanning feature).
- Remove any remaining long-lived credentials from GitHub secrets when you switch fully to OIDC.
- Consider using Secret Manager or Firebase Functions secrets for production keys.

If you want help with any of the above I can:
- Re-enable the `deploy-on-main` automatic trigger after you confirm secrets (I will commit the change), or
- Create a short script to rotate/replace the OpenAI key usage in the functions deployment (requires you to create a new key), or
- Run a manual test of the workflow if you add `gh` and authorize me to operate (I won't do this without explicit instruction).

Thank you — paste any CI logs or GH action run IDs if something fails and I'll help debug.
