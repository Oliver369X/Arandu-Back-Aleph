import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api-v1';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test data
const testSubtopic = {
  id: 'test-subtopic-id',
  name: 'Blockchain Fundamentals',
  description: 'Introduction to blockchain technology and its applications',
  subject: {
    id: 'test-subject-id',
    name: 'Blockchain Technology'
  }
};

const gameTypes = [
  'wordsearch',
  'quiz', 
  'memory',
  'puzzle',
  'crossword',
  'matching',
  'threejs',
  'pixijs',
  'adaptive'
];

async function testGameGeneration() {
  log('\n🎮 INICIANDO TESTS DE GENERACIÓN DE JUEGOS AI', 'cyan');
  log('=' .repeat(60), 'cyan');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const gameType of gameTypes) {
    log(`\n🎯 Probando generación de juego: ${gameType.toUpperCase()}`, 'yellow');
    
    try {
      totalTests++;
      
      const gameContext = {
        subtopic: testSubtopic,
        options: {
          difficulty: 'medium',
          customPrompt: `Crear un juego educativo sobre ${testSubtopic.name}`,
          language: 'es'
        }
      };

      // Simular generación directa del agente (sin API)
      const result = await testAgentDirectly(gameType, gameContext);
      
      if (result.success) {
        log(`  ✅ ${gameType}: Generación exitosa`, 'green');
        log(`     - Título: ${result.title}`, 'white');
        log(`     - Descripción: ${result.description.substring(0, 100)}...`, 'white');
        log(`     - Tiempo estimado: ${result.estimatedTime} min`, 'white');
        log(`     - Tamaño HTML: ${result.htmlContent ? result.htmlContent.length : 0} caracteres`, 'white');
        
        if (result.adaptiveInfo) {
          log(`     - Tipo seleccionado por IA: ${result.adaptiveInfo.selectedGameType}`, 'magenta');
          log(`     - Confianza: ${(result.adaptiveInfo.confidence * 100).toFixed(1)}%`, 'magenta');
        }
        
        passedTests++;
      } else {
        log(`  ❌ ${gameType}: Error - ${result.error}`, 'red');
        if (result.details) {
          log(`     Detalles: ${result.details}`, 'red');
        }
        failedTests++;
      }
      
    } catch (error) {
      log(`  ❌ ${gameType}: Excepción - ${error.message}`, 'red');
      failedTests++;
    }
  }

  // Resumen
  log('\n📊 RESUMEN DE TESTS', 'cyan');
  log('=' .repeat(30), 'cyan');
  log(`Total de tests: ${totalTests}`, 'white');
  log(`Tests exitosos: ${passedTests}`, 'green');
  log(`Tests fallidos: ${failedTests}`, 'red');
  log(`Tasa de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'yellow');

  return { totalTests, passedTests, failedTests };
}

async function testAgentDirectly(gameType, gameContext) {
  try {
    // Importar el agente correspondiente
    let agent;
    
    switch (gameType) {
      case 'wordsearch':
        const { wordSearchAgent } = await import('../src/components/AIGame/agents/specialized/wordSearchAgent.js');
        agent = wordSearchAgent;
        break;
      case 'quiz':
        const { quizAgent } = await import('../src/components/AIGame/agents/specialized/quizAgent.js');
        agent = quizAgent;
        break;
      case 'memory':
        const { memoryAgent } = await import('../src/components/AIGame/agents/specialized/memoryAgent.js');
        agent = memoryAgent;
        break;
      case 'puzzle':
        const { puzzleAgent } = await import('../src/components/AIGame/agents/specialized/puzzleAgent.js');
        agent = puzzleAgent;
        break;
      case 'crossword':
        const { crosswordAgent } = await import('../src/components/AIGame/agents/specialized/crosswordAgent.js');
        agent = crosswordAgent;
        break;
      case 'matching':
        const { matchingAgent } = await import('../src/components/AIGame/agents/specialized/matchingAgent.js');
        agent = matchingAgent;
        break;
      case 'threejs':
        const { threejsAgent } = await import('../src/components/AIGame/agents/free/threejsAgent.js');
        agent = threejsAgent;
        break;
      case 'pixijs':
        const { pixijsAgent } = await import('../src/components/AIGame/agents/free/pixijsAgent.js');
        agent = pixijsAgent;
        break;
      case 'adaptive':
        const { adaptiveAgent } = await import('../src/components/AIGame/agents/free/adaptiveAgent.js');
        agent = adaptiveAgent;
        break;
      default:
        throw new Error(`Tipo de agente no reconocido: ${gameType}`);
    }

    if (!agent) {
      throw new Error(`No se pudo cargar el agente: ${gameType}`);
    }

    // Generar el juego
    const result = await agent.generateGame(gameContext);
    return result;

  } catch (error) {
    return {
      success: false,
      error: 'Error al cargar o ejecutar el agente',
      details: error.message,
      code: 'AGENT_LOAD_ERROR'
    };
  }
}

async function testAPIEndpoints() {
  log('\n🌐 PROBANDO ENDPOINTS DE API', 'cyan');
  log('=' .repeat(40), 'cyan');

  const tests = [
    {
      name: 'GET /ai-games',
      method: 'GET',
      url: `${API_BASE}/ai-games`,
      expectedStatus: 200
    },
    {
      name: 'GET /ai-games/populares',
      method: 'GET', 
      url: `${API_BASE}/ai-games/populares`,
      expectedStatus: 200
    },
    {
      name: 'GET /ai-games/estadisticas',
      method: 'GET',
      url: `${API_BASE}/ai-games/estadisticas`, 
      expectedStatus: 200
    }
  ];

  let apiPassedTests = 0;
  let apiFailedTests = 0;

  for (const test of tests) {
    try {
      log(`\n🔍 Probando: ${test.name}`, 'yellow');
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === test.expectedStatus) {
        const data = await response.json();
        log(`  ✅ ${test.name}: OK (${response.status})`, 'green');
        
        if (Array.isArray(data)) {
          log(`     - Elementos retornados: ${data.length}`, 'white');
        } else if (data.success !== undefined) {
          log(`     - Success: ${data.success}`, 'white');
        }
        
        apiPassedTests++;
      } else {
        log(`  ❌ ${test.name}: Status ${response.status} (esperado ${test.expectedStatus})`, 'red');
        apiFailedTests++;
      }
      
    } catch (error) {
      log(`  ❌ ${test.name}: Error de conexión - ${error.message}`, 'red');
      apiFailedTests++;
    }
  }

  log('\n📊 RESUMEN API TESTS', 'cyan');
  log(`Tests API exitosos: ${apiPassedTests}`, 'green');
  log(`Tests API fallidos: ${apiFailedTests}`, 'red');

  return { apiPassedTests, apiFailedTests };
}

async function testGameValidation() {
  log('\n🔍 PROBANDO VALIDACIÓN DE JUEGOS', 'cyan');
  log('=' .repeat(40), 'cyan');

  const validationTests = [
    {
      name: 'HTML válido',
      test: (result) => result.htmlContent && result.htmlContent.includes('<!DOCTYPE html>'),
      description: 'Verificar que el HTML generado sea válido'
    },
    {
      name: 'Título presente',
      test: (result) => result.title && result.title.length > 0,
      description: 'Verificar que tenga título'
    },
    {
      name: 'Descripción presente',
      test: (result) => result.description && result.description.length > 10,
      description: 'Verificar que tenga descripción válida'
    },
    {
      name: 'Instrucciones presentes',
      test: (result) => result.instructions && result.instructions.length > 5,
      description: 'Verificar que tenga instrucciones'
    },
    {
      name: 'Tiempo estimado válido',
      test: (result) => result.estimatedTime && result.estimatedTime > 0,
      description: 'Verificar tiempo estimado'
    }
  ];

  let validationPassed = 0;
  let validationFailed = 0;

  // Generar un juego de prueba para validar
  const gameContext = {
    subtopic: testSubtopic,
    options: { difficulty: 'medium', language: 'es' }
  };

  try {
    const { quizAgent } = await import('../src/components/AIGame/agents/specialized/quizAgent.js');
    const result = await quizAgent.generateGame(gameContext);

    if (result.success) {
      log('\n🎮 Validando juego generado...', 'yellow');
      
      for (const validation of validationTests) {
        try {
          if (validation.test(result)) {
            log(`  ✅ ${validation.name}: Válido`, 'green');
            validationPassed++;
          } else {
            log(`  ❌ ${validation.name}: Inválido`, 'red');
            validationFailed++;
          }
        } catch (error) {
          log(`  ❌ ${validation.name}: Error en validación - ${error.message}`, 'red');
          validationFailed++;
        }
      }
    } else {
      log('❌ No se pudo generar juego para validación', 'red');
      validationFailed = validationTests.length;
    }
  } catch (error) {
    log(`❌ Error en validación: ${error.message}`, 'red');
    validationFailed = validationTests.length;
  }

  log('\n📊 RESUMEN VALIDACIÓN', 'cyan');
  log(`Validaciones exitosas: ${validationPassed}`, 'green');
  log(`Validaciones fallidas: ${validationFailed}`, 'red');

  return { validationPassed, validationFailed };
}

async function runAllTests() {
  log('🚀 INICIANDO SUITE COMPLETA DE TESTS AIGAME', 'magenta');
  log('=' .repeat(70), 'magenta');

  const startTime = Date.now();

  try {
    // Test 1: Generación de juegos
    const gameResults = await testGameGeneration();
    
    // Test 2: Endpoints de API
    const apiResults = await testAPIEndpoints();
    
    // Test 3: Validación de juegos
    const validationResults = await testGameValidation();

    // Resumen final
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('\n🏁 RESUMEN FINAL', 'magenta');
    log('=' .repeat(50), 'magenta');
    log(`Tiempo total: ${totalTime}s`, 'white');
    log(`\nGeneración de juegos: ${gameResults.passedTests}/${gameResults.totalTests}`, 'white');
    log(`Tests de API: ${apiResults.apiPassedTests}/${apiResults.apiPassedTests + apiResults.apiFailedTests}`, 'white');
    log(`Validaciones: ${validationResults.validationPassed}/${validationResults.validationPassed + validationResults.validationFailed}`, 'white');
    
    const totalPassed = gameResults.passedTests + apiResults.apiPassedTests + validationResults.validationPassed;
    const totalTests = gameResults.totalTests + apiResults.apiPassedTests + apiResults.apiFailedTests + validationResults.validationPassed + validationResults.validationFailed;
    
    log(`\nTOTAL: ${totalPassed}/${totalTests} (${((totalPassed/totalTests)*100).toFixed(1)}%)`, 'yellow');
    
    if (totalPassed === totalTests) {
      log('\n🎉 ¡TODOS LOS TESTS PASARON!', 'green');
    } else {
      log('\n⚠️  Algunos tests fallaron. Revisar logs arriba.', 'yellow');
    }

  } catch (error) {
    log(`\n💥 Error fatal en suite de tests: ${error.message}`, 'red');
    console.error(error);
  }
}

// Ejecutar si es llamado directamente
if (process.argv[1].endsWith('test-aigame.js')) {
  runAllTests().catch(console.error);
}

export { runAllTests, testGameGeneration, testAPIEndpoints, testGameValidation };
