# 🔧 Fix rápido para bcrypt/bcryptjs en Render - SchoolAI Backend (PowerShell)

Write-Host "🚀 Aplicando fix de bcrypt → bcryptjs para Render..." -ForegroundColor Cyan

# Asegurarse de estar en el directorio correcto
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "✅ Fix aplicado:" -ForegroundColor Green
Write-Host "  - package.json: bcrypt → bcryptjs" -ForegroundColor White
Write-Host "  - user.controllers.js: import bcrypt → bcryptjs" -ForegroundColor White
Write-Host "  - auth.controllers.js: import bcrypt → bcryptjs" -ForegroundColor White
Write-Host "  - populate-production-games.js: import bcrypt → bcryptjs" -ForegroundColor White

Write-Host ""
Write-Host "💡 ¿Por qué este cambio?" -ForegroundColor Yellow
Write-Host "  - bcrypt tiene binarios nativos (C++) que causan problemas en Docker" -ForegroundColor White
Write-Host "  - bcryptjs es JavaScript puro y funciona igual de bien" -ForegroundColor White
Write-Host "  - No hay diferencia en la API - es un drop-in replacement" -ForegroundColor White

# Hacer commit del fix
Write-Host "📝 Haciendo commit del fix bcrypt..." -ForegroundColor Blue
& git add package.json
& git add "src/components/user/user.controllers.js"
& git add "src/services/auth/auth.controllers.js"  
& git add "scripts/populate-production-games.js"

& git commit -m "fix: reemplazar bcrypt con bcryptjs para compatibilidad Docker

- bcrypt → bcryptjs en package.json (JavaScript puro, sin binarios nativos)
- Actualizar imports en user.controllers.js y auth.controllers.js
- Actualizar import en populate-production-games.js
- Soluciona el error: Cannot find module bcrypt_lib.node
- API idéntica, funciona como drop-in replacement"

# Pushear cambios
Write-Host "🚀 Pusheando fix a repositorio..." -ForegroundColor Magenta
& git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 ¡Fix de bcrypt aplicado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Lo que se arregló:" -ForegroundColor Cyan
    Write-Host "  ❌ Error anterior: Cannot find module bcrypt_lib.node" -ForegroundColor Red
    Write-Host "  ✅ Solución: bcryptjs (JavaScript puro, sin binarios nativos)" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Próximo paso:" -ForegroundColor Yellow
    Write-Host "  Ve a Render y haz redeploy - ahora debería funcionar COMPLETAMENTE" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Resultado esperado:" -ForegroundColor Cyan
    Write-Host "  • Build exitoso ✅" -ForegroundColor Green
    Write-Host "  • ES Modules funcionando ✅" -ForegroundColor Green
    Write-Host "  • Base de datos conecta ✅" -ForegroundColor Green
    Write-Host "  • bcryptjs funciona sin problemas ✅" -ForegroundColor Green
    Write-Host "  • API completamente funcional ✅" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Una vez desplegado, verifica:" -ForegroundColor Cyan
    Write-Host "  • https://tu-servicio.onrender.com/api-v1/health" -ForegroundColor White
    Write-Host "  • https://tu-servicio.onrender.com/api-docs" -ForegroundColor White
    Write-Host "  • Login funcional con las credenciales" -ForegroundColor White
    
} else {
    Write-Host "❌ Error al pushear. Verifica tu conexión a Git." -ForegroundColor Red
    exit 1
}

# Pausa para que el usuario pueda leer la salida
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
