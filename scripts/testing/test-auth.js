import { PrismaClient } from '@prisma/client';

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

async function testAuthAPI() {
  log('\n🔐 TESTING AUTHENTICATION API', 'bold');
  log('=' .repeat(50), 'blue');
  
  let testsPassed = 0;
  let totalTests = 0;
  let testUserId = null;
  let authToken = null;

  // Primero, crear un usuario de prueba para login
  log('\n🛠️  Preparación: Creando usuario de prueba...', 'yellow');
  
  // Obtener un rol existente para asignar
  const rolesResult = await makeRequest(`${BASE_URL}/roles`);
  let roleId = null;
  if (rolesResult.ok && rolesResult.data.length > 0) {
    roleId = rolesResult.data[0].id;
    log(`   Usando rol: ${rolesResult.data[0].name} (${roleId})`, 'yellow');
  }

  const testUser = {
    name: 'Test User Auth',
    email: 'testauth@example.com',
    password: 'password123',
    role: roleId
  };

  try {
    const createResult = await makeRequest(`${BASE_URL}/usuario`, {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    if (createResult.ok && createResult.data.data) {
      testUserId = createResult.data.data.id;
      log(`   ✅ Usuario de prueba creado: ${testUserId}`, 'green');
    } else {
      log(`   ❌ Error creando usuario de prueba: ${JSON.stringify(createResult.data)}`, 'red');
      return;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return;
  }

  // Test 1: POST /auth/login - Login exitoso
  totalTests++;
  log('\n✅ Test 1: POST /auth/login - Login exitoso', 'blue');
  try {
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const result = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(loginData)
    });
    
    if (result.ok && result.data.success && result.data.token) {
      authToken = result.data.token;
      log(`✅ PASS - Login exitoso, token recibido`, 'green');
      log(`   Usuario: ${result.data.data.name} (${result.data.data.email})`, 'yellow');
      log(`   Roles: ${result.data.data.roles.join(', ')}`, 'yellow');
      testsPassed++;
    } else {
      log(`❌ FAIL - Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
    }
  } catch (error) {
    log(`❌ ERROR - ${error.message}`, 'red');
  }

  // Test 2: POST /auth/login - Credenciales incorrectas
  totalTests++;
  log('\n❌ Test 2: POST /auth/login - Credenciales incorrectas', 'blue');
  try {
    const loginData = {
      email: testUser.email,
      password: 'wrongpassword'
    };
    
    const result = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(loginData)
    });
    
    if (!result.ok && result.data.success === false) {
      log(`✅ PASS - Login rechazado correctamente`, 'green');
      log(`   Error: ${result.data.error}`, 'yellow');
      testsPassed++;
    } else {
      log(`❌ FAIL - Debería haber rechazado las credenciales incorrectas`, 'red');
      log(`   Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
    }
  } catch (error) {
    log(`❌ ERROR - ${error.message}`, 'red');
  }

  // Test 3: POST /auth/login - Email inexistente
  totalTests++;
  log('\n👻 Test 3: POST /auth/login - Email inexistente', 'blue');
  try {
    const loginData = {
      email: 'noexiste@example.com',
      password: 'password123'
    };
    
    const result = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(loginData)
    });
    
    if (!result.ok && result.data.success === false) {
      log(`✅ PASS - Login rechazado para email inexistente`, 'green');
      log(`   Error: ${result.data.error}`, 'yellow');
      testsPassed++;
    } else {
      log(`❌ FAIL - Debería haber rechazado el email inexistente`, 'red');
      log(`   Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
    }
  } catch (error) {
    log(`❌ ERROR - ${error.message}`, 'red');
  }

  // Test 4: POST /auth/login - Datos inválidos (sin email)
  totalTests++;
  log('\n📝 Test 4: POST /auth/login - Datos inválidos (sin email)', 'blue');
  try {
    const loginData = {
      password: 'password123'
    };
    
    const result = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(loginData)
    });
    
    if (!result.ok) {
      log(`✅ PASS - Validación correcta para datos faltantes`, 'green');
      testsPassed++;
    } else {
      log(`❌ FAIL - Debería haber validado los datos requeridos`, 'red');
      log(`   Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
    }
  } catch (error) {
    log(`❌ ERROR - ${error.message}`, 'red');
  }

  // Test 5: POST /auth/login - Datos inválidos (email mal formateado)
  totalTests++;
  log('\n📧 Test 5: POST /auth/login - Email mal formateado', 'blue');
  try {
    const loginData = {
      email: 'email-invalido',
      password: 'password123'
    };
    
    const result = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(loginData)
    });
    
    if (!result.ok) {
      log(`✅ PASS - Validación correcta para email mal formateado`, 'green');
      testsPassed++;
    } else {
      log(`❌ FAIL - Debería haber validado el formato del email`, 'red');
      log(`   Status: ${result.status}, Data: ${JSON.stringify(result.data)}`, 'red');
    }
  } catch (error) {
    log(`❌ ERROR - ${error.message}`, 'red');
  }

  // Cleanup: Eliminar usuario de prueba
  if (testUserId) {
    log('\n🧹 Limpieza: Eliminando usuario de prueba...', 'yellow');
    try {
      const deleteResult = await makeRequest(`${BASE_URL}/usuario/${testUserId}`, {
        method: 'DELETE'
      });
      
      if (deleteResult.ok) {
        log(`   ✅ Usuario de prueba eliminado`, 'green');
      } else {
        log(`   ⚠️  No se pudo eliminar el usuario de prueba: ${testUserId}`, 'yellow');
      }
    } catch (error) {
      log(`   ❌ Error eliminando usuario: ${error.message}`, 'red');
    }
  }

  // Resumen
  log('\n📊 RESUMEN DE PRUEBAS DE AUTENTICACIÓN', 'bold');
  log('=' .repeat(50), 'blue');
  log(`Total de pruebas: ${totalTests}`, 'blue');
  log(`Pruebas exitosas: ${testsPassed}`, 'green');
  log(`Pruebas fallidas: ${totalTests - testsPassed}`, 'red');
  log(`Porcentaje de éxito: ${Math.round((testsPassed / totalTests) * 100)}%`, 'yellow');
  
  if (testsPassed === totalTests) {
    log('\n🎉 ¡TODAS LAS PRUEBAS DE AUTENTICACIÓN PASARON!', 'green');
  } else {
    log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración del servidor.', 'yellow');
  }
  
  if (authToken) {
    log('\n🔑 Token de ejemplo para pruebas manuales:', 'blue');
    log(`Bearer ${authToken.substring(0, 50)}...`, 'yellow');
  }
}

// Ejecutar las pruebas
async function runTests() {
  try {
    await testAuthAPI();
  } catch (error) {
    log(`❌ ERROR GENERAL: ${error.message}`, 'red');
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

runTests();

