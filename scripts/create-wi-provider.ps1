<#
create-wi-provider.ps1

Creates a Workload Identity Pool + OIDC provider for GitHub Actions,
binds the provider to a service account and grants that service account
the roles needed to deploy Firebase Hosting + Cloud Functions.

Usage (example):
.
# Interactive (defaults shown):
.
# Or pass named parameters:
# .\scripts\create-wi-provider.ps1 -Project mitche-platform -RepoOwner Geodev122 -RepoName Mitche -ServiceAccountEmail firebase-adminsdk-fbsvc@mitche-platform.iam.gserviceaccount.com

This script requires the Google Cloud SDK (gcloud) and optional `gh` CLI for setting GitHub secrets.
You must be authenticated with `gcloud auth login` and have sufficient IAM permissions in the project.

Security: this script does NOT print or store service-account keys. It creates a workload identity provider which
lets GitHub Actions obtain short-lived credentials (recommended).
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string] $Project = "mitche-platform",

    [Parameter(Mandatory=$false)]
    [string] $PoolId = "github-pool",

    [Parameter(Mandatory=$false)]
    [string] $ProviderId = "github-provider",

    [Parameter(Mandatory=$false)]
    [string] $RepoOwner = "Geodev122",

    [Parameter(Mandatory=$false)]
    [string] $RepoName = "Mitche",

    [Parameter(Mandatory=$false)]
    [string] $ServiceAccountEmail = "firebase-adminsdk-fbsvc@mitche-platform.iam.gserviceaccount.com",

    [Parameter(Mandatory=$false)]
    [string] $ProjectNumber
n)

$ErrorActionPreference = 'Stop'

function Check-CommandExists($cmd){
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

if (-not (Check-CommandExists 'gcloud')) {
    Write-Error "gcloud CLI not found in PATH. Install Google Cloud SDK and authenticate (gcloud auth login)."
    exit 2
}

Write-Output "Using project: $Project"

if (-not $ProjectNumber) {
    Write-Output "Fetching project number for project '$Project'..."
    $ProjectNumber = (gcloud projects describe $Project --format="value(projectNumber)").Trim()
    if (-not $ProjectNumber) {
        Write-Error "Unable to determine project number for project '$Project'"
        exit 3
    }
}
Write-Output "Project number: $ProjectNumber"

# Confirm with the user before making changes
Write-Host "About to create workload identity pool/provider and bind it to service account: $ServiceAccountEmail" -ForegroundColor Yellow
$confirm = Read-Host "Proceed? (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Output "Aborted by user. No changes made."
    exit 0
}

Write-Output "Enabling required APIs..."
gcloud services enable iam.googleapis.com --project=$Project
gcloud services enable iamcredentials.googleapis.com --project=$Project
gcloud services enable cloudresourcemanager.googleapis.com --project=$Project

# Create workload identity pool if it doesn't exist
try {
    $poolExists = gcloud iam workload-identity-pools describe $PoolId --project=$Project --location=global --format="value(name)" 2>$null
} catch {
    $poolExists = $null
}

if (-not $poolExists) {
    Write-Output "Creating workload identity pool '$PoolId'..."
    gcloud iam workload-identity-pools create $PoolId --project=$Project --location="global" --display-name="GitHub Actions pool for $RepoName"
} else {
    Write-Output "Workload identity pool '$PoolId' already exists."
}

# Create OIDC provider if it doesn't exist
try {
    $prov = gcloud iam workload-identity-pools providers describe $ProviderId --workload-identity-pool=$PoolId --location=global --project=$Project --format="value(name)" 2>$null
} catch {
    $prov = $null
}

$issuer = "https://token.actions.githubusercontent.com"
$allowedAudience = "https://github.com/$RepoOwner/$RepoName"

if (-not $prov) {
    Write-Output "Creating OIDC provider '$ProviderId'..."
    gcloud iam workload-identity-pools providers create-oidc $ProviderId \
      --project=$Project --location=global --workload-identity-pool=$PoolId \
      --display-name="GitHub Actions provider for $RepoName" \
      --issuer-uri="$issuer" \
      --allowed-audiences="$allowedAudience" \
      --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository"
} else {
    Write-Output "OIDC provider '$ProviderId' already exists."
}

# Describe provider to get the full resource name
$ProviderName = gcloud iam workload-identity-pools providers describe $ProviderId --workload-identity-pool=$PoolId --location=global --project=$Project --format="value(name)"
Write-Output "Provider resource name: $ProviderName"

# Construct principal and bind the service account
$PoolFull = "projects/$ProjectNumber/locations/global/workloadIdentityPools/$PoolId"
$Principal = "principalSet://iam.googleapis.com/$PoolFull/attribute.repository/$RepoOwner/$RepoName"

Write-Output "Binding workload identity user role to service account for principal: $Principal"

gcloud iam service-accounts add-iam-policy-binding $ServiceAccountEmail \
  --project=$Project \
  --role="roles/iam.workloadIdentityUser" \
  --member="$Principal"

# Grant deploy roles (adjust as needed for least privilege)
Write-Output "Granting deploy roles to $ServiceAccountEmail"

gcloud projects add-iam-policy-binding $Project --member="serviceAccount:$ServiceAccountEmail" --role="roles/firebasehosting.admin"
gcloud projects add-iam-policy-binding $Project --member="serviceAccount:$ServiceAccountEmail" --role="roles/cloudfunctions.admin"
gcloud projects add-iam-policy-binding $Project --member="serviceAccount:$ServiceAccountEmail" --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding $Project --member="serviceAccount:$ServiceAccountEmail" --role="roles/storage.admin"

Write-Output "All done. Provider resource name: $ProviderName"

Write-Output "
Next steps (copy/paste):
1) Add the following GitHub repository secrets (Settings -> Secrets -> Actions):
   - GCP_WORKLOAD_PROVIDER = $ProviderName
   - GCP_SERVICE_ACCOUNT_EMAIL = $ServiceAccountEmail
   - FIREBASE_PROJECT = $Project

If you have the GitHub CLI installed you can set them with:
  gh secret set GCP_WORKLOAD_PROVIDER --body "$ProviderName"
  gh secret set GCP_SERVICE_ACCOUNT_EMAIL --body "$ServiceAccountEmail"
  gh secret set FIREBASE_PROJECT --body "$Project"

2) Trigger your deploy workflow (manually or by pushing to main after re-enabling it).
"

exit 0
