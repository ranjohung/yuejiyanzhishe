# ============================================================
# batch-sd-process.ps1 — 批量 SD img2img 风格转换 (断点续传)
# 
# 工作流:
#   1. 读取 catalog.json 获取所有 sdStatus=pending 的素材
#   2. 对视频: ffmpeg 抽 1 帧 → SD img2img → 保存 illustrated PNG
#   3. 对图片: 直接 SD img2img → 保存 illustrated PNG
#   4. 写 progress.json 记录进度 (每处理 1 个)
#   5. 结束后重建 catalog.json
#
# 进度文件: src/static/materials/catalog/progress.json
# 运行: powershell -ExecutionPolicy Bypass -Command "[IO.File]::ReadAllText('scripts\batch-sd-process.ps1',[Text.Encoding]::UTF8) | Invoke-Expression"
# ============================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectRoot = "f:\开发软件项目文件\悦己颜值社"
$CatalogDir  = Join-Path $ProjectRoot "src\static\materials\catalog"
$CatalogPath = Join-Path $CatalogDir "catalog.json"
$ProgressPath = Join-Path $CatalogDir "progress.json"
$SD_API      = "http://127.0.0.1:7860"

# SD 配置
$SD_MODEL    = "dreamshaper_8"
$STYLE_PROMPT = "editorial anime style, flat colors, simple shapes, beauty illustration, soft lighting, clean background"
$STYLE_NEGATIVE = "realistic, photo, 3d render, low quality, blurry, distorted, ugly face"
$DENOISING   = 0.55
$WIDTH       = 512
$HEIGHT      = 512
$STEPS       = 20
$CFG         = 7

# ---------- 健康检查 ----------
function Test-SDHealth {
    try {
        $null = Invoke-RestMethod -Uri "$SD_API/sdapi/v1/sd-models" -TimeoutSec 5
        return $true
    } catch {
        Write-Host "SD API 不可用: $_" -ForegroundColor Red
        return $false
    }
}

# ---------- 进度加载/保存 ----------
function Load-Progress {
    if (Test-Path $ProgressPath) {
        try { return (Get-Content $ProgressPath -Raw | ConvertFrom-Json) } catch { return @{} }
    }
    return @{}
}

function Save-Progress {
    param($Progress)
    try { $Progress | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $ProgressPath -Encoding UTF8 } catch {}
}

# ---------- 帧提取 ----------
function Extract-VideoFrame {
    param([string]$VideoPath, [string]$OutputPath, [float]$Sec = 2.0)
    ffmpeg -y -i $VideoPath -ss $Sec -frames:v 1 -q:v 2 $OutputPath 2>$null
    return Test-Path $OutputPath
}

# ---------- SD img2img ----------
function Convert-SDImg2Img {
    param([string]$InputPath, [string]$OutputPath)
    
    if (-not (Test-Path $InputPath)) { return $false }
    
    try {
        $bytes = [System.IO.File]::ReadAllBytes($InputPath)
        $b64 = [Convert]::ToBase64String($bytes)
    } catch { return $false }
    
    $body = @{
        init_images         = @($b64)
        prompt              = $STYLE_PROMPT
        negative_prompt     = $STYLE_NEGATIVE
        steps               = $STEPS
        cfg_scale           = $CFG
        width               = $WIDTH
        height              = $HEIGHT
        sampler_name        = "DPM++ 2M Karras"
        model               = $SD_MODEL
        denoising_strength  = $DENOISING
        seed                = -1
    } | ConvertTo-Json -Depth 5

    $maxRetries = 3
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        try {
            $resp = Invoke-RestMethod -Uri "$SD_API/sdapi/v1/img2img" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 180
            if ($resp.images -and $resp.images.Count -gt 0) {
                [System.IO.File]::WriteAllBytes($OutputPath, [Convert]::FromBase64String($resp.images[0]))
                return $true
            }
        } catch {
            Write-Host "  SD 调用失败 (尝试 $attempt/$maxRetries): $_" -ForegroundColor DarkRed
            Start-Sleep -Seconds 5
        }
    }
    return $false
}

# ---------- 主流程 ----------
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SD 批量风格转换 (断点续传)" -ForegroundColor Cyan
Write-Host "  模型: $SD_MODEL" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# 健康检查
if (-not (Test-SDHealth)) {
    Write-Host "SD API 不可用,请先启动 SD WebUI (API 模式)" -ForegroundColor Red
    return
}
Write-Host "✓ SD API 在线" -ForegroundColor Green

# 加载 catalog
if (-not (Test-Path $CatalogPath)) {
    Write-Host "catalog.json 不存在! 先跑 organize-materials.ps1" -ForegroundColor Red
    return
}
$catalog = (Get-Content $CatalogPath -Raw | ConvertFrom-Json)
Write-Host "✓ catalog 加载: $($catalog.total) 个素材" -ForegroundColor Green

# 加载进度
$progress = Load-Progress
if (-not $progress.processed) { $progress | Add-Member -NotePropertyName processed -NotePropertyValue (@{}) }

# 筛选待处理 (优先图片,然后视频)
# 只处理 outfit + hairstyle (face 已有 9332 张 illustrated,且 id 对不上新 catalog)
$targetModules = @('outfit', 'hairstyle')
$items = @($catalog.items) | Where-Object { $_.kind -in @('image', 'video') -and $targetModules -contains $_.module }
Write-Host "  目标模块: $($targetModules -join ', ')" -ForegroundColor Cyan

# 安全地获取已处理 id 集合 (处理空 PSCustomObject 问题)
$doneIds = @()
if ($progress.processed -and $progress.processed.PSObject -and $progress.processed.PSObject.Properties) {
    $doneIds = @($progress.processed.PSObject.Properties.Name)
}

$items = @($items | Where-Object { $doneIds -notcontains $_.id })

# 放宽筛选: 所有图片只要路径能解析到磁盘文件就处理
# 直接内联路径解析逻辑 (避免 Invoke-Expression 下函数作用域问题)
$imageQueue = @()
foreach ($it in $items) {
    if ($it.kind -ne 'image') { continue }
    $found = $false
    # 优先 path (已复制或未复制都可能)
    if ($it.path) {
        $disk = Join-Path $ProjectRoot ("src" + $it.path)
        if (Test-Path $disk) { $imageQueue += $it; $found = $true; continue }
    }
    # 回退 sourcePath
    if (-not $found -and $it.sourcePath -and (Test-Path $it.sourcePath)) {
        $imageQueue += $it
    }
}

$videoQueue = @($items | Where-Object { $_.kind -eq 'video' })

# 合并队列 (先图片全转,再视频抽帧转)
$queue = $imageQueue + $videoQueue

Write-Host "待处理: $($queue.Count) (图片=$($imageQueue.Count), 视频=$($videoQueue.Count))" -ForegroundColor Yellow

# 进度统计
$totalDone = ($progress.processed.PSObject.Properties | Where-Object { $_.Value -eq 'done' }).Count
$totalFailed = ($progress.processed.PSObject.Properties | Where-Object { $_.Value -eq 'failed' }).Count
$batchStart = Get-Date

# 临时帧目录
$tmpDir = Join-Path $CatalogDir "tmp_frames"
if (-not (Test-Path $tmpDir)) { New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null }

$batchIdx = 0
$successInBatch = 0
$failInBatch = 0
$skipInBatch = 0

foreach ($item in $queue) {
    $batchIdx++
    
    if ($batchIdx % 20 -eq 0) {
        $elapsed = (Get-Date) - $batchStart
        $eta = if ($batchIdx -gt 0) { [math]::Round($elapsed.TotalSeconds / $batchIdx * ($queue.Count - $batchIdx) / 60, 1) } else { '?' }
        Write-Host "`n--- 进度 [$batchIdx/$($queue.Count)] 成功=$successInBatch 失败=$failInBatch 跳过=$skipInBatch | 预计剩余 ${eta}min ---" -ForegroundColor Cyan
    }
    
    $outName = "$($item.id)_illustrated.png"
    # 输出到 catalog 同级的 illustrated 目录
    $illustratedDir = Join-Path $CatalogDir "illustrated"
    if (-not (Test-Path $illustratedDir)) { New-Item -ItemType Directory -Path $illustratedDir -Force | Out-Null }
    $outPath = Join-Path $illustratedDir $outName
    
    if ((Test-Path $outPath) -and (Get-Item $outPath).Length -gt 1000) {
        # 已处理过且文件有效
        $skipInBatch++
        $progress.processed | Add-Member -NotePropertyName $item.id -NotePropertyValue 'done' -Force
        continue
    }
    
    try {
        # 内联路径解析 (避免函数作用域问题)
        $sourcePath = $null
        if ($item.path) {
            $disk = Join-Path $ProjectRoot ("src" + $item.path)
            if (Test-Path $disk) { $sourcePath = $disk }
        }
        if (-not $sourcePath -and $item.sourcePath -and (Test-Path $item.sourcePath)) {
            $sourcePath = $item.sourcePath
        }
        if (-not $sourcePath) {
            Write-Host "  ✗ 找不到源文件 (跳过): $($item.name)" -ForegroundColor DarkYellow
            $skipInBatch++
            $progress.processed | Add-Member -NotePropertyName $item.id -NotePropertyValue 'failed' -Force
            Save-Progress $progress
            continue
        }
        
        if ($item.kind -eq 'image') {
            # 图片直接转
            if (Convert-SDImg2Img -InputPath $sourcePath -OutputPath $outPath) {
                $successInBatch++
                $progress.processed | Add-Member -NotePropertyName $item.id -NotePropertyValue 'done' -Force
                Write-Host "  ✓ 图片转插画: $($item.name)" -ForegroundColor Green
            } else {
                $failInBatch++
                $progress.processed | Add-Member -NotePropertyName $item.id -NotePropertyValue 'failed' -Force
                Write-Host "  ✗ 转换失败: $($item.name)" -ForegroundColor Red
            }
        } else {
            # 视频: 抽帧 → 转插画
            $framePath = Join-Path $tmpDir "$($item.id).jpg"
            if (Extract-VideoFrame -VideoPath $sourcePath -OutputPath $framePath -Sec 2.0) {
                if (Convert-SDImg2Img -InputPath $framePath -OutputPath $outPath) {
                    $successInBatch++
                    $progress.processed | Add-Member -NotePropertyName $item.id -NotePropertyValue 'done' -Force
                    Write-Host "  ✓ 视频帧转插画: $($item.name)" -ForegroundColor Green
                } else {
                    $failInBatch++
                    $progress.processed | Add-Member -NotePropertyName $item.id -NotePropertyValue 'failed' -Force
                    Write-Host "  ✗ SD 转换失败: $($item.name)" -ForegroundColor Red
                }
            } else {
                $failInBatch++
                $progress.processed | Add-Member -NotePropertyName $item.id -NotePropertyValue 'failed' -Force
                Write-Host "  ✗ 抽帧失败: $($item.name)" -ForegroundColor Red
            }
        }
    } catch {
        $failInBatch++
        Write-Host "  ✗ 异常: $_" -ForegroundColor Red
        $progress.processed | Add-Member -NotePropertyName $item.id -NotePropertyValue 'failed' -Force
    }
    
    # 每 10 个保存进度
    if ($batchIdx % 10 -eq 0) {
        Save-Progress $progress
    }
    
    # SD 健康检查 (每 30 个)
    if ($batchIdx % 30 -eq 0) {
        if (-not (Test-SDHealth)) {
            Write-Host "SD API 断开! 暂停 30s 等待恢复..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
        }
    }
}

# 最终保存
Save-Progress $progress

$total = $batchIdx
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  SD 批处理完成" -ForegroundColor Cyan
Write-Host "  本次: 成功=$successInBatch 失败=$failInBatch 跳过=$skipInBatch" -ForegroundColor Green
Write-Host "  总处理: $totalDone 成功, $($totalFailed + $failInBatch) 失败" -ForegroundColor Yellow
Write-Host "  输出: $illustratedDir ($(Get-ChildItem $illustratedDir -File -ErrorAction SilentlyContinue).Count 个文件)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步: 运行 rebuild-catalog.ps1 把新插画加入 catalog" -ForegroundColor Yellow
