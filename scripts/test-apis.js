import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001/api-v1';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkServerHealth() {
  log('\n🏥 VERIFICANDO ESTADO DEL SERVIDOR', 'bold');
  log('=' .repeat(50), 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/roles`);
    if (response.ok) {
      log('✅ Servidor funcionando correctamente', 'green');
      return true;
    } else {
      log(`❌ Servidor respondió con error: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ No se puede conectar al servidor: ${error.message}`, 'red');
    log('💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:3001', 'yellow');
    return false;
  }
}

async function checkDatabaseConnection() {
  log('\n💾 VERIFICANDO CONEXIÓN A BASE DE DATOS', 'bold');
  log('=' .repeat(50), 'cyan');
  
  try {
    await prisma.$connect();
    const roleCount = await prisma.role.count();
    log(`✅ Base de datos conectada - ${roleCount} roles encontrados`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error de conexión a base de datos: ${error.message}`, 'red');
    return false;
  }
}

async function runAPITests() {
  log('\n🚀 INICIANDO SUITE COMPLETA DE PRUEBAS DE API', 'bold');
  log('=' .repeat(60), 'magenta');
  
  const startTime = Date.now();
  
  // Verificar prerrequisitos
  const serverOk = await checkServerHealth();
  const dbOk = await checkDatabaseConnection();
  
  if (!serverOk || !dbOk) {
    log('\n❌ PRERREQUISITOS NO CUMPLIDOS', 'red');
    log('No se pueden ejecutar las pruebas. Revisa la configuración.', 'yellow');
    return;
  }
  
  log('\n📋 PLAN DE PRUEBAS:', 'bold');
  log('1. 🔐 Autenticación (Login)', 'blue');
  log('2. 👥 Gestión de Roles', 'blue');
  log('3. 👤 Gestión de Usuarios', 'blue');
  log('4. 🎓 Grados y Materias', 'blue');
  log('5. 🤖 AI y Feedback', 'blue');
  
  const testResults = {
    auth: { passed: 0, total: 0, time: 0 },
    roles: { passed: 0, total: 0, time: 0 },
    users: { passed: 0, total: 0, time: 0 },
    grades: { passed: 0, total: 0, time: 0 },
    ai: { passed: 0, total: 0, time: 0 }
  };
  
  // Test 1: Autenticación
  log('\n🔐 EJECUTANDO PRUEBAS DE AUTENTICACIÓN...', 'bold');
  const authStart = Date.now();
  try {
    const authResults = await testAuthentication();
    testResults.auth = { ...authResults, time: Date.now() - authStart };
  } catch (error) {
    log(`❌ Error en pruebas de autenticación: ${error.message}`, 'red');
  }
  
  // Test 2: Roles
  log('\n👥 EJECUTANDO PRUEBAS DE ROLES...', 'bold');
  const rolesStart = Date.now();
  try {
    const rolesResults = await testRoles();
    testResults.roles = { ...rolesResults, time: Date.now() - rolesStart };
  } catch (error) {
    log(`❌ Error en pruebas de roles: ${error.message}`, 'red');
  }
  
  // Test 3: Usuarios
  log('\n👤 EJECUTANDO PRUEBAS DE USUARIOS...', 'bold');
  const usersStart = Date.now();
  try {
    const usersResults = await testUsers();
    testResults.users = { ...usersResults, time: Date.now() - usersStart };
  } catch (error) {
    log(`❌ Error en pruebas de usuarios: ${error.message}`, 'red');
  }
  
  // Resumen final
  const totalTime = Date.now() - startTime;
  await showFinalReport(testResults, totalTime);
}

async function testAuthentication() {
  // Implementación simplificada de pruebas de auth
  let passed = 0, total = 5;
  
  // Crear usuario de prueba
  const testUser = {
    name: 'Auth Test User',
    email: 'authtest@example.com',
    password: 'password123'
  };
  
  try {
    // Crear usuario
    const createResult = await makeRequest(`${BASE_URL}/usuario`, {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    if (createResult.ok) {
      // Test login exitoso
      const loginResult = await makeRequest(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: testUser.email, password: testUser.password })
      });
      
      if (loginResult.ok && loginResult.data.success) {
        passed++;
        log('  ✅ Login exitoso', 'green');
      }
      
      // Test login con credenciales incorrectas
      const badLoginResult = await makeRequest(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: testUser.email, password: 'wrongpass' })
      });
      
      if (!badLoginResult.ok || !badLoginResult.data.success) {
        passed++;
        log('  ✅ Login rechazado correctamente', 'green');
      }
      
      // Cleanup
      if (createResult.data.data?.id) {
        await makeRequest(`${BASE_URL}/usuario/${createResult.data.data.id}`, {
          method: 'DELETE'
        });
      }
    }
  } catch (error) {
    log(`  ❌ Error en pruebas de autenticación: ${error.message}`, 'red');
  }
  
  return { passed, total };
}

async function testRoles() {
  let passed = 0, total = 6;
  let createdRoleId = null;
  
  try {
    // Test GET roles
    const getRolesResult = await makeRequest(`${BASE_URL}/roles`);
    if (getRolesResult.ok && Array.isArray(getRolesResult.data)) {
      passed++;
      log('  ✅ GET /roles', 'green');
    }
    
    // Test POST role
    const newRole = {
      name: 'test_role_api',
      description: 'Rol de prueba API',
      permissions: JSON.stringify(['test:read'])
    };
    
    const createRoleResult = await makeRequest(`${BASE_URL}/roles`, {
      method: 'POST',
      body: JSON.stringify(newRole)
    });
    
    if (createRoleResult.ok && createRoleResult.data.id) {
      createdRoleId = createRoleResult.data.id;
      passed++;
      log('  ✅ POST /roles', 'green');
    }
    
    // Test GET role by ID
    if (createdRoleId) {
      const getRoleResult = await makeRequest(`${BASE_URL}/roles/${createdRoleId}`);
      if (getRoleResult.ok) {
        passed++;
        log('  ✅ GET /roles/{id}', 'green');
      }
    }
    
    // Test PUT role
    if (createdRoleId) {
      const updateData = {
        id: createdRoleId,
        name: 'test_role_updated',
        description: 'Rol actualizado',
        permissions: JSON.stringify(['test:read', 'test:write'])
      };
      
      const updateResult = await makeRequest(`${BASE_URL}/roles`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      if (updateResult.ok) {
        passed++;
        log('  ✅ PUT /roles', 'green');
      }
    }
    
    // Test GET roles activos
    const getActiveRolesResult = await makeRequest(`${BASE_URL}/roles/activos`);
    if (getActiveRolesResult.ok) {
      passed++;
      log('  ✅ GET /roles/activos', 'green');
    }
    
    // Cleanup - DELETE role
    if (createdRoleId) {
      const deleteResult = await makeRequest(`${BASE_URL}/roles/${createdRoleId}`, {
        method: 'DELETE'
      });
      
      if (deleteResult.ok) {
        passed++;
        log('  ✅ DELETE /roles/{id}', 'green');
      }
    }
    
  } catch (error) {
    log(`  ❌ Error en pruebas de roles: ${error.message}`, 'red');
  }
  
  return { passed, total };
}

async function testUsers() {
  let passed = 0, total = 4;
  let createdUserId = null;
  
  try {
    // Test GET users
    const getUsersResult = await makeRequest(`${BASE_URL}/usuario`);
    if (getUsersResult.ok && Array.isArray(getUsersResult.data)) {
      passed++;
      log('  ✅ GET /usuario', 'green');
    }
    
    // Test POST user
    const newUser = {
      name: 'Test User API',
      email: 'testapi@example.com',
      password: 'password123'
    };
    
    const createUserResult = await makeRequest(`${BASE_URL}/usuario`, {
      method: 'POST',
      body: JSON.stringify(newUser)
    });
    
    if (createUserResult.ok && createUserResult.data.data?.id) {
      createdUserId = createUserResult.data.data.id;
      passed++;
      log('  ✅ POST /usuario', 'green');
    }
    
    // Test GET user by ID
    if (createdUserId) {
      const getUserResult = await makeRequest(`${BASE_URL}/usuario/${createdUserId}`);
      if (getUserResult.ok) {
        passed++;
        log('  ✅ GET /usuario/{id}', 'green');
      }
    }
    
    // Cleanup - DELETE user
    if (createdUserId) {
      const deleteResult = await makeRequest(`${BASE_URL}/usuario/${createdUserId}`, {
        method: 'DELETE'
      });
      
      if (deleteResult.ok) {
        passed++;
        log('  ✅ DELETE /usuario/{id}', 'green');
      }
    }
    
  } catch (error) {
    log(`  ❌ Error en pruebas de usuarios: ${error.message}`, 'red');
  }
  
  return { passed, total };
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

async function showFinalReport(results, totalTime) {
  log('\n📊 REPORTE FINAL DE PRUEBAS', 'bold');
  log('=' .repeat(60), 'magenta');
  
  let totalPassed = 0;
  let totalTests = 0;
  
  Object.entries(results).forEach(([category, result]) => {
    const percentage = result.total > 0 ? Math.round((result.passed / result.total) * 100) : 0;
    const status = percentage === 100 ? '✅' : percentage >= 70 ? '⚠️' : '❌';
    
    log(`${status} ${category.toUpperCase()}: ${result.passed}/${result.total} (${percentage}%) - ${result.time}ms`, 
        percentage === 100 ? 'green' : percentage >= 70 ? 'yellow' : 'red');
    
    totalPassed += result.passed;
    totalTests += result.total;
  });
  
  const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  
  log('\n📈 RESUMEN GENERAL:', 'bold');
  log(`Total de pruebas: ${totalTests}`, 'blue');
  log(`Pruebas exitosas: ${totalPassed}`, 'green');
  log(`Pruebas fallidas: ${totalTests - totalPassed}`, 'red');
  log(`Porcentaje de éxito: ${overallPercentage}%`, 'yellow');
  log(`Tiempo total: ${totalTime}ms`, 'cyan');
  
  if (overallPercentage === 100) {
    log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! El API está funcionando correctamente.', 'green');
  } else if (overallPercentage >= 70) {
    log('\n⚠️  La mayoría de pruebas pasaron, pero hay algunos problemas menores.', 'yellow');
  } else {
    log('\n❌ Muchas pruebas fallaron. Revisa la configuración del servidor y base de datos.', 'red');
  }
  
  log('\n💡 PRÓXIMOS PASOS:', 'bold');
  log('1. Revisa http://localhost:3001/api-docs para la documentación Swagger', 'blue');
  log('2. Ejecuta pruebas específicas: npm run test:roles, npm run test:auth', 'blue');
  log('3. Verifica logs del servidor para errores detallados', 'blue');
}

// Ejecutar las pruebas
async function runTests() {
  try {
    await runAPITests();
  } catch (error) {
    log(`❌ ERROR GENERAL: ${error.message}`, 'red');
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

runTests();

