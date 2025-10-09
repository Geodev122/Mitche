$max = 24
for ($i=0; $i -lt $max; $i++) {
  & .\check_storybook_ci.ps1 | Out-Null
  $s = Get-Content .\ci_status.json -Raw | ConvertFrom-Json
  Write-Output ("Poll {0}: status={1} conclusion={2} updated={3}" -f $i, $s.status, $s.conclusion, $s.updated_at)
  if ($s.status -ne 'in_progress') { break }
  Start-Sleep -Seconds 5
}
if ($s.status -eq 'in_progress') { Write-Output 'Timed out waiting for run to complete' }
