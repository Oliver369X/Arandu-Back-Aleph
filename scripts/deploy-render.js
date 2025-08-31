#!/usr/bin/env node

/**
 * 🚀 Script de Deploy para Render
 * 
 * Valida el Dockerfile y prepara el deployment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function validateDockerfile() {
  colorLog('blue', '🔍 Validando Dockerfile...');
  
  const dockerfilePath = './Dockerfile';
  if (!fs.existsSync(dockerfilePath)) {
    throw new Error('Dockerfile no encontrado');
  }
  
  const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf-8');
  
  // Verificar que no tenga openssl1.1-compat
  if (dockerfileContent.includes('openssl1.1-compat')) {
    throw new Error('❌ Dockerfile contiene openssl1.1-compat que no es compatible con Alpine Linux 3.22');
  }
  
  colorLog('green', '✅ Dockerfile válido');
  return true;
}

async function validateEnvironment() {
  colorLog('blue', '🔍 Validando variables de entorno...');
  
  const requiredVars = [
    'DATABASE_URL',
    'NODE_ENV',
    'PORT'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    colorLog('yellow', `⚠️  Variables de entorno faltantes: ${missingVars.join(', ')}`);
    colorLog('yellow', '   Estas serán configuradas en Render');
  } else {
    colorLog('green', '✅ Variables de entorno configuradas');
  }
}

async function validatePrismaSchema() {
  colorLog('blue', '🔍 Validando esquema de Prisma...');
  
  const schemaPath = './prisma/schema.prisma';
  if (!fs.existsSync(schemaPath)) {
    throw new Error('Schema de Prisma no encontrado');
  }
  
  try {
    await execAsync('npx prisma validate');
    colorLog('green', '✅ Esquema de Prisma válido');
  } catch (error) {
    throw new Error(`❌ Esquema de Prisma inválido: ${error.message}`);
  }
}

async function validatePackageJson() {
  colorLog('blue', '🔍 Validando package.json...');
  
  const packagePath = './package.json';
  if (!fs.existsSync(packagePath)) {
    throw new Error('package.json no encontrado');
  }
  
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  // Verificar scripts esenciales
  const requiredScripts = ['start', 'build-prod'];
  const missingScripts = requiredScripts.filter(script => !packageData.scripts[script]);
  
  if (missingScripts.length > 0) {
    throw new Error(`❌ Scripts faltantes en package.json: ${missingScripts.join(', ')}`);
  }
  
  colorLog('green', '✅ package.json válido');
}

async function generateRenderConfig() {
  colorLog('blue', '📝 Generando configuración de Render...');
  
  const renderConfig = {
    name: "arandu-schoolai-backend",
    type: "web",
    env: "docker",
    repo: process.env.GITHUB_REPO || "https://github.com/tu-usuario/tu-repo",
    branch: "main",
    dockerfilePath: "./SchoolAI/Dockerfile",
    dockerContext: "./SchoolAI",
    envVars: [
      {
        key: "NODE_ENV",
        value: "production"
      },
      {
        key: "PORT",
        value: "3001"
      },
      {
        key: "DATABASE_URL",
        value: "postgresql://user:password@host:5432/database?schema=public"
      }
    ],
    healthCheckPath: "/api-v1/health",
    buildCommand: "npm run build-prod",
    startCommand: "npm start"
  };
  
  fs.writeFileSync('./render.yaml', `# Configuración de Render
# Generado automáticamente

name: ${renderConfig.name}
type: ${renderConfig.type}
env: ${renderConfig.env}
dockerfilePath: ${renderConfig.dockerfilePath}
dockerContext: ${renderConfig.dockerContext}

# Variables de entorno necesarias:
# - NODE_ENV=production
# - PORT=3001
# - DATABASE_URL=postgresql://...
# - JWT_SECRET=tu-secreto-jwt
# - GEMINI_API_KEY=tu-api-key (opcional)
# - FAL_KEY=tu-fal-key (opcional)

healthCheckPath: ${renderConfig.healthCheckPath}
`);
  
  colorLog('green', '✅ Configuración de Render generada');
}

async function runPreDeployChecks() {
  colorLog('magenta', '🚀 VALIDACIONES PRE-DEPLOY PARA RENDER\n');
  
  try {
    // 1. Validar Dockerfile
    await validateDockerfile();
    
    // 2. Validar environment
    await validateEnvironment();
    
    // 3. Validar Prisma
    await validatePrismaSchema();
    
    // 4. Validar package.json
    await validatePackageJson();
    
    // 5. Generar configuración
    await generateRenderConfig();
    
    // 6. Mostrar instrucciones finales
    showDeployInstructions();
    
    colorLog('green', '\n✅ ¡Todas las validaciones pasaron! Listo para deploy en Render');
    
  } catch (error) {
    colorLog('red', `\n❌ Error en validaciones: ${error.message}`);
    process.exit(1);
  }
}

function showDeployInstructions() {
  colorLog('cyan', '\n📋 INSTRUCCIONES PARA DEPLOY EN RENDER:');
  
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│                    PASOS PARA DEPLOYMENT                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1️⃣  CONFIGURAR SERVICIO WEB:                               │
│   • Build Command: npm run build-prod                      │
│   • Start Command: npm start                               │
│   • Dockerfile Path: ./SchoolAI/Dockerfile                 │
│                                                             │
│ 2️⃣  VARIABLES DE ENTORNO OBLIGATORIAS:                     │
│   • NODE_ENV=production                                     │
│   • PORT=3001                                              │
│   • DATABASE_URL=postgresql://user:pass@host:5432/db       │
│   • JWT_SECRET=tu-secreto-seguro                           │
│                                                             │
│ 3️⃣  VARIABLES OPCIONALES:                                  │
│   • GEMINI_API_KEY=tu-api-key (para IA)                   │
│   • FAL_KEY=tu-fal-key (para generación de imágenes)      │
│                                                             │
│ 4️⃣  CONFIGURAR BASE DE DATOS:                              │
│   • Crear PostgreSQL Database en Render                    │
│   • Copiar DATABASE_URL al servicio web                    │
│                                                             │
│ 5️⃣  HEALTH CHECK:                                          │
│   • Path: /api-v1/health                                   │
│   • Expected Status: 200                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
  `);
  
  colorLog('yellow', '⚠️  IMPORTANTE:');
  console.log('  • Asegúrate de que tu repo sea público o conectar GitHub');
  console.log('  • La primera build puede tomar 5-10 minutos');
  console.log('  • Revisa los logs si hay errores');
  
  colorLog('green', '\n🔗 URLs después del deploy:');
  console.log('  • API: https://tu-servicio.onrender.com');
  console.log('  • Health: https://tu-servicio.onrender.com/api-v1/health');
  console.log('  • Docs: https://tu-servicio.onrender.com/api-docs');
}

// Función para crear un Dockerfile optimizado para Render si es necesario
async function createOptimizedDockerfile() {
  colorLog('blue', '🔧 Creando Dockerfile optimizado para Render...');
  
  const optimizedDockerfile = `# 🎓 Dockerfile Optimizado para Render - SchoolAI Backend
FROM node:20-alpine AS builder

# Instalar dependencias necesarias
RUN apk add --no-cache \\
    libc6-compat \\
    python3 \\
    make \\
    g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar todas las dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# ============================================
# STAGE 2: Runner
# ============================================
FROM node:20-alpine AS runner

# Instalar solo lo necesario para runtime
RUN apk add --no-cache \\
    dumb-init \\
    ca-certificates

WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Crear usuario no-root
RUN addgroup --system --gid 1001 schoolai && \\
    adduser --system --uid 1001 schoolai

# Copiar node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copiar aplicación
COPY --chown=schoolai:schoolai . .

# Cambiar a usuario no-root
USER schoolai

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3001/api-v1/health', (res) => { \\
    if (res.statusCode === 200) process.exit(0); \\
    else process.exit(1); \\
  }).on('error', () => process.exit(1))"

# Comando de inicio
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
`;
  
  fs.writeFileSync('./Dockerfile.render', optimizedDockerfile);
  colorLog('green', '✅ Dockerfile.render creado (usa este si el original falla)');
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.includes('--create-optimized')) {
    createOptimizedDockerfile().catch(console.error);
  } else {
    runPreDeployChecks().catch(console.error);
  }
}

export { runPreDeployChecks, createOptimizedDockerfile };
