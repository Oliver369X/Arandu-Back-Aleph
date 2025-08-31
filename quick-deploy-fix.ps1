# 🚀 Script Rápido para Aplicar Fix de Deployment en Render (PowerShell)

Write-Host "🔧 Aplicando fix para deployment en Render..." -ForegroundColor Cyan

# Asegurarse de estar en el directorio correcto
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "✅ Archivos modificados:" -ForegroundColor Green
Write-Host "  - Dockerfile (openssl1.1-compat → openssl-dev)" -ForegroundColor White
Write-Host "  - render.yaml (configuración automática)" -ForegroundColor White
Write-Host "  - Dockerfile.simple (alternativo)" -ForegroundColor White
Write-Host "  - scripts/deploy-render.js (validación)" -ForegroundColor White
Write-Host "  - package.json (nuevos comandos)" -ForegroundColor White

# Validar antes de hacer commit
Write-Host "🔍 Validando cambios..." -ForegroundColor Yellow
& npm run deploy:validate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Validación exitosa!" -ForegroundColor Green
    
    # Hacer commit de todos los cambios
    Write-Host "📝 Haciendo commit..." -ForegroundColor Blue
    & git add .
    & git commit -m @"
fix: actualizar Dockerfile para Alpine Linux 3.22 y agregar herramientas de deployment

- Reemplazar openssl1.1-compat con openssl-dev (compatible con Alpine 3.22)
- Agregar render.yaml para configuración automática
- Crear Dockerfile.simple como alternativo
- Agregar scripts de validación de deployment
- Documentar proceso completo de troubleshooting
"@
    
    # Pushear cambios
    Write-Host "🚀 Pusheando a repositorio..." -ForegroundColor Magenta
    & git push origin main
    
    Write-Host ""
    Write-Host "🎉 ¡Fix aplicado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Ve a Render y haz redeploy de tu servicio" -ForegroundColor White
    Write-Host "  2. Configura las variables de entorno necesarias" -ForegroundColor White
    Write-Host "  3. Verifica que el deployment funcione" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 URLs importantes:" -ForegroundColor Cyan
    Write-Host "  - Health check: https://tu-servicio.onrender.com/api-v1/health" -ForegroundColor White
    Write-Host "  - API docs: https://tu-servicio.onrender.com/api-docs" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Si tienes problemas, revisa RENDER_DEPLOYMENT_FIX.md" -ForegroundColor Yellow
    
} else {
    Write-Host "❌ La validación falló. Revisa los errores antes de hacer commit." -ForegroundColor Red
    exit 1
}

# Pausa para que el usuario pueda leer la salida
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
