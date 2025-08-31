import fetch from 'node-fetch';

async function getRoles() {
  try {
    const response = await fetch('http://localhost:3001/api-v1/roles');
    const roles = await response.json();
    
    console.log('🎯 Roles disponibles:');
    console.log('==================');
    
    roles.forEach(role => {
      console.log(`ID: ${role.id}`);
      console.log(`Nombre: ${role.name}`);
      console.log(`Descripción: ${role.description}`);
      console.log('---');
    });
    
    // Buscar específicamente el rol teacher
    const teacherRole = roles.find(r => r.name.toLowerCase() === 'teacher');
    if (teacherRole) {
      console.log('🎓 ROL TEACHER ENCONTRADO:');
      console.log(`ID del Teacher: ${teacherRole.id}`);
      console.log(`Nombre: ${teacherRole.name}`);
    } else {
      console.log('❌ No se encontró rol "teacher"');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getRoles();
