const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTeacherSubjects() {
  console.log('🧪 Probando relación teacher-subjects directamente en DB\n');

  try {
    // Obtener el usuario "hola"
    const teacher = await prisma.user.findUnique({
      where: {
        email: 'hola@hola.com'
      },
      include: {
        createdSubjects: {
          include: {
            subtopics: true
          }
        }
      }
    });

    if (!teacher) {
      console.log('❌ No se encontró el teacher con email hola@hola.com');
      return;
    }

    console.log(`👨‍🏫 Teacher: ${teacher.name} (${teacher.id})`);
    console.log(`📧 Email: ${teacher.email}`);
    console.log(`📚 Subjects creados: ${teacher.createdSubjects.length}`);

    if (teacher.createdSubjects.length > 0) {
      console.log('\n📋 SUBJECTS CREADOS POR ESTE TEACHER:');
      teacher.createdSubjects.forEach((subject, index) => {
        console.log(`${index + 1}. ${subject.name}`);
        console.log(`   📝 Descripción: ${subject.description || 'Sin descripción'}`);
        console.log(`   🏷️ Categoría: ${subject.category || 'Sin categoría'}`);
        console.log(`   📊 Dificultad: ${subject.difficulty || 'No especificada'}`);
        console.log(`   📅 Creado: ${new Date(subject.createdAt).toLocaleDateString()}`);
        console.log(`   📚 Subtópicos: ${subject.subtopics.length}`);
        console.log('');
      });

      console.log('✅ LA RELACIÓN FUNCIONA CORRECTAMENTE');
      console.log('=====================================');
      console.log('🎯 Cuando te loguees con este usuario en el frontend:');
      console.log(`📧 Email: ${teacher.email}`);
      console.log('🔄 Deberías ver estos subjects en tu dashboard');
      console.log('💡 Si no los ves, verifica que el servidor esté corriendo');
    } else {
      console.log('❌ Este teacher no tiene subjects creados');
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

// Ejecutar
testTeacherSubjects();
