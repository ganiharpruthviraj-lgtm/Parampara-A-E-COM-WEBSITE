$content = [System.IO.File]::ReadAllText('d:\ankush\search.html')
if ($content -match 'Karnataka GI') { Write-Host 'FOUND: Karnataka GI pill' } else { Write-Host 'MISSING: pill' }
if ($content -match 'Karnataka GI Featured State') { Write-Host 'FOUND: Karnataka sidebar' } else { Write-Host 'MISSING: sidebar' }
