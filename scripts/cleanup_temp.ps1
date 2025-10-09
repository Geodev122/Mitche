Write-Output "Starting workspace cleanup: removing common cache/temp folders"

$paths = @(
  'node_modules',
  'dist',
  'storybook-static',
  '.vite',
  '.cache',
  '.parcel-cache',
  '.turbo',
  '.storybook-static',
  'scripts\install_artifact.zip',
  'scripts\install_artifact',
  'scripts\ci_status.json',
  'scripts\ci_jobs.json',
  'scripts\run_logs',
  'scripts\run_logs.zip',
  'functions\node_modules',
  'functions\dist',
  'functions\lib'
)

foreach ($p in $paths) {
  if (Test-Path $p) {
    try {
      Write-Output "Removing: $p"
      Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop
      Write-Output "Removed: $p"
    } catch {
      Write-Output "Failed to remove: $p - $($_.Exception.Message)"
    }
  } else {
    Write-Output "Not found: $p"
  }
}

try {
  Write-Output "Clearing user temp: $env:TEMP"
  Remove-Item -Path (Join-Path $env:TEMP '*') -Recurse -Force -ErrorAction SilentlyContinue
  Write-Output "User temp cleared (best-effort)"
} catch {
  Write-Output "Failed to clear user temp: $($_.Exception.Message)"
}

try {
  Write-Output "Attempting to clear C:\\Windows\\Temp (may require admin)"
  Remove-Item -Path 'C:\\Windows\\Temp\\*' -Recurse -Force -ErrorAction SilentlyContinue
  Write-Output "Windows temp cleanup attempted"
} catch {
  Write-Output "Failed to clear C:\\Windows\\Temp: $($_.Exception.Message)"
}

if (Get-Command npm -ErrorAction SilentlyContinue) {
  try {
    Write-Output "npm found; cleaning npm cache"
    npm cache clean --force
    $nc = npm config get cache 2>$null
    if ($nc -and (Test-Path $nc)) {
      Write-Output "Removing npm cache folder: $nc"
      Remove-Item -Path $nc -Recurse -Force -ErrorAction SilentlyContinue
    }
  } catch {
    Write-Output "npm cache clean failed: $($_.Exception.Message)"
  }
} else {
  Write-Output "npm not found; skipped npm cache clean"
}

Write-Output "Disk free after cleanup:"
Get-PSDrive -Name C | Select-Object Free,Used,Provider,Root | Format-List

Write-Output "Cleanup complete"
