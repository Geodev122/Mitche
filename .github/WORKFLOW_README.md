OIDC / Workload Identity Configuration for Deploys
===============================================

This project uses GitHub Actions to deploy to Firebase. The preferred authentication method is Workload Identity (OIDC). Follow these steps to enable automatic, secure deploys.

1. Create a Workload Identity Provider in GCP
   - Go to IAM & Admin -> Workload Identity Federation -> Providers
   - Create a new provider for GitHub with the repository or org as the allowed audience

2. Create a short-lived service account for deployments
   - Create service account: `mitche-deployer@<PROJECT>.iam.gserviceaccount.com`
   - Grant it limited roles: `roles/firebase.admin` and `roles/storage.admin` (or narrower as needed)

3. Grant the service account permission to be impersonated by the provider
   - `gcloud iam service-accounts add-iam-policy-binding mitche-deployer@<PROJECT>.iam.gserviceaccount.com --role roles/iam.workloadIdentityUser --member "principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/<POOL>/attribute.repository/<REPO>"`

4. Store repository secrets
   - `GCP_WORKLOAD_PROVIDER` = the full provider resource name
   - `GCP_SERVICE_ACCOUNT_EMAIL` = mitche-deployer@<PROJECT>.iam.gserviceaccount.com
   - (Optional fallback) `FIREBASE_SERVICE_ACCOUNT` = Base64-encoded service account JSON
   - `FIREBASE_PROJECT` = mitche-platform

After configuring, you can change `.github/workflows/deploy-on-main.yml` `on:` from `workflow_dispatch` to `push` to enable automatic deploys on main.
