param(
  [long]$runId
)

if (-not $runId) { Write-Error 'Usage: .\get_run_jobs.ps1 -runId <id>'; exit 2 }

try {
  $headers = @{ 'User-Agent' = 'Mitche-Agent' }
  $jobs = Invoke-RestMethod -Uri "https://api.github.com/repos/Geodev122/Mitche/actions/runs/$runId/jobs" -Headers $headers
  $outFile = Join-Path (Get-Location) 'scripts\ci_jobs.json'
  $jobs | ConvertTo-Json -Depth 6 | Out-File -FilePath $outFile -Encoding utf8
  Write-Output "WROTE $outFile"
} catch {
  Write-Error "Failed to fetch run jobs: $_"
  exit 3
}
