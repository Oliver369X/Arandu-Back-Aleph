#!/usr/bin/env node

/**
 * 🧹 Script de Limpieza de Datos de Producción
 * 
 * CUIDADO: Este script elimina TODOS los datos de la base de datos
 * Úsalo solo si quieres empezar desde cero
 */

import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

// Crear interfaz para input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function resetDatabase() {
  try {
    console.log('🧹 SCRIPT DE LIMPIEZA DE BASE DE DATOS');
    console.log('⚠️  ¡CUIDADO! Este script eliminará TODOS los datos\n');

    // Confirmación de seguridad
    const confirmation1 = await askQuestion('¿Estás seguro de que quieres eliminar TODOS los datos? (escribe "SI" para confirmar): ');
    
    if (confirmation1 !== 'SI') {
      console.log('❌ Operación cancelada por seguridad.');
      rl.close();
      return;
    }

    const confirmation2 = await askQuestion('⚠️  ÚLTIMA ADVERTENCIA: Esto NO se puede deshacer. Escribe "ELIMINAR TODO" para continuar: ');
    
    if (confirmation2 !== 'ELIMINAR TODO') {
      console.log('❌ Operación cancelada por seguridad.');
      rl.close();
      return;
    }

    console.log('\n🚀 Iniciando limpieza de base de datos...');

    // Eliminar en orden inverso de dependencias para evitar errores de foreign key
    console.log('🗑️  Eliminando Progress...');
    await prisma.progress.deleteMany({});

    console.log('🗑️  Eliminando Enrollments...');
    await prisma.enrollment.deleteMany({});

    console.log('🗑️  Eliminando ClassAssignments...');
    await prisma.classAssignment.deleteMany({});

    console.log('🗑️  Eliminando AIFeedBacks...');
    await prisma.aIFeedBack.deleteMany({});

    console.log('🗑️  Eliminando AIGames...');
    await prisma.aIGame.deleteMany({});

    console.log('🗑️  Eliminando Subtopics...');
    await prisma.subtopic.deleteMany({});

    console.log('🗑️  Eliminando Subjects...');
    await prisma.subject.deleteMany({});

    console.log('🗑️  Eliminando Schedules...');
    await prisma.schedule.deleteMany({});

    console.log('🗑️  Eliminando UserRoles...');
    await prisma.userRole.deleteMany({});

    console.log('🗑️  Eliminando Users...');
    await prisma.user.deleteMany({});

    console.log('🗑️  Eliminando Roles...');
    await prisma.role.deleteMany({});

    console.log('🗑️  Eliminando Grades...');
    await prisma.grade.deleteMany({});

    // Verificar que todo fue eliminado
    const counts = {
      users: await prisma.user.count(),
      roles: await prisma.role.count(),
      subjects: await prisma.subject.count(),
      subtopics: await prisma.subtopic.count(),
      aiGames: await prisma.aIGame.count(),
      enrollments: await prisma.enrollment.count(),
      progress: await prisma.progress.count(),
      grades: await prisma.grade.count()
    };

    console.log('\n📊 Verificación post-limpieza:');
    Object.entries(counts).forEach(([table, count]) => {
      const status = count === 0 ? '✅' : '❌';
      console.log(`  ${status} ${table}: ${count} registros restantes`);
    });

    const totalRemaining = Object.values(counts).reduce((sum, count) => sum + count, 0);

    if (totalRemaining === 0) {
      console.log('\n✅ ¡Base de datos limpiada exitosamente!');
      console.log('💡 Ahora puedes ejecutar: npm run populate:production');
    } else {
      console.log('\n⚠️  Algunos registros no se pudieron eliminar.');
      console.log('💡 Esto puede ser debido a restricciones de foreign key.');
    }

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
    
    if (error.code === 'P2003') {
      console.log('\n💡 Sugerencia: Hay restricciones de foreign key.');
      console.log('   Intenta eliminar manualmente las tablas dependientes primero.');
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Función alternativa para forzar limpieza (sin confirmación)
async function forceReset() {
  try {
    console.log('🧹 FORZANDO limpieza de base de datos...');
    
    // Eliminar todo sin confirmación (para automatización)
    const tables = [
      'progress', 'enrollment', 'classAssignment', 'aIFeedBack', 
      'aIGame', 'subtopic', 'subject', 'schedule', 'userRole', 
      'user', 'role', 'grade'
    ];

    for (const table of tables) {
      try {
        console.log(`🗑️  Eliminando ${table}...`);
        await prisma[table].deleteMany({});
      } catch (error) {
        console.warn(`⚠️  Error eliminando ${table}:`, error.message);
      }
    }

    console.log('✅ Limpieza forzada completada');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza forzada:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar según argumentos
const args = process.argv.slice(2);

if (args.includes('--force')) {
  // Modo forzado para scripts automatizados
  forceReset();
} else {
  // Modo interactivo con confirmaciones
  resetDatabase();
}

export { forceReset };
