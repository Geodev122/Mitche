<#
Fetch and print GitHub Actions run logs for the latest run recorded in scripts/ci_status.json.
Requires: $env:GH_API_TOKEN to be set in the current session.
#>
try {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
  $ciPath = Join-Path $scriptDir 'ci_status.json'
  if (-not (Test-Path $ciPath)) { Write-Error "Missing $ciPath. Run check_storybook_ci.ps1 first."; exit 2 }
  $ci = Get-Content $ciPath -Raw | ConvertFrom-Json
  $runId = $ci.id

  if (-not $env:GH_API_TOKEN) { Write-Error 'GH_API_TOKEN not set in session. Set it before running this script.'; exit 3 }

  $headers = @{ 'User-Agent' = 'Mitche-Agent'; Authorization = "token $($env:GH_API_TOKEN)" }
  $outZip = Join-Path $scriptDir 'run_logs.zip'
  $outDir = Join-Path $scriptDir 'run_logs'

  Write-Output "Downloading run logs for run id: $runId"
  $url = "https://api.github.com/repos/Geodev122/Mitche/actions/runs/$runId/logs"
  Invoke-WebRequest -Uri $url -Headers $headers -OutFile $outZip -UseBasicParsing -ErrorAction Stop
  Write-Output "Extracting to: $outDir"
  if (Test-Path $outDir) { Remove-Item -LiteralPath $outDir -Recurse -Force -ErrorAction SilentlyContinue }
  Expand-Archive -Path $outZip -DestinationPath $outDir -Force

  Write-Output "Scanning extracted logs for storybook/build job files"
  Get-ChildItem $outDir -Recurse -File | Where-Object { $_.Name -match 'build|storybook|52378048532' -or $_.FullName -match '52378048532' } | ForEach-Object {
    Write-Output "---- $($_.FullName) ----"
    try { Get-Content -Raw $_.FullName } catch { Write-Output "(failed to read: $($_.Exception.Message))" }
  }
} catch {
  Write-Error "Failed to fetch or print run logs: $($_.Exception.Message)"
  exit 1
}
