# Query the GitHub Actions API for the latest 'Build Storybook' run on main
try {
  $headers = @{ 'User-Agent' = 'Mitche-Agent' }
  if ($env:GH_API_TOKEN) { $headers.Authorization = "token $($env:GH_API_TOKEN)" }
  $runs = Invoke-RestMethod -Uri 'https://api.github.com/repos/Geodev122/Mitche/actions/runs?per_page=20' -Headers $headers

  $match = $runs.workflow_runs | Where-Object { $_.name -eq 'Build Storybook' -and $_.head_branch -eq 'main' } | Select-Object -First 1
  if ($null -eq $match) {
    Write-Output 'NO_RUN_FOUND'
    exit 2
  }

  $info = [ordered]@{
    id = $match.id
    name = $match.name
    status = $match.status
    conclusion = $match.conclusion
    html_url = $match.html_url
    created_at = $match.created_at
    updated_at = $match.updated_at
  }

  $arts = Invoke-RestMethod -Uri ("https://api.github.com/repos/Geodev122/Mitche/actions/runs/$($match.id)/artifacts") -Headers $headers
  $info.artifacts = @()
  foreach ($a in $arts.artifacts) {
    $info.artifacts += [ordered]@{
      id = $a.id
      name = $a.name
      size_in_bytes = $a.size_in_bytes
      archive_download_url = $a.archive_download_url
    }
  }

  $outFile = Join-Path -Path (Get-Location) -ChildPath 'scripts\ci_status.json'
  $info | ConvertTo-Json -Depth 5 | Out-File -FilePath $outFile -Encoding utf8
  Write-Output "WROTE $outFile"
} catch {
  Write-Error "Failed to query GitHub Actions: $_"
  exit 3
}
