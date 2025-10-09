try {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
  $candidates = @(
    (Join-Path $PWD 'ci_status.json'),
    (Join-Path $scriptDir 'ci_status.json'),
    (Join-Path $scriptDir '..\ci_status.json')
  )

  $statusPath = $null
  foreach ($c in $candidates) {
    if (Test-Path $c) { $statusPath = $c; break }
  }

  if (-not $statusPath) { Write-Error "ci_status.json not found in working dir or script dir. Run check_storybook_ci.ps1 first."; exit 2 }

  Write-Output "Using ci_status.json at: $statusPath"
  $status = Get-Content $statusPath -Raw | ConvertFrom-Json
  if ($null -eq $status.artifacts -or $status.artifacts.Count -eq 0) { Write-Error 'No artifacts found in ci_status.json'; exit 2 }
  $artifact = $status.artifacts | Where-Object { $_.name -like '*install-log*' } | Select-Object -First 1
  if ($null -eq $artifact) { $artifact = $status.artifacts[0] }
  $url = $artifact.archive_download_url
  Write-Output "Downloading artifact from: $url"

  $headers = @{ 'User-Agent' = 'Mitche-Agent' }
  if ($env:GH_API_TOKEN) {
    Write-Output "Using GH_API_TOKEN from environment to authenticate GitHub API requests"
    $headers.Authorization = "token $($env:GH_API_TOKEN)"
  } else {
    Write-Output "No GH_API_TOKEN present; proceeding unauthenticated (may hit rate limits)"
  }

  $outZip = Join-Path $scriptDir 'install_artifact.zip'
  Invoke-WebRequest -Uri $url -OutFile $outZip -Headers $headers -ErrorAction Stop
  $dest = Join-Path $scriptDir 'install_artifact'
  if (Test-Path $dest) { Remove-Item -LiteralPath $dest -Recurse -Force -ErrorAction SilentlyContinue }
  Expand-Archive -Path $outZip -DestinationPath $dest -Force
  Get-ChildItem $dest -Recurse -File | ForEach-Object {
    Write-Output "---- $($_.FullName) ----"
    try { Get-Content $_.FullName -Raw -ErrorAction Stop } catch { Write-Output "(failed to read file: $($_.Exception.Message))" }
  }
} catch {
  Write-Error "Failed to download artifact: $($_.Exception.Message)"
  exit 3
}
