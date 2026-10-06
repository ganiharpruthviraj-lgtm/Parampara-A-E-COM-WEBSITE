<#
.SYNOPSIS
    Parampara Production API URL Replacer
.DESCRIPTION
    Replaces local development API URL (http://localhost:5000) with the production Render URL.
.EXAMPLE
    powershell -File ./scripts/update_api.ps1
#>

param (
    [string]$ApiUrl = 'https://parampara-a-e-com-website-1.onrender.com'
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$rootPath = Resolve-Path "$scriptPath\.."

$files = @(
    'js\auth.js',
    'login.html',
    'masterpiece.html',
    'register.html',
    'search.html'
)

foreach ($file in $files) {
    $fullPath = Join-Path $rootPath $file
    if (Test-Path $fullPath) {
        $content = [System.IO.File]::ReadAllText($fullPath)
        $updated = $content.Replace('http://localhost:5000', $ApiUrl)
        [System.IO.File]::WriteAllText($fullPath, $updated)
        Write-Host "Updated: $file -> $ApiUrl" -ForegroundColor Green
    } else {
        Write-Warning "File not found: $fullPath"
    }
}
