# 🧪 School AI - Guía de Testing y Documentación de APIs

## 📋 Resumen

Este documento explica cómo probar y documentar todas las APIs del backend de School AI. Incluye pruebas automatizadas, documentación Swagger y ejemplos de uso.

## 🚀 Inicio Rápido

### 1. Iniciar el Servidor
```bash
cd SchoolAI
npm run dev
```

### 2. Acceder a la Documentación Swagger
Abre tu navegador en: **http://localhost:3001/api-docs**

### 3. Ejecutar Todas las Pruebas
```bash
npm test
```

## 🔧 Scripts de Prueba Disponibles

### Pruebas Completas
```bash
npm test                 # Ejecuta todas las pruebas
```

### Pruebas Específicas
```bash
npm run test:roles       # Solo pruebas de roles
npm run test:auth        # Solo pruebas de autenticación  
npm run test:users       # Solo pruebas de usuarios
```

### Utilidades
```bash
npm run init-roles       # Inicializar roles por defecto
```

## 📚 APIs Documentadas

### ✅ Completamente Documentadas

#### 🔐 **Autenticación** (`/auth`)
- **POST** `/auth/login` - Login de usuario
- Documentación: `src/services/auth/auth.swagger.js`
- Pruebas: `scripts/test-auth.js`

#### 👥 **Roles** (`/roles`)
- **GET** `/roles` - Obtener todos los roles
- **POST** `/roles` - Crear nuevo rol
- **GET** `/roles/{id}` - Obtener rol por ID
- **PUT** `/roles` - Actualizar rol
- **DELETE** `/roles/{id}` - Eliminar rol
- **GET** `/roles/activos` - Obtener roles activos
- **GET** `/roles/nombre/{name}` - Obtener rol por nombre
- **GET** `/roles/usuarios/{roleId}` - Obtener usuarios con rol específico
- Documentación: `src/components/role/role.swagger.js`
- Pruebas: `scripts/test-roles.js`

#### 👤 **Usuarios** (`/usuario`)
- **GET** `/usuario` - Obtener todos los usuarios
- **POST** `/usuario` - Crear nuevo usuario (con soporte para roles)
- **GET** `/usuario/{id}` - Obtener usuario por ID
- **PUT** `/usuario` - Actualizar usuario
- **DELETE** `/usuario/{id}` - Eliminar usuario
- **GET** `/usuario/email/{email}` - Obtener usuario por email
- **PATCH** `/usuario/password` - Cambiar contraseña
- **POST** `/usuario/assign-rol` - Asignar rol a usuario
- **DELETE** `/usuario/remove-rol` - Remover rol de usuario
- Documentación: `src/components/user/user.swagger.js`

### 🔄 Parcialmente Documentadas

#### 🎓 **Grados** (`/grades`)
- Documentación: `src/components/grade/grade.swagger.js` (existente)
- Pruebas: Pendiente

#### 🤖 **AI y Feedback** (`/ai-feedback`, `/ai-writing-assistant`)
- Documentación: Pendiente
- Pruebas: Pendiente

## 🧪 Ejemplos de Uso

### Registro de Usuario con Rol
```bash
curl -X POST http://localhost:3001/api-v1/usuario \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Profesor",
    "email": "juan@escuela.com",
    "password": "password123",
    "role": "ROLE_ID_AQUI"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api-v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@escuela.com",
    "password": "password123"
  }'
```

### Crear Rol
```bash
curl -X POST http://localhost:3001/api-v1/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "coordinador",
    "description": "Coordinador académico",
    "permissions": "[\"course:read\", \"course:write\", \"student:read\"]"
  }'
```

## 📊 Interpretación de Resultados de Pruebas

### Códigos de Estado
- ✅ **Verde**: Prueba exitosa
- ⚠️ **Amarillo**: Advertencia o prueba parcial
- ❌ **Rojo**: Prueba fallida

### Ejemplo de Salida
```
🧪 TESTING ROLES API
==================================================

📋 Test 1: GET /roles - Obtener todos los roles
✅ PASS - Obtenidos 5 roles

➕ Test 2: POST /roles - Crear un nuevo rol  
✅ PASS - Rol creado con ID: abc123...

📊 RESUMEN DE PRUEBAS
==================================================
Total de pruebas: 7
Pruebas exitosas: 7
Pruebas fallidas: 0
Porcentaje de éxito: 100%
```

## 🔍 Troubleshooting

### Servidor No Responde
```bash
# Verificar que el servidor esté corriendo
curl http://localhost:3001/api-v1/roles

# Si no responde, iniciar el servidor
npm run dev
```

### Base de Datos No Conecta
```bash
# Verificar conexión a PostgreSQL
npx prisma studio

# Ejecutar migraciones si es necesario
npx prisma migrate dev
```

### Roles No Existen
```bash
# Inicializar roles por defecto
npm run init-roles
```

## 🛠️ Desarrollo

### Agregar Nueva Prueba
1. Crear archivo en `scripts/test-{modulo}.js`
2. Seguir el patrón de `test-roles.js`
3. Agregar script en `package.json`
4. Actualizar este README

### Agregar Documentación Swagger
1. Crear archivo `{modulo}.swagger.js`
2. Definir schemas y endpoints
3. La documentación se incluye automáticamente

## 📈 Métricas de Cobertura

### APIs Documentadas: 3/6 (50%)
- ✅ Autenticación
- ✅ Roles  
- ✅ Usuarios
- ⏳ Grados
- ⏳ AI/Feedback
- ⏳ Materias/Subtemas

### APIs con Pruebas: 3/6 (50%)
- ✅ Autenticación
- ✅ Roles
- ✅ Usuarios (básico)
- ⏳ Grados
- ⏳ AI/Feedback  
- ⏳ Materias/Subtemas

## 🎯 Próximos Pasos

1. **Completar documentación Swagger** para grados, AI y materias
2. **Crear pruebas** para todos los módulos restantes
3. **Implementar pruebas de integración** entre módulos
4. **Agregar pruebas de rendimiento** para endpoints críticos
5. **Configurar CI/CD** para ejecutar pruebas automáticamente

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs del servidor
2. Verifica la documentación Swagger
3. Ejecuta las pruebas específicas del módulo
4. Consulta este README para ejemplos

---

**¡Happy Testing! 🚀**

