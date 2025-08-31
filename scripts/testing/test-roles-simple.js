// Test simple para verificar roles
console.log('🔍 Probando endpoint de roles...');

try {
  const response = await fetch('http://localhost:3001/api-v1/roles');
  console.log('📡 Status:', response.status);
  
  if (response.ok) {
    const roles = await response.json();
    console.log('✅ Roles obtenidos exitosamente:');
    console.log(JSON.stringify(roles, null, 2));
    
    // Buscar rol teacher
    const teacherRole = roles.find(r => r.name.toLowerCase() === 'teacher');
    if (teacherRole) {
      console.log('🎓 ROL TEACHER:');
      console.log(`   ID: ${teacherRole.id}`);
      console.log(`   Nombre: ${teacherRole.name}`);
    }
  } else {
    console.log('❌ Error en respuesta:', response.statusText);
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}
