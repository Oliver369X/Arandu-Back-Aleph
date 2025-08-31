#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugTeacherSubjects() {
  console.log('🔍 [DEBUG] Verificando subjects en la base de datos...\n');

  try {
    // 1. Ver todos los subjects
    const allSubjects = await prisma.subject.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total subjects en la base de datos: ${allSubjects.length}\n`);

    // 2. Mostrar cada subject con su información
    allSubjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name}`);
      console.log(`   📅 Creado: ${subject.createdAt.toLocaleDateString()}`);
      console.log(`   👤 createdBy: ${subject.createdBy || 'NULL'}`);
      console.log(`   👨‍🏫 Creator: ${subject.creator ? `${subject.creator.name} (${subject.creator.email})` : 'NO ASIGNADO'}`);
      console.log(`   📝 Descripción: ${subject.description || 'Sin descripción'}`);
      console.log(`   🏷️ Categoría: ${subject.category || 'Sin categoría'}`);
      console.log('   ---');
    });

    // 3. Ver todos los usuarios con rol teacher
    const allUsers = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    const teachers = allUsers.filter(user => 
      user.userRoles.some(ur => 
        ur.role.name.toLowerCase().includes('teacher') || 
        ur.role.name.toLowerCase().includes('docente') ||
        ur.role.name.toLowerCase().includes('admin')
      )
    );

    console.log(`\n👨‍🏫 Teachers encontrados: ${teachers.length}\n`);
    
    teachers.forEach((teacher, index) => {
      const roles = teacher.userRoles.map(ur => ur.role.name).join(', ');
      console.log(`${index + 1}. ${teacher.name} (${teacher.email})`);
      console.log(`   🆔 ID: ${teacher.id}`);
      console.log(`   👤 Roles: ${roles}`);
      console.log(`   📅 Registrado: ${teacher.createdAt.toLocaleDateString()}`);
      
      // Ver subjects creados por este teacher
      const teacherSubjects = allSubjects.filter(s => s.createdBy === teacher.id);
      console.log(`   📚 Subjects creados: ${teacherSubjects.length}`);
      
      if (teacherSubjects.length > 0) {
        teacherSubjects.forEach(s => {
          console.log(`      - ${s.name}`);
        });
      }
      console.log('   ---');
    });

    // 4. Subjects sin creador asignado
    const subjectsWithoutCreator = allSubjects.filter(s => !s.createdBy);
    console.log(`\n⚠️  Subjects SIN creador asignado: ${subjectsWithoutCreator.length}\n`);
    
    if (subjectsWithoutCreator.length > 0) {
      console.log('🔧 PROBLEMA DETECTADO: Hay subjects sin field createdBy');
      console.log('💡 SOLUCIÓN: Ejecutar fix-subjects-creator.cjs para asignar creadores');
      console.log('📋 Subjects sin creador:');
      subjectsWithoutCreator.forEach((subject, index) => {
        console.log(`   ${index + 1}. ${subject.name} (ID: ${subject.id})`);
      });
    }

    // 5. Resumen del diagnóstico
    console.log('\n📋 RESUMEN DEL DIAGNÓSTICO:');
    console.log(`✅ Subjects total: ${allSubjects.length}`);
    console.log(`👨‍🏫 Teachers total: ${teachers.length}`);
    console.log(`📚 Subjects con creador: ${allSubjects.filter(s => s.createdBy).length}`);
    console.log(`❌ Subjects sin creador: ${subjectsWithoutCreator.length}`);
    
    if (subjectsWithoutCreator.length > 0) {
      console.log('\n🚨 PROBLEMA: Los subjects no tienen createdBy asignado');
      console.log('💡 EJECUTAR: node scripts/fix-subjects-creator.cjs');
    } else {
      console.log('\n✅ ESTADO: Todos los subjects tienen creador asignado');
    }

    // 6. Test de consulta específica para un teacher
    if (teachers.length > 0) {
      const firstTeacher = teachers[0];
      console.log(`\n🧪 PRUEBA: Consultando subjects para ${firstTeacher.name} (${firstTeacher.id})`);
      
      const teacherSpecificSubjects = await prisma.subject.findMany({
        where: {
          createdBy: firstTeacher.id
        },
        include: {
          subtopics: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      console.log(`📊 Resultado: ${teacherSpecificSubjects.length} subjects encontrados`);
      
      if (teacherSpecificSubjects.length > 0) {
        console.log('✅ LA CONSULTA FUNCIONA CORRECTAMENTE');
        teacherSpecificSubjects.forEach(s => {
          console.log(`   - ${s.name} (subtopics: ${s.subtopics.length})`);
        });
      } else {
        console.log('❌ NO SE ENCONTRARON SUBJECTS PARA ESTE TEACHER');
        console.log('💡 Esto explica por qué el dashboard muestra vacío');
      }
    }

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTeacherSubjects().catch(console.error);
