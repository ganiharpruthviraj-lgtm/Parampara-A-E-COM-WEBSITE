$file = 'd:\ankush\search.html'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# 1. Replace Hero Pill
$oldPill = '<a class="pill" href="karnataka.html" id="ka-gi-pill" style="border-color:#27AE60;color:#1E8449;background:#F0FBF4;font-weight:700;">Karnataka GI</a>'
$newPill = '<a class="pill" href="karnataka.html" id="ka-gi-pill" style="border-color:#27AE60;color:#1E8449;background:#F0FBF4;font-weight:700;">Karnataka GI (9)</a>' + [char]13 + [char]10 + '      <a class="pill" href="maharashtra.html" id="mh-gi-pill" style="border-color:#D97706;color:#B45309;background:#FFFBEB;font-weight:700;">Maharashtra GI (14)</a>'

if ($content.Contains($oldPill)) {
    $content = $content.Replace($oldPill, $newPill)
    Write-Host "Pill updated successfully"
} else {
    Write-Host "Pill pattern not matched"
}

# 2. Replace Sidebar Section
$oldSidebar = '    <!-- Karnataka GI Featured State -->' + [char]13 + [char]10 + '    <div class="filter-section">' + [char]13 + [char]10 + '     <p class="filter-title" style="color:#27AE60;">Featured State</p>' + [char]13 + [char]10 + '     <a href="karnataka.html" style="display:flex;align-items:center;gap:0.5rem;padding:0.65rem 0.75rem;background:linear-gradient(135deg,#0D2318,#1a3020);color:#aef0c4;font-size:0.68rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:3px;margin-bottom:0.5rem;">Karnataka GI Collection</a>' + [char]13 + [char]10 + '     <p style="font-size:0.65rem;color:#8C8275;line-height:1.5;">9 GI-certified handicrafts from Karnataka.</p>' + [char]13 + [char]10 + '    </div>'

$newSidebar = '    <!-- Featured Regional State Collections -->' + [char]13 + [char]10 + '    <div class="filter-section">' + [char]13 + [char]10 + '     <p class="filter-title" style="color:#D97706;">Featured State Collections</p>' + [char]13 + [char]10 + '     <a href="maharashtra.html" style="display:flex;align-items:center;gap:0.5rem;padding:0.65rem 0.75rem;background:linear-gradient(135deg,#78350F,#451A03);color:#FDE68A;font-size:0.68rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:3px;margin-bottom:0.4rem;">Maharashtra GI Collection (14)</a>' + [char]13 + [char]10 + '     <a href="karnataka.html" style="display:flex;align-items:center;gap:0.5rem;padding:0.65rem 0.75rem;background:linear-gradient(135deg,#0D2318,#1a3020);color:#aef0c4;font-size:0.68rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:3px;margin-bottom:0.5rem;">Karnataka GI Collection (9)</a>' + [char]13 + [char]10 + '     <p style="font-size:0.65rem;color:#8C8275;line-height:1.5;">Officially GI-certified regional artisan catalog.</p>' + [char]13 + [char]10 + '    </div>'

if ($content.Contains($oldSidebar)) {
    $content = $content.Replace($oldSidebar, $newSidebar)
    Write-Host "Sidebar updated successfully"
} else {
    Write-Host "Sidebar pattern not matched"
}

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
