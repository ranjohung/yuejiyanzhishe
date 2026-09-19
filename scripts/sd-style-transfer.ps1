# sd-style-transfer.ps1 — 真人素材 → 非真人风格 (SD img2img 批处理)
# 依赖: ffmpeg (choco install ffmpeg), SD WebUI (http://127.0.0.1:7860)
# 用法示例:
#   powershell -ExecutionPolicy Bypass -Command "[IO.File]::ReadAllText('scripts\sd-style-transfer.ps1',[Text.Encoding]::UTF8) | Invoke-Expression -Command 'Convert-VideoFrames -VideoPath \"video.mp4\" -OutDir \"output\" -Style \"editorial anime\"'"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$SD_API = "http://127.0.0.1:7860"
$SD_MODEL = "dreamshaper_8"

# 可用风格预设
$Styles = @{
    "editorial_anime" = @{
        Prompt = "anime style, editorial illustration, flat colors, clean lines, beauty tutorial background"
        Negative = "realistic, photo, 3d, low quality, blurry, distorted, face"
    }
    "kawaii_chibi" = @{
        Prompt = "cute kawaii chibi, soft pastel colors, simple illustration, cartoon style"
        Negative = "realistic, photo, scary, ugly, dark"
    }
    "infographic" = @{
        Prompt = "modern flat design infographic style, beauty tutorial steps, icons mixed with simple illustrations"
        Negative = "realistic, 3d render, complex background, photo"
    }
    "flat_couture" = @{
        Prompt = "fashion magazine flat illustration, elegant minimal style, bold colors, couture art"
        Negative = "realistic, photo, blurry, amateur"
    }
}

function Convert-Frame {
    param(
        [string]$FramePath,
        [string]$OutputPath,
        [string]$StyleKey = "editorial_anime",
        [float]$Denoise = 0.55,
        [string]$Model = $SD_MODEL
    )
    $style = $Styles[$StyleKey]
    if (-not $style) { $style = $Styles["editorial_anime"] }

    $b = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($FramePath))
    $body = @{
        init_images         = @($b)
        prompt              = $style.Prompt
        negative_prompt     = $style.Negative
        steps               = 20
        cfg_scale           = 7
        width               = 512
        height              = 512
        sampler_name        = "DPM++ 2M Karras"
        model               = $Model
        denoising_strength  = $Denoise
        seed                = -1
    } | ConvertTo-Json -Depth 5

    try {
        $resp = Invoke-RestMethod -Uri "$SD_API/sdapi/v1/img2img" -Method Post `
            -ContentType "application/json" -Body $body -TimeoutSec 180
        if ($resp.images.Count -gt 0) {
            [System.IO.File]::WriteAllBytes($OutputPath, [Convert]::FromBase64String($resp.images[0]))
            return $true
        }
    } catch {
        Write-Host "  SD API ERROR: $_" -ForegroundColor Red
    }
    return $false
}

function Convert-VideoFrames {
    param(
        [string]$VideoPath,
        [string]$OutDir,
        [string]$StyleKey = "editorial_anime",
        [int]$FrameCount = 5,
        [float]$Interval = 2.0
    )
    if (-not (Test-Path $VideoPath)) { Write-Host "视频不存在: $VideoPath"; return }
    if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

    $videoName = [System.IO.Path]::GetFileNameWithoutExtension($VideoPath)
    $ext = [System.IO.Path]::GetExtension($VideoPath)
    $videoOutDir = Join-Path $OutDir $videoName
    if (-not (Test-Path $videoOutDir)) { New-Item -ItemType Directory -Path $videoOutDir -Force | Out-Null }

    Write-Host "处理视频: $videoName$ext" -ForegroundColor Cyan
    Write-Host "输出目录: $videoOutDir"
    
    $idx = 0
    for ($t = 1; $t -le ($FrameCount * $Interval); $t += $Interval) {
        $idx++
        $framePath = Join-Path $videoOutDir "frame_${idx}.jpg"
        $outPath   = Join-Path $videoOutDir "frame_${idx}_illustrated.png"
        
        Write-Host "  [$idx/$FrameCount] 提取 $($t)s..."
        ffmpeg -y -i $VideoPath -ss $t -frames:v 1 -q:v 2 $framePath 2>$null
        
        if ((Test-Path $framePath) -and (Convert-Frame -FramePath $framePath -OutputPath $outPath -StyleKey $StyleKey)) {
            Write-Host "  ✓ $outPath" -ForegroundColor Green
        } else {
            Write-Host "  ✗ 转换失败" -ForegroundColor Red
        }
    }
    Write-Host "完成 $videoName。SD 输出在: $videoOutDir" -ForegroundColor Green
}

# 批量处理整个目录
function Convert-Directory {
    param(
        [string]$VideoDir,
        [string]$OutDir,
        [string]$StyleKey = "editorial_anime",
        [int]$FrameCount = 3
    )
    $videos = Get-ChildItem -LiteralPath $VideoDir -Recurse -File |
        Where-Object { $_.Extension -match '\.(mp4|mov|avi|mkv|flv|rmvb)$' }
    Write-Host "发现 $($videos.Count) 个视频待处理" -ForegroundColor Cyan
    
    foreach ($v in $videos) {
        Convert-VideoFrames -VideoPath $v.FullName -OutDir $OutDir -StyleKey $StyleKey -FrameCount $FrameCount
    }
    Write-Host "`n=== 全部完成 ===" -ForegroundColor Green
}

Write-Host "SD 风格转换脚本已加载。可用风格: $($Styles.Keys -join ', ')" -ForegroundColor Cyan
Write-Host "示例: Convert-VideoFrames -VideoPath 'video.mp4' -OutDir 'output' -StyleKey 'editorial_anime'" -ForegroundColor DarkGray
