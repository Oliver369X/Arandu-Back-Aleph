import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultRoles = [
  {
    name: 'admin',
    description: 'Administrador del sistema con acceso completo',
    permissions: JSON.stringify([
      'user:read',
      'user:write',
      'user:delete',
      'role:read',
      'role:write',
      'role:delete',
      'course:read',
      'course:write',
      'course:delete',
      'system:admin'
    ])
  },
  {
    name: 'teacher',
    description: 'Profesor con acceso a gestión de cursos y estudiantes',
    permissions: JSON.stringify([
      'course:read',
      'course:write',
      'student:read',
      'student:write',
      'progress:read',
      'progress:write',
      'content:read',
      'content:write'
    ])
  },
  {
    name: 'student',
    description: 'Estudiante con acceso a cursos y contenido educativo',
    permissions: JSON.stringify([
      'course:read',
      'content:read',
      'progress:read',
      'progress:write',
      'profile:read',
      'profile:write'
    ])
  },
  {
    name: 'institution',
    description: 'Institución educativa con acceso a reportes y gestión',
    permissions: JSON.stringify([
      'report:read',
      'student:read',
      'teacher:read',
      'course:read',
      'analytics:read',
      'institution:admin'
    ])
  }
];

async function initializeRoles() {
  try {
    console.log('🚀 Inicializando roles del sistema...');

    for (const roleData of defaultRoles) {
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name }
      });

      if (existingRole) {
        console.log(`✅ Rol '${roleData.name}' ya existe, actualizando...`);
        await prisma.role.update({
          where: { name: roleData.name },
          data: {
            description: roleData.description,
            permissions: roleData.permissions
          }
        });
      } else {
        console.log(`➕ Creando rol '${roleData.name}'...`);
        await prisma.role.create({
          data: roleData
        });
      }
    }

    console.log('✅ Roles inicializados correctamente!');
    
    // Mostrar roles creados
    const roles = await prisma.role.findMany();
    console.log('\n📋 Roles disponibles:');
    roles.forEach(role => {
      console.log(`  - ${role.name}: ${role.description}`);
    });

  } catch (error) {
    console.error('❌ Error al inicializar roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
initializeRoles();

export { initializeRoles };
