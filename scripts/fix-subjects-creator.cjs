const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSubjectsCreator() {
  console.log('🔧 Arreglando relación subjects-teachers...\n');

  try {
    // 1. Obtener subjects sin createdBy
    const subjectsWithoutCreator = await prisma.subject.findMany({
      where: {
        createdBy: null
      }
    });

    console.log(`📊 Subjects sin createdBy: ${subjectsWithoutCreator.length}`);

    if (subjectsWithoutCreator.length === 0) {
      console.log('✅ Todos los subjects ya tienen createdBy asignado!');
      return;
    }

    // 2. Obtener el primer teacher disponible (o el que quieras asignar)
    const teachers = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    const teacherUsers = teachers.filter(user => 
      user.userRoles.some(userRole => userRole.role.name === 'teacher')
    );

    console.log(`👨‍🏫 Teachers encontrados: ${teacherUsers.length}`);

    if (teacherUsers.length === 0) {
      console.log('❌ No se encontraron teachers en la base de datos');
      console.log('🔧 Creando un teacher por defecto...');
      
      // Crear rol teacher si no existe
      let teacherRole = await prisma.role.findUnique({
        where: { name: 'teacher' }
      });

      if (!teacherRole) {
        teacherRole = await prisma.role.create({
          data: {
            name: 'teacher',
            description: 'Teacher role for educators'
          }
        });
      }

      // Crear usuario teacher por defecto
      const defaultTeacher = await prisma.user.create({
        data: {
          name: 'Profesor por Defecto',
          email: 'profesor@example.com',
          password: 'password123', // En producción, usar hash
          userRoles: {
            create: {
              roleId: teacherRole.id
            }
          }
        }
      });

      teacherUsers.push(defaultTeacher);
      console.log('✅ Teacher por defecto creado:', defaultTeacher.email);
    }

    // 3. Asignar el primer teacher como createdBy para todos los subjects sin createdBy
    const defaultTeacher = teacherUsers[0];
    console.log(`🎯 Usando teacher: ${defaultTeacher.name} (${defaultTeacher.email})`);

    // 4. Actualizar todos los subjects
    const updateResult = await prisma.subject.updateMany({
      where: {
        createdBy: null
      },
      data: {
        createdBy: defaultTeacher.id
      }
    });

    console.log(`✅ Actualizados ${updateResult.count} subjects`);

    // 5. Verificar resultado
    const updatedSubjects = await prisma.subject.findMany({
      where: {
        createdBy: defaultTeacher.id
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log('\n📋 SUBJECTS ACTUALIZADOS:');
    updatedSubjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name} → Creado por: ${subject.creator.name}`);
    });

    console.log('\n🎉 ¡ARREGLO COMPLETADO!');
    console.log('=====================================');
    console.log('🎯 Ahora cuando te loguees como teacher verás tus cursos');
    console.log(`📧 Puedes usar: ${defaultTeacher.email}`);
    console.log('🔄 Refresca el dashboard del frontend');

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

// Ejecutar
fixSubjectsCreator();
