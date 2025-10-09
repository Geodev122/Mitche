try {
  $status = Get-Content .\ci_status.json -Raw | ConvertFrom-Json
  if ($null -eq $status.artifacts -or $status.artifacts.Count -eq 0) { Write-Error 'No artifacts found'; exit 2 }
  $artifact = $status.artifacts | Where-Object { $_.name -like '*install-log*' } | Select-Object -First 1
  if ($null -eq $artifact) { $artifact = $status.artifacts[0] }
  $url = $artifact.archive_download_url
  Write-Output "Downloading artifact from $url"
  $headers = @{ 'User-Agent' = 'Mitche-Agent' }
  if ($env:GH_API_TOKEN) { $headers.Authorization = "token $($env:GH_API_TOKEN)" }
  Invoke-WebRequest -Uri $url -OutFile '.\install_artifact.zip' -Headers $headers
  Expand-Archive -Path '.\install_artifact.zip' -DestinationPath '.\install_artifact' -Force
  Get-ChildItem '.\install_artifact' -Recurse -File | ForEach-Object { Write-Output "---- $($_.FullName) ----"; Get-Content $_.FullName -Raw }
} catch {
  Write-Error "Failed to download artifact: $_"
  exit 3
}
