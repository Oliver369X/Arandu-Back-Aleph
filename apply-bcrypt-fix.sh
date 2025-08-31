#!/bin/bash

# 🔧 Fix rápido para bcrypt/bcryptjs en Render - SchoolAI Backend

echo "🚀 Aplicando fix de bcrypt → bcryptjs para Render..."

# Asegurarse de estar en el directorio correcto
cd "$(dirname "$0")"

echo "✅ Fix aplicado:"
echo "  - package.json: bcrypt → bcryptjs"
echo "  - user.controllers.js: import bcrypt → bcryptjs"
echo "  - auth.controllers.js: import bcrypt → bcryptjs"
echo "  - populate-production-games.js: import bcrypt → bcryptjs"

echo ""
echo "💡 ¿Por qué este cambio?"
echo "  - bcrypt tiene binarios nativos (C++) que causan problemas en Docker"
echo "  - bcryptjs es JavaScript puro y funciona igual de bien"
echo "  - No hay diferencia en la API - es un drop-in replacement"

# Hacer commit del fix
echo "📝 Haciendo commit del fix bcrypt..."
git add package.json
git add "src/components/user/user.controllers.js"
git add "src/services/auth/auth.controllers.js"
git add "scripts/populate-production-games.js"

git commit -m "fix: reemplazar bcrypt con bcryptjs para compatibilidad Docker

- bcrypt → bcryptjs en package.json (JavaScript puro, sin binarios nativos)
- Actualizar imports en user.controllers.js y auth.controllers.js
- Actualizar import en populate-production-games.js
- Soluciona el error: Cannot find module bcrypt_lib.node
- API idéntica, funciona como drop-in replacement"

# Pushear cambios
echo "🚀 Pusheando fix a repositorio..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Fix de bcrypt aplicado exitosamente!"
    echo ""
    echo "📋 Lo que se arregló:"
    echo "  ❌ Error anterior: Cannot find module bcrypt_lib.node"
    echo "  ✅ Solución: bcryptjs (JavaScript puro, sin binarios nativos)"
    echo ""
    echo "🔄 Próximo paso:"
    echo "  Ve a Render y haz redeploy - ahora debería funcionar COMPLETAMENTE"
    echo ""
    echo "🎯 Resultado esperado:"
    echo "  • Build exitoso ✅"
    echo "  • ES Modules funcionando ✅"
    echo "  • Base de datos conecta ✅"
    echo "  • bcryptjs funciona sin problemas ✅"
    echo "  • API completamente funcional ✅"
    echo ""
    echo "🔗 Una vez desplegado, verifica:"
    echo "  • https://tu-servicio.onrender.com/api-v1/health"
    echo "  • https://tu-servicio.onrender.com/api-docs"
    echo "  • Login funcional con las credenciales"
    
else
    echo "❌ Error al pushear. Verifica tu conexión a Git."
    exit 1
fi
