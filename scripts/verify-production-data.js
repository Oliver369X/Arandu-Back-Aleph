#!/usr/bin/env node

/**
 * 🔍 Script de Verificación de Datos de Producción
 * 
 * Verifica que todos los datos fueron creados correctamente
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');

    // Verificar roles
    const roles = await prisma.role.findMany();
    console.log(`📋 Roles encontrados: ${roles.length}`);
    roles.forEach(role => console.log(`  - ${role.name}`));

    // Verificar usuarios
    const users = await prisma.user.findMany({
      include: { 
        roles: { include: { role: true } }
      }
    });
    console.log(`\n👥 Usuarios encontrados: ${users.length}`);
    users.forEach(user => {
      const roleNames = user.roles.map(ur => ur.role.name).join(', ');
      console.log(`  - ${user.name} (${user.email}) - Roles: ${roleNames}`);
    });

    // Verificar cursos/subjects
    const subjects = await prisma.subject.findMany({
      include: {
        creator: true,
        subtopics: {
          include: {
            aiGames: true
          }
        },
        enrollments: {
          include: {
            user: true
          }
        }
      }
    });
    
    console.log(`\n📚 Cursos encontrados: ${subjects.length}`);
    subjects.forEach(subject => {
      console.log(`  - ${subject.name}`);
      console.log(`    📝 Creado por: ${subject.creator.name}`);
      console.log(`    📖 Subtopics: ${subject.subtopics.length}`);
      console.log(`    🎮 Juegos: ${subject.subtopics.reduce((total, st) => total + st.aiGames.length, 0)}`);
      console.log(`    🎓 Inscritos: ${subject.enrollments.length}`);
      
      subject.subtopics.forEach(subtopic => {
        if (subtopic.aiGames.length > 0) {
          subtopic.aiGames.forEach(game => {
            console.log(`      🎮 ${game.title} (${game.gameType})`);
          });
        }
      });
    });

    // Verificar inscripciones
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: true,
        subject: true
      }
    });
    console.log(`\n🎓 Inscripciones encontradas: ${enrollments.length}`);
    enrollments.forEach(enrollment => {
      console.log(`  - ${enrollment.user.name} → ${enrollment.subject.name}`);
    });

    // Verificar juegos AI
    const aiGames = await prisma.aIGame.findMany({
      include: {
        creator: true,
        subtopic: {
          include: {
            subject: true
          }
        }
      }
    });
    
    console.log(`\n🎮 Juegos AI encontrados: ${aiGames.length}`);
    aiGames.forEach(game => {
      const htmlSize = Math.round(game.htmlContent.length / 1024);
      console.log(`  - ${game.title}`);
      console.log(`    📋 Tipo: ${game.gameType} | Dificultad: ${game.difficulty}`);
      console.log(`    📊 HTML: ${htmlSize}KB | Activo: ${game.isActive}`);
      console.log(`    📚 Curso: ${game.subtopic.subject.name}`);
      console.log(`    👨‍🏫 Creado por: ${game.creator.name}`);
    });

    // Verificar progreso
    const progress = await prisma.progress.findMany({
      include: {
        user: true,
        subtopic: {
          include: {
            subject: true
          }
        }
      }
    });
    
    console.log(`\n📈 Registros de progreso: ${progress.length}`);
    if (progress.length > 0) {
      console.log(`  Progreso por usuario:`);
      const progressByUser = progress.reduce((acc, p) => {
        if (!acc[p.user.name]) acc[p.user.name] = [];
        acc[p.user.name].push(p);
        return acc;
      }, {});
      
      Object.entries(progressByUser).forEach(([userName, userProgress]) => {
        console.log(`    - ${userName}: ${userProgress.length} subtópicos`);
      });
    }

    console.log('\n✅ Verificación completada!');
    
    // Resumen final
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`  👥 ${users.length} usuarios creados`);
    console.log(`  📚 ${subjects.length} cursos creados`);
    console.log(`  🎮 ${aiGames.length} juegos integrados`);
    console.log(`  🎓 ${enrollments.length} inscripciones realizadas`);
    console.log(`  📈 ${progress.length} registros de progreso inicializados`);

    // Verificar que cada juego tenga contenido HTML válido
    console.log('\n🔍 Verificando contenido HTML de juegos:');
    let validGames = 0;
    for (const game of aiGames) {
      const hasValidHTML = game.htmlContent.includes('<!DOCTYPE html') && 
                          game.htmlContent.includes('</html>');
      if (hasValidHTML) {
        validGames++;
        console.log(`  ✅ ${game.title}: HTML válido`);
      } else {
        console.log(`  ❌ ${game.title}: HTML inválido`);
      }
    }
    console.log(`\n📊 Juegos con HTML válido: ${validGames}/${aiGames.length}`);

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyData();
}

export default verifyData;
