Write-Output "Cleaning npm cache (best-effort)"
try {
  npm cache clean --force
} catch {
  Write-Output "npm cache clean failed (non-fatal): $($_.Exception.Message)"
}

$max = 3
for ($i = 1; $i -le $max; $i++) {
  Write-Output ("Attempt {0} of {1}: running npm ci" -f $i, $max)
  & npm ci --omit=optional --prefer-offline --fetch-retries=5 --fetch-retry-mintimeout=1000 --fetch-retry-maxtimeout=60000
  if ($LASTEXITCODE -eq 0) {
    Write-Output ("npm ci succeeded on attempt {0}" -f $i)
    exit 0
  }
  Write-Output ("npm ci failed on attempt {0} (exit {1}). Retrying after backoff" -f $i, $LASTEXITCODE)
  Start-Sleep -Seconds (5 * $i)
}

Write-Error "npm ci failed after $max attempts"
exit 1
