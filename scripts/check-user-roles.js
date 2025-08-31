import pkg from '@prisma/client';
const {PrismaClient} = pkg;
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'maria4@gmail.com' },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    
    console.log('🔍 Usuario encontrado:', user ? 'SI' : 'NO');
    if (user) {
      console.log('📧 Email:', user.email);
      console.log('🆔 ID:', user.id);
      console.log('👤 Nombre:', user.name);
      console.log('🎭 Roles asignados:', user.userRoles.length);
      
      if (user.userRoles.length === 0) {
        console.log('❌ NO TIENE ROLES ASIGNADOS - Este es el problema!');
      } else {
        user.userRoles.forEach(ur => {
          console.log(`✅ Rol: ${ur.role.name} (ID: ${ur.role.id})`);
        });
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUser();
