# 🔧 Fix rápido para ES Modules en Render - SchoolAI Backend (PowerShell)

Write-Host "🚀 Aplicando fix de ES Modules para Render..." -ForegroundColor Cyan

# Asegurarse de estar en el directorio correcto
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "✅ Fix aplicado:" -ForegroundColor Green
Write-Host "  - wait-for-db.js: require() → import()" -ForegroundColor White
Write-Host "  - Health check: node -e → wget" -ForegroundColor White
Write-Host "  - Agregado wget a dependencias" -ForegroundColor White

# Hacer commit del fix
Write-Host "📝 Haciendo commit del fix ES Modules..." -ForegroundColor Blue
& git add Dockerfile Dockerfile.simple
& git commit -m "fix: convertir wait-for-db.js a ES modules syntax

- Cambiar require() por import() en wait-for-db.js
- Simplificar health check para usar wget en lugar de node
- Agregar wget a dependencias del sistema Alpine
- Compatible con package.json type: module"

# Pushear cambios
Write-Host "🚀 Pusheando fix a repositorio..." -ForegroundColor Magenta
& git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 ¡Fix de ES Modules aplicado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Lo que se arregló:" -ForegroundColor Cyan
    Write-Host "  ❌ Error anterior: require is not defined in ES module scope" -ForegroundColor Red
    Write-Host "  ✅ Solución: Convertido a import() syntax" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Próximo paso:" -ForegroundColor Yellow
    Write-Host "  Ve a Render y haz redeploy - ahora debería funcionar completamente" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Una vez desplegado, verifica:" -ForegroundColor Cyan
    Write-Host "  • https://tu-servicio.onrender.com/api-v1/health" -ForegroundColor White
    Write-Host "  • Logs del contenedor en Render" -ForegroundColor White
    
} else {
    Write-Host "❌ Error al pushear. Verifica tu conexión a Git." -ForegroundColor Red
    exit 1
}

# Pausa para que el usuario pueda leer la salida
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
