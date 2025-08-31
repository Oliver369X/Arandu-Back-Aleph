#!/bin/bash

# 🚀 Script Rápido para Aplicar Fix de Deployment en Render

echo "🔧 Aplicando fix para deployment en Render..."

# Asegurarse de estar en el directorio correcto
cd "$(dirname "$0")"

echo "✅ Archivos modificados:"
echo "  - Dockerfile (openssl1.1-compat → openssl-dev)"
echo "  - render.yaml (configuración automática)"
echo "  - Dockerfile.simple (alternativo)"
echo "  - scripts/deploy-render.js (validación)"
echo "  - package.json (nuevos comandos)"

# Validar antes de hacer commit
echo "🔍 Validando cambios..."
npm run deploy:validate

if [ $? -eq 0 ]; then
    echo "✅ Validación exitosa!"
    
    # Hacer commit de todos los cambios
    echo "📝 Haciendo commit..."
    git add .
    git commit -m "fix: actualizar Dockerfile para Alpine Linux 3.22 y agregar herramientas de deployment

- Reemplazar openssl1.1-compat con openssl-dev (compatible con Alpine 3.22)
- Agregar render.yaml para configuración automática
- Crear Dockerfile.simple como alternativo
- Agregar scripts de validación de deployment
- Documentar proceso completo de troubleshooting"
    
    # Pushear cambios
    echo "🚀 Pusheando a repositorio..."
    git push origin main
    
    echo ""
    echo "🎉 ¡Fix aplicado exitosamente!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "  1. Ve a Render y haz redeploy de tu servicio"
    echo "  2. Configura las variables de entorno necesarias"
    echo "  3. Verifica que el deployment funcione"
    echo ""
    echo "🔗 URLs importantes:"
    echo "  - Health check: https://tu-servicio.onrender.com/api-v1/health"
    echo "  - API docs: https://tu-servicio.onrender.com/api-docs"
    echo ""
    echo "💡 Si tienes problemas, revisa RENDER_DEPLOYMENT_FIX.md"
    
else
    echo "❌ La validación falló. Revisa los errores antes de hacer commit."
    exit 1
fi
