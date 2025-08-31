#!/bin/bash

# 🔧 Fix rápido para ES Modules en Render - SchoolAI Backend

echo "🚀 Aplicando fix de ES Modules para Render..."

# Asegurarse de estar en el directorio correcto
cd "$(dirname "$0")"

echo "✅ Fix aplicado:"
echo "  - wait-for-db.js: require() → import()"
echo "  - Health check: node -e → wget"
echo "  - Agregado wget a dependencias"

# Hacer commit del fix
echo "📝 Haciendo commit del fix ES Modules..."
git add Dockerfile Dockerfile.simple
git commit -m "fix: convertir wait-for-db.js a ES modules syntax

- Cambiar require() por import() en wait-for-db.js
- Simplificar health check para usar wget en lugar de node
- Agregar wget a dependencias del sistema Alpine
- Compatible con package.json type: module"

# Pushear cambios
echo "🚀 Pusheando fix a repositorio..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Fix de ES Modules aplicado exitosamente!"
    echo ""
    echo "📋 Lo que se arregló:"
    echo "  ❌ Error anterior: require is not defined in ES module scope"
    echo "  ✅ Solución: Convertido a import() syntax"
    echo ""
    echo "🔄 Próximo paso:"
    echo "  Ve a Render y haz redeploy - ahora debería funcionar completamente"
    echo ""
    echo "🔗 Una vez desplegado, verifica:"
    echo "  • https://tu-servicio.onrender.com/api-v1/health"
    echo "  • Logs del contenedor en Render"
    
else
    echo "❌ Error al pushear. Verifica tu conexión a Git."
    exit 1
fi
