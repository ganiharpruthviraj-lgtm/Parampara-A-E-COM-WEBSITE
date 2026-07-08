$url = 'https://parampara-a-e-com-website-1.onrender.com'
$files = @('js\auth.js', 'login.html', 'masterpiece.html', 'register.html', 'search.html')
foreach ($file in $files) {
    $path = "d:\ankush\$file"
    $content = [System.IO.File]::ReadAllText($path)
    $updated = $content.Replace('http://localhost:5000', $url)
    [System.IO.File]::WriteAllText($path, $updated)
    Write-Host "Updated: $file"
}
