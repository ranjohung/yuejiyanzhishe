# ============================================================
# organize-materials.ps1 v2 — 全量素材分类索引 + 图片全复制
# 源: D:\作品\视频图片\美容化妆素材 (124GB / 10027 文件)
# 目标: src/static/materials/
# 策略: 图片全量复制到项目目录,视频只索引不复制(源路径引用)
# ============================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$SourceRoot = "D:\作品\视频图片\美容化妆素材"
$TargetRoot = "f:\开发软件项目文件\悦己颜值社\src\static\materials"
$CatalogPath = Join-Path $TargetRoot "catalog\catalog.json"
$ProgressLog = Join-Path $TargetRoot "catalog\progress.log"

# 分类规则
$CategoryRules = @(
    @{ Keywords = @("发型合集", "发型素材", "丸子头");       Target = "hairstyle\references";  Module = "hairstyle"; Type = "reference" },
    @{ Keywords = @("头发2", "头发PNG", "头发PSD");          Target = "hairstyle\overlays";    Module = "hairstyle"; Type = "overlay" },
    @{ Keywords = @("证件照头发");                            Target = "hairstyle\overlays";    Module = "hairstyle"; Type = "overlay" },
    @{ Keywords = @("韩式卷发", "男士发型", "假发头发");     Target = "hairstyle\references";  Module = "hairstyle"; Type = "reference" },
    @{ Keywords = @("盘发编发", "扎发", "编发");              Target = "tutorials\hair";        Module = "hairstyle"; Type = "tutorial" },
    @{ Keywords = @("女装款式搭配", "服装搭配", "衣服平铺"); Target = "outfit\references";     Module = "outfit";    Type = "reference" },
    @{ Keywords = @("1080P超清");                             Target = "outfit\references";     Module = "outfit";    Type = "reference" },
    @{ Keywords = @("美容美妆", "短视频素材", "化妆");        Target = "face\tutorials";        Module = "face";      Type = "tutorial" },
    @{ Keywords = @("不同脸型", "不同场合");                  Target = "face\makeup";           Module = "face";      Type = "reference" },
    @{ Keywords = @("女款式搭配");                            Target = "outfit\references";     Module = "outfit";    Type = "reference" }
)

$SkipExtensions = @(".zip", ".rar", ".7z", ".pdf", ".ppt", ".pptx", ".doc", ".docx", ".psd")
$MediaExtensions = @(".png", ".jpg", ".jpeg", ".mp4", ".mov", ".avi", ".mkv", ".wmv", ".flv", ".rmvb", ".mpg")

function Get-Category {
    param([string]$DirName)
    foreach ($rule in $CategoryRules) {
        foreach ($kw in $rule.Keywords) {
            if ($DirName -like "*$kw*") { return $rule }
        }
    }
    return $null
}

function IsMediaFile {
    param([string]$FileName)
    $ext = [System.IO.Path]::GetExtension($FileName).ToLower()
    return $MediaExtensions -contains $ext
}

function IsSkipFile {
    param([string]$FileName)
    $ext = [System.IO.Path]::GetExtension($FileName).ToLower()
    return $SkipExtensions -contains $ext
}

function Get-Occasion {
    param([string]$Text)
    if ($Text -match '通勤|正装|西装|职场') { return 'work' }
    elseif ($Text -match '约会|浪漫|甜美|温柔') { return 'date' }
    elseif ($Text -match '派对|聚会|晚宴|party') { return 'party' }
    elseif ($Text -match '日常|简约|休闲|韩式') { return 'daily' }
    elseif ($Text -match '婚礼|新娘|伴娘') { return 'wedding' }
    elseif ($Text -match '证件照|身份证') { return 'idphoto' }
    elseif ($Text -match '编发|盘发|扎发') { return 'hairstyle-tutorial' }
    elseif ($Text -match '教学|教程|护发|口播|短视频') { return 'tutorial' }
    return 'general'
}

function LogProgress {
    param([string]$Msg)
    $line = "[$(Get-Date -Format 'HH:mm:ss')] $Msg"
    Write-Host $line -ForegroundColor Gray
    Add-Content -LiteralPath $ProgressLog -Value $line -ErrorAction SilentlyContinue
}

# ---------- 主流程 ----------
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  素材全量分类索引 v2 (不复制视频,全复制图片)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$allItems = [System.Collections.ArrayList]::new()
$stats = @{ total=0; images=0; videos=0; copied_images=0; skipped=0; unmatched=0; errors=0 }

$sourceDirs = Get-ChildItem -LiteralPath $SourceRoot -Directory
LogProgress "发现 $($sourceDirs.Count) 个源目录"

$idx = 0
foreach ($srcDir in $sourceDirs) {
    $idx++
    $cat = Get-Category -DirName $srcDir.Name
    
    if (-not $cat) {
        $stats.unmatched++
        LogProgress "  [$idx/$($sourceDirs.Count)] 未匹配: $($srcDir.Name)"
        continue
    }
    
    LogProgress "  [$idx/$($sourceDirs.Count)] [$($cat.Module)/$($cat.Type)] $($srcDir.Name)"
    
    $destDir = Join-Path $TargetRoot $cat.Target
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    
    $files = Get-ChildItem -LiteralPath $srcDir.FullName -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { -not (IsSkipFile $_.Name) -and (IsMediaFile $_.Name) }
    $stats.total += $files.Count
    
    $fileIdx = 0
    foreach ($file in $files) {
        $fileIdx++
        if ($fileIdx % 500 -eq 0) { LogProgress "    进度: $fileIdx / $($files.Count)" }
        
        $ext = $file.Extension.ToLower()
        $isVideo = $ext -match '\.(mp4|mov|avi|mkv|wmv|flv|rmvb|mpg)$'
        $isImage = -not $isVideo
        
        if ($isVideo) { $stats.videos++ } else { $stats.images++ }
        
        # 构建路径
        $safePrefix = ($srcDir.Name -replace '[^\u4e00-\u9fa5a-zA-Z0-9]', '_').Substring(0, [Math]::Min(20, ($srcDir.Name -replace '[^\u4e00-\u9fa5a-zA-Z0-9]', '_').Length))
        $destName = "$($safePrefix)_$($file.Name)"
        $destPath = Join-Path $destDir $destName
        
        $relPath = $destPath.Substring($TargetRoot.Length).Replace('\', '/').TrimStart('/')
        $webPath = "/static/materials/$relPath"
        
        # 复制策略: 图片必须复制,视频不复制(引用源路径)
        $copied = $false
        if ($isImage) {
            try {
                if (-not (Test-Path $destPath) -or (Get-Item $destPath).Length -ne $file.Length) {
                    Copy-Item -LiteralPath $file.FullName -Destination $destPath -Force -ErrorAction Stop
                }
                $copied = $true
                $stats.copied_images++
            } catch {
                $stats.errors++
                # 继续
            }
        }
        
        # occasion 判断
        $occasion = Get-Occasion -Text "$($file.Name) $($srcDir.Name)"
        
        $item = @{
            id        = [guid]::NewGuid().ToString("N")
            name      = $file.Name
            source    = $srcDir.Name
            sourcePath = $file.FullName           # 源路径(视频 fallback)
            path      = if ($copied) { $webPath } else { $file.FullName.Replace('\','/') }
            module    = $cat.Module
            type      = $cat.Type
            kind      = if ($isVideo) { 'video' } else { 'image' }
            style     = 'photo'
            occasion  = $occasion
            ext       = $ext.TrimStart('.')
            size      = [math]::Round($file.Length / 1KB, 1)
            copied    = $copied
            width     = $null
            height    = $null
            sdStatus  = 'pending'                 # pending → done → failed
        }
        [void]$allItems.Add($item)
    }
}

# ---------- 生成 catalog.json ----------
LogProgress "生成 catalog.json (v2)"

# 按 module 分组
$grouped = @{}
foreach ($it in $allItems) {
    if (-not $grouped.ContainsKey($it.module)) { $grouped[$it.module] = [System.Collections.ArrayList]::new() }
    [void]$grouped[$it.module].Add($it)
}

# 计算 style (如果目录里已有 _illustrated 文件,标记 illustrated)
$catalogJSON = @{
    version      = "2.0-full-index"
    generated    = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    total        = $allItems.Count
    stats        = $stats
    sourceRoot   = $SourceRoot
    targetRoot   = $TargetRoot
    modules      = $grouped
    items        = $allItems
}

$json = $catalogJSON | ConvertTo-Json -Depth 6 -Compress
[System.IO.File]::WriteAllText($CatalogPath, $json, [System.Text.Encoding]::UTF8)

# 进度总结
LogProgress "=========== 全量索引完成 ==========="
Write-Host ""
Write-Host "  总媒体文件:  $($stats.total)" -ForegroundColor Cyan
Write-Host "  图片:        $($stats.images) (已复制到项目目录)" -ForegroundColor Green
Write-Host "  视频:        $($stats.videos) (保留源路径引用)" -ForegroundColor Yellow
Write-Host "  未匹配目录:  $($stats.unmatched)" -ForegroundColor DarkGray
Write-Host "  复制错误:    $($stats.errors)" -ForegroundColor Red
Write-Host ""
foreach ($m in ($grouped.Keys | Sort-Object)) {
    $imgs = ($grouped[$m] | Where-Object { $_.kind -eq 'image' }).Count
    $vids = ($grouped[$m] | Where-Object { $_.kind -eq 'video' }).Count
    Write-Host "  [$m] 图片=$imgs 视频=$vids 总计=$($grouped[$m].Count)"
}
Write-Host ""
Write-Host "  catalog.json: $CatalogPath" -ForegroundColor Cyan
Write-Host "  体积: $([math]::Round(($json.Length/1MB), 2)) MB"

LogProgress "完成"
