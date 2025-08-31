# 🎓 Dockerfile para Backend (SchoolAI - Node.js/Express)
# Imagen multi-stage para optimizar el tamaño del container

# ============================================
# STAGE 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    openssl-dev

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --only=production --ignore-scripts

# ============================================
# STAGE 2: Builder (para Prisma)
# ============================================
FROM node:20-alpine AS builder

# Instalar dependencias necesarias para Prisma
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    openssl-dev

WORKDIR /app

# Copiar archivos de dependencias y instalar todo (incluyendo devDependencies)
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar código fuente y configuración de Prisma
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# ============================================
# STAGE 3: Runner (Imagen final)
# ============================================
FROM node:20-alpine AS runner

# Instalar dependencias del sistema para runtime
RUN apk add --no-cache \
    dumb-init \
    openssl-dev \
    ca-certificates \
    wget

WORKDIR /app

# Configurar usuario no-root por seguridad
RUN addgroup --system --gid 1001 schoolai
RUN adduser --system --uid 1001 schoolai

# Variables de entorno de producción
ENV NODE_ENV=production
ENV PORT=3001

# Copiar dependencias de producción
COPY --from=deps /app/node_modules ./node_modules

# Copiar Prisma Client generado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copiar archivos de la aplicación
COPY --chown=schoolai:schoolai . .

# Crear directorio para archivos temporales
RUN mkdir -p /app/temp && chown -R schoolai:schoolai /app/temp

# Crear directorio para uploads si existe
RUN mkdir -p /app/uploads && chown -R schoolai:schoolai /app/uploads

# Cambiar al usuario no-root
USER schoolai

# Exponer puerto
EXPOSE 3001

# Health check simple y confiable
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api-v1/health || exit 1

# Script de arranque que espera la base de datos
COPY --chown=schoolai:schoolai <<'EOF' /app/wait-for-db.js
import { PrismaClient } from '@prisma/client';

async function waitForDatabase(maxRetries = 30) {
  const prisma = new PrismaClient();
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      await prisma.$disconnect();
      return;
    } catch (error) {
      console.log(`⏳ Waiting for database... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.error('❌ Could not connect to database after maximum retries');
  process.exit(1);
}

waitForDatabase().then(async () => {
  console.log('🚀 Starting SchoolAI backend...');
  const { default: app } = await import('./src/index.js');
}).catch(console.error);
EOF

# Comando para ejecutar la aplicación con dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "wait-for-db.js"]

# ============================================
# Metadata del container
# ============================================
LABEL org.opencontainers.image.title="SchoolAI Backend API" \
      org.opencontainers.image.description="Backend API de la plataforma educativa Arandu construido con Node.js/Express y Prisma" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.authors="Team Arandu" \
      org.opencontainers.image.source="https://github.com/your-repo/schoolai-backend"
