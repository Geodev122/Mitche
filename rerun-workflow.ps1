# IMPORTANT: Do NOT store tokens in files. This script reads the token from
# the environment variable GITHUB_PAT or prompts the user at runtime.
if ($env:GITHUB_PAT -and $env:GITHUB_PAT.Trim() -ne '') {
  $token = $env:GITHUB_PAT
} else {
  Write-Host 'Enter a GitHub Personal Access Token (will not be stored):'
  $token = Read-Host -AsSecureString | ConvertFrom-SecureString
  Write-Warning 'Note: you entered a token via prompt. For CI or repeatable runs, set GITHUB_PAT in your environment instead.'
  # ConvertFrom-SecureString gives an encrypted string; to use raw token, prefer setting GITHUB_PAT.
  Write-Host 'If you pasted a raw token into the file earlier, revoke it immediately via https://github.com/settings/tokens'
  exit 1
}

$owner = 'Geodev122'
$repo  = 'Mitche'
$sha   = 'ece40cbb5a17e494e118cb870b4e7b6125a9eaf9'  # commit to target

# 1. List recent workflow runs and find matches by SHA
$uri = "https://api.github.com/repos/$owner/$repo/actions/runs?per_page=100"
$runsResponse = Invoke-RestMethod -Uri $uri -Headers @{ Authorization = "token $token"; Accept = "application/vnd.github+json" } -Method Get

$matchingRuns = $runsResponse.workflow_runs | Where-Object { $_.head_sha -eq $sha }

if (-not $matchingRuns) {
  Write-Host "No workflow runs found for commit $sha. Try increasing per_page or check commit exists on origin."
  exit 1
}

Write-Host "Found runs for commit ${sha}:"
$matchingRuns | Select-Object id, name, status, conclusion, html_url | Format-Table -AutoSize

# 2. Re-run each matching run
foreach ($run in $matchingRuns) {
  $runId = $run.id
  Write-Host "Triggering rerun for run id $runId ($($run.name))..."
  $rerunUri = "https://api.github.com/repos/$owner/$repo/actions/runs/$runId/rerun"
    try {
      $resp = Invoke-RestMethod -Uri $rerunUri -Headers @{ Authorization = "token $token"; Accept = "application/vnd.github+json" } -Method Post -ErrorAction Stop
      Write-Host ("Rerun triggered for run id {0}. Check: {1}" -f $runId, $($run.html_url))
    } catch {
      $errStr = $_ | Out-String
      Write-Error ("Failed to trigger rerun for run id {0}: {1}" -f $runId, $errStr)
    }
}

# 3. Optionally poll the first run for status
$firstId = $matchingRuns[0].id
$statusUri = "https://api.github.com/repos/$owner/$repo/actions/runs/$firstId"
$runInfo = Invoke-RestMethod -Uri $statusUri -Headers @{ Authorization = "token $token"; Accept = "application/vnd.github+json" } -Method Get
$runInfo | Select-Object id, status, conclusion, html_url