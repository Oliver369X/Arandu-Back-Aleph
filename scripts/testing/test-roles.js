el contehrimport { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001/api-v1';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

async function testRolesAPI() {
  log('\n🧪 TESTING ROLES API', 'bold');
  log('=' .repeat(50), 'blue');
  
  let testsPassed = 0;
  let totalTests = 0;
  let createdRoleId = null;

  // Test 1: GET /roles - Obtener todos los roles
  totalTests++;
  log('\n📋 Test 1: GET /roles - Obtener todos los roles', 'blue');
  try {
    const result = await makeRequest(`${BASE_URL}/roles`);
    if (result.ok && Array.isArray(result.data)) {
      log(`✅ PASS - Obtenidos ${result.data.length} roles`, 'green');
      testsPassed++;
      
      // Mostrar roles existentes
      result.data.forEach(role => {
        log(`   - ${role.name}: ${role.description}`, 'yellow');
      });
    } else {
      log(`❌ FAIL - Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
    }
  } catch (error) {
    log(`❌ ERROR - ${error.message}`, 'red');
  }

  // Test 2: POST /roles - Crear un nuevo rol
  totalTests++;
  log('\n➕ Test 2: POST /roles - Crear un nuevo rol', 'blue');
  const newRole = {
    name: 'test_role',
    description: 'Rol de prueba para testing',
    permissions: JSON.stringify(['test:read', 'test:write'])
  };
  
  try {
    const result = await makeRequest(`${BASE_URL}/roles`, {
      method: 'POST',
      body: JSON.stringify(newRole)
    });
    
    if (result.ok && result.data.id) {
      createdRoleId = result.data.id;
      log(`✅ PASS - Rol creado con ID: ${createdRoleId}`, 'green');
      testsPassed++;
    } else {
      log(`❌ FAIL - Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
    }
  } catch (error) {
    log(`❌ ERROR - ${error.message}`, 'red');
  }

  // Test 3: GET /roles/{id} - Obtener rol por ID
  if (createdRoleId) {
    totalTests++;
    log('\n🔍 Test 3: GET /roles/{id} - Obtener rol por ID', 'blue');
    try {
      const result = await makeRequest(`${BASE_URL}/roles/${createdRoleId}`);
      if (result.ok && result.data.id === createdRoleId) {
        log(`✅ PASS - Rol encontrado: ${result.data.name}`, 'green');
        testsPassed++;
      } else {
        log(`❌ FAIL - Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
      }
    } catch (error) {
      log(`❌ ERROR - ${error.message}`, 'red');
    }
  }

  // Test 4: GET /roles/nombre/{name} - Obtener rol por nombre
  totalTests++;
  log('\n🏷️  Test 4: GET /roles/nombre/{name} - Obtener rol por nombre', 'blue');
  try {
    const result = await makeRequest(`${BASE_URL}/roles/nombre/test_role`);
    if (result.ok && result.data.name === 'test_role') {
      log(`✅ PASS - Rol encontrado por nombre: ${result.data.name}`, 'green');
      testsPassed++;
    } else {
      log(`❌ FAIL - Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
    }
  } catch (error) {
    log(`❌ ERROR - ${error.message}`, 'red');
  }

  // Test 5: PUT /roles - Actualizar rol
  if (createdRoleId) {
    totalTests++;
    log('\n✏️  Test 5: PUT /roles - Actualizar rol', 'blue');
    const updateData = {
      id: createdRoleId,
      name: 'test_role_updated',
      description: 'Rol de prueba actualizado',
      permissions: JSON.stringify(['test:read', 'test:write', 'test:delete'])
    };
    
    try {
      const result = await makeRequest(`${BASE_URL}/roles`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      if (result.ok) {
        log(`✅ PASS - Rol actualizado correctamente`, 'green');
        testsPassed++;
      } else {
        log(`❌ FAIL - Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
      }
    } catch (error) {
      log(`❌ ERROR - ${error.message}`, 'red');
    }
  }

  // Test 6: GET /roles/activos - Obtener roles activos
  totalTests++;
  log('\n🟢 Test 6: GET /roles/activos - Obtener roles activos', 'blue');
  try {
    const result = await makeRequest(`${BASE_URL}/roles/activos`);
    if (result.ok && Array.isArray(result.data)) {
      log(`✅ PASS - Obtenidos ${result.data.length} roles activos`, 'green');
      testsPassed++;
    } else {
      log(`❌ FAIL - Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
    }
  } catch (error) {
    log(`❌ ERROR - ${error.message}`, 'red');
  }

  // Test 7: DELETE /roles/{id} - Eliminar rol (cleanup)
  if (createdRoleId) {
    totalTests++;
    log('\n🗑️  Test 7: DELETE /roles/{id} - Eliminar rol', 'blue');
    try {
      const result = await makeRequest(`${BASE_URL}/roles/${createdRoleId}`, {
        method: 'DELETE'
      });
      
      if (result.ok) {
        log(`✅ PASS - Rol eliminado correctamente`, 'green');
        testsPassed++;
      } else {
        log(`❌ FAIL - Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
      }
    } catch (error) {
      log(`❌ ERROR - ${error.message}`, 'red');
    }
  }

  // Resumen
  log('\n📊 RESUMEN DE PRUEBAS', 'bold');
  log('=' .repeat(50), 'blue');
  log(`Total de pruebas: ${totalTests}`, 'blue');
  log(`Pruebas exitosas: ${testsPassed}`, 'green');
  log(`Pruebas fallidas: ${totalTests - testsPassed}`, 'red');
  log(`Porcentaje de éxito: ${Math.round((testsPassed / totalTests) * 100)}%`, 'yellow');
  
  if (testsPassed === totalTests) {
    log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!', 'green');
  } else {
    log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración del servidor.', 'yellow');
  }
}

// Ejecutar las pruebas
async function runTests() {
  try {
    await testRolesAPI();
  } catch (error) {
    log(`❌ ERROR GENERAL: ${error.message}`, 'red');
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

runTests();

