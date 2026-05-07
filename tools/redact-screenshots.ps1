param(
  [string] $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [switch] $DryRun
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function Redact-Image {
  param(
    [Parameter(Mandatory)] [string] $Path,
    [Parameter(Mandatory)] [hashtable[]] $Regions,
    [Parameter(Mandatory)] [System.Drawing.Color] $Color
  )

  $bytes = [System.IO.File]::ReadAllBytes($Path)
  $ms = New-Object System.IO.MemoryStream(,$bytes)
  $bitmap = New-Object System.Drawing.Bitmap($ms)

  try {
    $width = $bitmap.Width
    $height = $bitmap.Height

    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $brush = New-Object System.Drawing.SolidBrush($Color)
      try {
        foreach ($r in $Regions) {
          $x = [int]([Math]::Round($r.x * $width))
          $y = [int]([Math]::Round($r.y * $height))
          $w = [int]([Math]::Round($r.w * $width))
          $h = [int]([Math]::Round($r.h * $height))

          $w = [Math]::Max(1, $w)
          $h = [Math]::Max(1, $h)

          $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
          $graphics.FillRectangle($brush, $rect)
        }
      }
      finally {
        if ($brush) { $brush.Dispose() }
      }
    }
    finally {
      if ($graphics) { $graphics.Dispose() }
    }

    $tmpPath = "$Path.__redacted_tmp.png"
    $bitmap.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Move-Item -Path $tmpPath -Destination $Path -Force
  }
  finally {
    if ($bitmap) { $bitmap.Dispose() }
    if ($ms) { $ms.Dispose() }
  }
}

if (-not $RepoRoot) {
  throw "Não foi possível resolver RepoRoot"
}

$maskColor = [System.Drawing.Color]::FromArgb(255, 230, 230, 230)

$targets = @(
  # MOBILE (remove conteúdo completo EXCETO imagem e header)
  @{ rel = "assets/screens/mobile/Captura de tela 2026-04-16 231648.png"; regions = @(
      @{ x = 0.0; y = 0.40; w = 1.0; h = 0.60 }
    )
  },
  @{ rel = "assets/screens/mobile/Captura de tela 2026-04-16 231714.png"; regions = @(
      @{ x = 0.0; y = 0.25; w = 1.0; h = 0.75 }
    )
  },
  @{ rel = "assets/screens/mobile/Captura de tela 2026-04-16 231734.png"; regions = @(
      @{ x = 0.0; y = 0.30; w = 1.0; h = 0.70 }
    )
  },
  @{ rel = "assets/screens/mobile/Captura de tela 2026-04-16 231743.png"; regions = @(
      @{ x = 0.0; y = 0.10; w = 1.0; h = 0.90 }
    )
  },
  @{ rel = "assets/screens/mobile/Captura de tela 2026-04-16 231755.png"; regions = @(
      @{ x = 0.0; y = 0.0; w = 1.0; h = 1.0 }
    )
  },

  # ADMIN (remover TUDO que é nome/contato/tabela de dados com PII)
  @{ rel = "assets/screens/admin/Captura de tela 2026-04-16 230547.png"; regions = @(
      @{ x = 0.70; y = 0.05; w = 0.30; h = 0.12 },
      @{ x = 0.15; y = 0.23; w = 0.85; h = 0.50 }
    )
  },
  @{ rel = "assets/screens/admin/Captura de tela 2026-04-16 230605.png"; regions = @(
      @{ x = 0.70; y = 0.05; w = 0.30; h = 0.12 },
      @{ x = 0.15; y = 0.15; w = 0.85; h = 0.85 }
    )
  },
  @{ rel = "assets/screens/admin/Captura de tela 2026-04-16 230616.png"; regions = @(
      @{ x = 0.0; y = 0.0; w = 1.0; h = 1.0 }
    )
  },
  @{ rel = "assets/screens/admin/Captura de tela 2026-04-16 230624.png"; regions = @(
      @{ x = 0.0; y = 0.0; w = 1.0; h = 1.0 }
    )
  },
  @{ rel = "assets/screens/admin/Captura de tela 2026-04-16 230756.png"; regions = @(
      @{ x = 0.70; y = 0.05; w = 0.30; h = 0.12 },
      @{ x = 0.50; y = 0.15; w = 0.50; h = 0.50 }
    )
  },
  @{ rel = "assets/screens/admin/Captura de tela 2026-04-16 230826.png"; regions = @(
      @{ x = 0.70; y = 0.05; w = 0.30; h = 0.12 },
      @{ x = 0.40; y = 0.25; w = 0.60; h = 0.50 }
    )
  }
)

foreach ($t in $targets) {
  $path = Join-Path $RepoRoot $t.rel

  if (-not (Test-Path $path)) {
    Write-Warning "Arquivo não encontrado: $($t.rel)"
    continue
  }

  Write-Host "Redacting: $($t.rel)"
  if (-not $DryRun) {
    Redact-Image -Path $path -Regions $t.regions -Color $maskColor
  }
}

Write-Host "Concluído."