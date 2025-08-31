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

async function diagnoseAPI() {
  log('\n🔍 DIAGNÓSTICO DE API', 'bold');
  log('=' .repeat(50), 'blue');
  
  // Test 1: Conexión directa a base de datos
  log('\n💾 Test 1: Conexión directa a base de datos', 'blue');
  try {
    const roles = await prisma.role.findMany();
    log(`✅ Base de datos OK - ${roles.length} roles encontrados`, 'green');
    
    roles.forEach(role => {
      log(`   - ${role.name}: ${role.description}`, 'yellow');
    });
  } catch (error) {
    log(`❌ Error en base de datos: ${error.message}`, 'red');
  }
  
  // Test 2: Endpoint básico
  log('\n🌐 Test 2: Endpoint GET /roles', 'blue');
  try {
    const result = await makeRequest(`${BASE_URL}/roles`);
    log(`Status: ${result.status}`, result.ok ? 'green' : 'red');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'yellow');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
  
  // Test 3: Crear rol simple
  log('\n➕ Test 3: POST /roles - Crear rol simple', 'blue');
  const simpleRole = {
    name: 'test_simple',
    description: 'Rol de prueba simple',
    permissions: '["test:read"]'
  };
  
  try {
    const result = await makeRequest(`${BASE_URL}/roles`, {
      method: 'POST',
      body: JSON.stringify(simpleRole)
    });
    
    log(`Status: ${result.status}`, result.ok ? 'green' : 'red');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'yellow');
    
    // Si se creó, intentar eliminarlo
    if (result.ok && result.data.id) {
      log('\n🗑️  Limpiando rol de prueba...', 'blue');
      const deleteResult = await makeRequest(`${BASE_URL}/roles/${result.data.id}`, {
        method: 'DELETE'
      });
      log(`Delete status: ${deleteResult.status}`, deleteResult.ok ? 'green' : 'red');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
  
  // Test 4: Crear usuario simple
  log('\n👤 Test 4: POST /usuario - Crear usuario simple', 'blue');
  const simpleUser = {
    name: 'Test User',
    email: 'testdiag@example.com',
    password: 'password123'
  };
  
  try {
    const result = await makeRequest(`${BASE_URL}/usuario`, {
      method: 'POST',
      body: JSON.stringify(simpleUser)
    });
    
    log(`Status: ${result.status}`, result.ok ? 'green' : 'red');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'yellow');
    
    // Si se creó, intentar eliminarlo
    if (result.ok && result.data.data?.id) {
      log('\n🗑️  Limpiando usuario de prueba...', 'blue');
      const deleteResult = await makeRequest(`${BASE_URL}/usuario/${result.data.data.id}`, {
        method: 'DELETE'
      });
      log(`Delete status: ${deleteResult.status}`, deleteResult.ok ? 'green' : 'red');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
  
  // Test 5: Login
  log('\n🔐 Test 5: POST /auth/login - Login básico', 'blue');
  try {
    const loginData = {
      email: 'admin@test.com',
      password: '123456'
    };
    
    const result = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(loginData)
    });
    
    log(`Status: ${result.status}`, result.ok ? 'green' : 'red');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'yellow');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
  
  log('\n📊 DIAGNÓSTICO COMPLETADO', 'bold');
  log('Si hay errores, revisa los logs del servidor para más detalles.', 'yellow');
}

// Ejecutar diagnóstico
async function runDiagnosis() {
  try {
    await diagnoseAPI();
  } catch (error) {
    log(`❌ ERROR GENERAL: ${error.message}`, 'red');
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

runDiagnosis();

