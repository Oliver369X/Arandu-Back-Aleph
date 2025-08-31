#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSubjectsCreator() {
  console.log('🔧 [FIX] Asignando creadores a subjects sin createdBy...\n');

  try {
    // 1. Buscar teachers disponibles
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

    console.log(`👨‍🏫 Teachers disponibles: ${teachers.length}`);
    
    if (teachers.length === 0) {
      console.log('❌ NO HAY TEACHERS DISPONIBLES');
      console.log('💡 Crear un usuario con rol teacher primero');
      return;
    }

    teachers.forEach((teacher, index) => {
      const roles = teacher.userRoles.map(ur => ur.role.name).join(', ');
      console.log(`   ${index + 1}. ${teacher.name} (${teacher.email}) - Roles: ${roles}`);
    });

    // 2. Buscar subjects sin createdBy
    const subjectsWithoutCreator = await prisma.subject.findMany({
      where: {
        createdBy: null
      }
    });

    console.log(`\n📚 Subjects sin creador: ${subjectsWithoutCreator.length}`);

    if (subjectsWithoutCreator.length === 0) {
      console.log('✅ TODOS LOS SUBJECTS YA TIENEN CREADOR ASIGNADO');
      return;
    }

    // 3. Asignar el primer teacher como creador de todos los subjects sin creador
    const defaultTeacher = teachers[0];
    console.log(`\n🎯 Asignando todos los subjects a: ${defaultTeacher.name} (${defaultTeacher.email})`);

    let updatedCount = 0;
    for (const subject of subjectsWithoutCreator) {
      try {
        await prisma.subject.update({
          where: {
            id: subject.id
          },
          data: {
            createdBy: defaultTeacher.id
          }
        });

        console.log(`✅ ${subject.name} → Asignado a ${defaultTeacher.name}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error actualizando ${subject.name}:`, error.message);
      }
    }

    console.log(`\n🎉 PROCESO COMPLETADO:`);
    console.log(`✅ Subjects actualizados: ${updatedCount}/${subjectsWithoutCreator.length}`);

    // 4. Verificación final
    console.log('\n🔍 VERIFICACIÓN FINAL:');
    const verificationSubjects = await prisma.subject.findMany({
      where: {
        createdBy: defaultTeacher.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`📊 ${defaultTeacher.name} ahora tiene ${verificationSubjects.length} subjects asignados:`);
    verificationSubjects.forEach((subject, index) => {
      console.log(`   ${index + 1}. ${subject.name}`);
      console.log(`      📝 Descripción: ${subject.description || 'Sin descripción'}`);
      console.log(`      🏷️ Categoría: ${subject.category || 'Sin categoría'}`);
    });

    // 5. Test de API endpoint
    console.log(`\n🧪 SIMULANDO LLAMADA AL API:`);
    console.log(`GET /subjects/creator/${defaultTeacher.id}`);
    console.log(`✅ Debería retornar ${verificationSubjects.length} subjects`);

    console.log(`\n🎯 PRÓXIMO PASO:`);
    console.log(`1. Hacer login como: ${defaultTeacher.email}`);
    console.log(`2. Ir a /dashboard/teacher`);
    console.log(`3. Verificar que ahora muestre ${verificationSubjects.length} cursos`);

  } catch (error) {
    console.error('❌ Error en el proceso de arreglo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSubjectsCreator().catch(console.error);
