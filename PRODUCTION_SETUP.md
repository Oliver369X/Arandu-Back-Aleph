# 🎮 Guía de Setup de Producción - Juegos Educativos

Esta guía te ayudará a poblar la base de datos de producción con cursos completos basados en los juegos HTML educativos.

## 🎯 ¿Qué hace este setup?

El script de producción crea automáticamente:

- 👨‍🏫 **1 Profesor** con credenciales de acceso
- 👨‍🎓 **1 Estudiante** con credenciales de acceso
- 📚 **4 Cursos completos** basados en los juegos HTML:
  - 🔗 **Aventura Ethereum** - Aprende blockchain de manera interactiva
  - 🌱 **Laboratorio de Fotosíntesis** - Descubre cómo las plantas crean energía
  - 🤖 **Aventura de IA** - Enseña a un robot mientras aprendes sobre ML
  - ⛓️ **Constructor Blockchain** - Construye tu propia cadena de bloques
- 🎮 **4 Juegos integrados** completamente funcionales en la plataforma
- 🔗 **Inscripciones automáticas** del estudiante en todos los cursos
- 📊 **Progreso inicial** configurado para el seguimiento

## 🚀 Ejecución Rápida

```bash
# Setup completo (populate + verify)
npm run setup:production

# O paso a paso:
npm run populate:production  # Crear todos los datos
npm run verify:production    # Verificar que todo se creó correctamente
```

## 📋 Prerrequisitos

1. **Base de datos configurada** con el esquema Prisma aplicado
2. **Variables de entorno** configuradas (DATABASE_URL, etc.)
3. **Archivos de juegos** presentes en `src/components/AIGame/examples/juegos/`

```bash
# Asegurar que el esquema esté aplicado
npx prisma migrate deploy  # Para producción
# O
npx prisma db push        # Para desarrollo
```

## 🎮 Juegos Incluidos

### 1. 🔗 Ethereum Learning.html
- **Curso**: "Aventura Ethereum - Blockchain para Principiantes"
- **Duración**: 45 minutos
- **Nivel**: Principiante
- **Descripción**: Juego 3D donde exploras el mundo Ethereum, recolectas ETH y aprendes sobre contratos inteligentes

### 2. 🌱 fotosintesis.html  
- **Curso**: "Laboratorio de Fotosíntesis"
- **Duración**: 30 minutos
- **Nivel**: Básico
- **Descripción**: Laboratorio virtual 3D donde experimentas con luz solar, agua y CO₂

### 3. 🤖 gameAI.html
- **Curso**: "Aventura de Inteligencia Artificial"
- **Duración**: 60 minutos  
- **Nivel**: Intermedio
- **Descripción**: Enseña a un robot sobre formas y objetos mientras aprendes conceptos de ML

### 4. ⛓️ gameBlokchin.html
- **Curso**: "Aventura Blockchain para Niños"
- **Duración**: 50 minutos
- **Nivel**: Intermedio
- **Descripción**: Construye y gestiona cadenas de bloques en un entorno 3D

## 🔐 Credenciales de Acceso

### Profesor
- **Email**: `profesor@arandu.com`
- **Password**: `ProfesorSeguro123!`
- **Nombre**: Prof. María Educadora

### Estudiante  
- **Email**: `estudiante@arandu.com`
- **Password**: `EstudianteSeguro123!`
- **Nombre**: Alex Estudiante

## 🔧 Configuración Técnica

### Procesamiento de HTML
Los juegos HTML son procesados automáticamente para:

- ✅ **Pantalla completa**: Estilos CSS para ocupar todo el viewport
- ✅ **Comunicación**: API de mensajes con la plataforma padre
- ✅ **Compatibilidad iframe**: Ajustes para renderizar correctamente
- ✅ **Responsive**: Adaptación a diferentes tamaños de pantalla
- ✅ **Accesibilidad**: Mejoras de contraste y visibilidad

### Estructura de Base de Datos Creada

```
📊 Datos Creados:
├── 🎭 Roles (teacher, student, admin)
├── 👥 Users (1 teacher + 1 student)  
├── 📚 Subjects (4 cursos)
├── 📖 Subtopics (4 subtópicos, 1 por curso)
├── 🎮 AIGames (4 juegos HTML integrados)
├── 🎓 Enrollments (estudiante inscrito en todos)
├── 📈 Progress (progreso inicial para seguimiento)
└── 📋 Grades (categorización académica)
```

## 🔍 Verificación

El script de verificación (`verify:production`) muestra:

- ✅ Conteo de todos los registros creados
- ✅ Relaciones entre entidades
- ✅ Validación del contenido HTML de los juegos
- ✅ Estado de inscripciones y progreso
- ✅ Resumen completo de la base de datos

### Ejemplo de salida:

```bash
🔍 Verificando datos en la base de datos...

📋 Roles encontrados: 3
  - teacher
  - student  
  - admin

👥 Usuarios encontrados: 2
  - Prof. María Educadora (profesor@arandu.com) - Roles: teacher
  - Alex Estudiante (estudiante@arandu.com) - Roles: student

📚 Cursos encontrados: 4
  - Aventura Ethereum - Blockchain para Principiantes
    📝 Creado por: Prof. María Educadora
    📖 Subtopics: 1
    🎮 Juegos: 1
    🎓 Inscritos: 1
      🎮 Aventura Ethereum Interactiva (adventure)

✅ Verificación completada!

📊 RESUMEN FINAL:
  👥 2 usuarios creados
  📚 4 cursos creados
  🎮 4 juegos integrados
  🎓 4 inscripciones realizadas
  📈 4 registros de progreso inicializados
```

## 🚨 Troubleshooting

### Error: "Archivo no encontrado"
```bash
⚠️  Archivo no encontrado: gameAI.html
```
**Solución**: Verifica que todos los archivos HTML estén en `src/components/AIGame/examples/juegos/`

### Error: "Roles no encontrados" 
```bash
❌ Roles no encontrados. Ejecuta el setup de roles primero.
```
**Solución**: 
```bash
npm run init-roles  # Crear roles básicos
```

### Error: "Usuario ya existe"
```bash
❌ Usuario ya existe con ese email
```
**Solución**: El script usa `upsert` y debería manejar esto automáticamente. Si persiste, verifica la base de datos.

### HTML inválido en juegos
```bash
❌ Juego HTML inválido
```
**Solución**: El script creará HTML de respaldo automáticamente.

## 🔄 Re-ejecución

El script es **idempotente** - puedes ejecutarlo múltiples veces sin problemas:

- ✅ **Usuarios**: Se actualizan si existen
- ✅ **Cursos**: Se crean nuevos solo si no existen  
- ✅ **Juegos**: Se reemplazan con contenido actualizado
- ✅ **Relaciones**: Se mantienen consistentes

## 📱 Uso en la Plataforma

Una vez ejecutado el script:

1. **Accede como profesor** para gestionar cursos
2. **Accede como estudiante** para jugar
3. **Los juegos** se renderizan en pantalla completa dentro de cada curso
4. **El progreso** se guarda automáticamente
5. **Las puntuaciones** se sincronizan con la plataforma

## 🌐 Deploy en Producción

Para usar en un servidor real:

1. **Configura la base de datos** de producción
2. **Actualiza DATABASE_URL** en variables de entorno
3. **Ejecuta migraciones**: `npx prisma migrate deploy`
4. **Ejecuta el setup**: `npm run setup:production`
5. **Verifica resultados**: `npm run verify:production`

¡Tu plataforma educativa estará lista con contenido real para usar! 🎉

---

## 📞 Soporte

Si tienes problemas:
1. ✅ Revisa los logs del script
2. ✅ Ejecuta `verify:production` para diagnosticar
3. ✅ Verifica las variables de entorno
4. ✅ Asegúrate que los archivos HTML estén presentes

**¡Happy Learning! 🎓✨**
