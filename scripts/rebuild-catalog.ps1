# rebuild-catalog.ps1 — 重新扫描目标目录并重建 catalog.json
# 含 catalog/illustrated 下的 SD 插画输出
# 用法: powershell -Command "[IO.File]::ReadAllText('scripts\rebuild-catalog.ps1',[Text.Encoding]::UTF8) | Invoke-Expression"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectRoot = "f:\开发软件项目文件\悦己颜值社"
$TargetRoot = Join-Path $ProjectRoot "src\static\materials"
$CatalogPath = Join-Path $TargetRoot "catalog\catalog.json"
$IllustratedDir = Join-Path $TargetRoot "catalog\illustrated"

# 子目录 → module/type 映射
$ModuleMap = @{
    "hairstyle" = "hairstyle"
    "outfit"    = "outfit"
    "face"      = "face"
    "style"     = "style"
    "tutorials" = "tutorial"
}
$TypeMap = @{
    "references"  = "reference"
    "overlays"    = "overlay"
    "makeup"      = "reference"
    "color-charts" = "reference"
    "hair"        = "tutorial"
    "tutorials"   = "tutorial"
    "outfit"      = "tutorial"
}

$allItems = @()
$idModuleMap = @{}  # id → module (从旧 catalog 继承,用于 illustrated 反查)
$oldItemMap = @{}   # id → item 对象 (O(1) 查找)

# 0. 读取旧 catalog 建立 id→module 映射 (让 illustrated 能正确归模块)
if (Test-Path $CatalogPath) {
    try {
        $old = (Get-Content $CatalogPath -Raw | ConvertFrom-Json)
        foreach ($it in $old.items) {
            $idModuleMap[$it.id] = $it.module
            $oldItemMap[$it.id] = $it
        }
        Write-Host "✓ 加载旧 catalog id→module 映射: $($idModuleMap.Count) 条" -ForegroundColor Green
    } catch {
        Write-Host "旧 catalog 解析失败,跳过映射: $_" -ForegroundColor Yellow
    }
}

# 1. 扫描主目录 (排除 catalog 子目录)
$dirs = Get-ChildItem -LiteralPath $TargetRoot -Directory -Recurse | Where-Object { $_.Name -ne "catalog" -and $_.Name -ne "tmp_frames" }

foreach ($dir in $dirs) {
    $rel = $dir.FullName.Substring($TargetRoot.Length).TrimStart('\','/')
    $parts = $rel -split '[\\/]'
    
    # 推断 module
    $module = if ($ModuleMap.ContainsKey($parts[0])) { $ModuleMap[$parts[0]] } else { $parts[0] }
    if ($module -eq "tutorial") {
        if ($parts.Count -ge 2) {
            if ($parts[1] -eq "makeup") { $module = "face" }
            elseif ($parts[1] -eq "outfit") { $module = "outfit" }
            else { $module = "hairstyle" }
        } else { $module = "hairstyle" }
    }

    $type = if ($parts.Count -ge 2) { $parts[1] } else { "reference" }
    
    $files = Get-ChildItem -LiteralPath $dir.FullName -File | Where-Object { $_.Name -ne "catalog.json" -and $_.Extension -match '\.(png|jpg|jpeg|mp4|mov|flv|rmvb|mpg|mkv|avi)$' }
    foreach ($f in $files) {
        $ext = $f.Extension.ToLower()
        $kind = if ($ext -match '\.(mp4|mov|avi|mkv|wmv|flv|rmvb|mpg)$') { 'video' } else { 'image' }
        $relPath = $f.FullName.Substring($TargetRoot.Length).Replace('\','/').TrimStart('/')
        $style = if ($f.Name -match '_illustrated|illustrated') { 'illustrated' } else { 'photo' }
        
        $fullName = "$($f.Name) $($parts -join '/')"
        $occasion = "general"
        if ($fullName -match '通勤|正装|西装|职场') { $occasion = "work" }
        elseif ($fullName -match '约会|浪漫|甜美|温柔') { $occasion = "date" }
        elseif ($fullName -match '派对|聚会|晚宴|party') { $occasion = "party" }
        elseif ($fullName -match '日常|简约|休闲|韩式') { $occasion = "daily" }
        elseif ($fullName -match '婚礼|新娘|伴娘') { $occasion = "wedding" }
        elseif ($fullName -match '证件照|身份证') { $occasion = "idphoto" }
        elseif ($fullName -match '编发|盘发|扎发') { $occasion = "hairstyle-tutorial" }
        elseif ($fullName -match '教学|教程|护发|口播') { $occasion = "tutorial" }

        $allItems += @{
            id       = [guid]::NewGuid().ToString("N")
            name     = $f.Name
            source   = $parts -join "/"
            path     = "/static/materials/$relPath"
            module   = $module
            type     = $type
            kind     = $kind
            style    = $style
            occasion = $occasion
            ext      = $ext.TrimStart('.')
            size     = [math]::Round($f.Length / 1KB, 1)
        }
    }
}

# 2. 扫描 SD illustrated 输出目录 (标为 illustrated)
if (Test-Path $IllustratedDir) {
    Write-Host "扫描 SD illustrated 目录..." -ForegroundColor Cyan
    $illustFiles = Get-ChildItem -LiteralPath $IllustratedDir -File -Filter "*.png"
    Write-Host "  发现 $($illustFiles.Count) 张插画" -ForegroundColor Green
    
    foreach ($f in $illustFiles) {
        $relPath = $f.FullName.Substring($TargetRoot.Length).Replace('\','/').TrimStart('/')
        # 从文件名提取原始 guid: {guid}_illustrated.png
        $guid = $f.BaseName -replace '_illustrated$', ''
        # 反查 module: 从旧 catalog hashtable 优先找 photo 条目,用其 path 反推 module
        $module = 'face'  # 默认回退
        $oldItem = $oldItemMap[$guid]
        if ($oldItem -and $oldItem.path) {
            $p = $oldItem.path
            if ($p -match '/outfit/') { $module = 'outfit' }
            elseif ($p -match '/hairstyle/') { $module = 'hairstyle' }
            elseif ($p -match '/face/') { $module = 'face' }
            elseif ($p -match '/style/') { $module = 'style' }
            elseif ($p -match '/catalog/illustrated') {
                if ($oldItem.module) { $module = $oldItem.module }
            }
        }

        $allItems += @{
            id       = [guid]::NewGuid().ToString("N")
            name     = $f.Name
            source   = "sd-illustrated"
            path     = "/static/materials/$relPath"
            module   = $module   # ← 动态反查: 从旧 catalog path 反推
            type     = "reference"
            kind     = "image"
            style    = "illustrated"
            occasion = "general"
            ext      = "png"
            size     = [math]::Round($f.Length / 1KB, 1)
        }
    }
}

# 按 module 分组
$groups = @{}
foreach ($it in $allItems) {
    if (-not $groups.ContainsKey($it.module)) { $groups[$it.module] = @() }
    $groups[$it.module] += $it
}

$catalog = @{
    version   = "2.1-with-illustrated"
    generated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    total     = $allItems.Count
    modules   = $groups
    items     = $allItems
}

$json = $catalog | ConvertTo-Json -Depth 6 -Compress
[System.IO.File]::WriteAllText($CatalogPath, $json, [System.Text.Encoding]::UTF8)

Write-Host "=== catalog.json 重建完成 ===" -ForegroundColor Cyan
Write-Host "  路径: $CatalogPath"
Write-Host "  总素材: $($allItems.Count)" -ForegroundColor Green
$styleCounts = @{ photo=0; illustrated=0 }
foreach ($it in $allItems) { $styleCounts[$it.style]++ }
Write-Host "  style 分布: photo=$($styleCounts.photo) illustrated=$($styleCounts.illustrated)" -ForegroundColor Yellow
foreach ($k in ($groups.Keys | Sort-Object)) {
    Write-Host "  $k : $($groups[$k].Count) 个"
}

