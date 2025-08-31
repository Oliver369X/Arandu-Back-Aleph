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

// Datos de prueba
const testSubtopic = {
  id: '550e8400-e29b-41d4-a716-446655440000', // UUID de ejemplo
  name: 'Blockchain Fundamentals',
  description: 'Introduction to blockchain technology'
};

async function testAIGameEndpoints() {
  log('\n🎮 PROBANDO ENDPOINTS DE AI GAMES', 'cyan');
  log('=' .repeat(60), 'cyan');

  let totalTests = 0;
  let passedTests = 0;

  // Test 1: GET /ai-games (listar todos)
  await runTest('GET /ai-games - Listar todos los juegos', async () => {
    const response = await fetch(`${API_BASE}/ai-games`);
    const data = await response.json();
    
    if (response.ok) {
      log(`  📊 Juegos encontrados: ${Array.isArray(data) ? data.length : 'N/A'}`, 'white');
      if (Array.isArray(data) && data.length > 0) {
        log(`  🎯 Primer juego: ${data[0].title || 'Sin título'}`, 'white');
        log(`  🎮 Tipo: ${data[0].gameType || 'N/A'}`, 'white');
      }
      return true;
    }
    return false;
  });

  // Test 2: GET /ai-games/estadisticas
  await runTest('GET /ai-games/estadisticas - Estadísticas', async () => {
    const response = await fetch(`${API_BASE}/ai-games/estadisticas`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      log(`  📈 Total juegos: ${data.data?.totalJuegos || 0}`, 'white');
      log(`  🎯 Total jugadas: ${data.data?.totalJugadas || 0}`, 'white');
      return true;
    }
    return false;
  });

  // Test 3: GET /ai-games/populares
  await runTest('GET /ai-games/populares - Juegos populares', async () => {
    const response = await fetch(`${API_BASE}/ai-games/populares?limit=5`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      log(`  🔥 Juegos populares: ${data.data?.length || 0}`, 'white');
      return true;
    }
    return false;
  });

  // Test 4: POST /ai-games - Crear juego manual
  await runTest('POST /ai-games - Crear juego manualmente', async () => {
    const gameData = {
      subtopicId: testSubtopic.id,
      gameType: 'quiz',
      agentType: 'specialized',
      title: 'Test Quiz: Blockchain Basics',
      description: 'Un quiz de prueba sobre conceptos básicos de blockchain',
      instructions: 'Responde cada pregunta seleccionando la opción correcta',
      htmlContent: '<!DOCTYPE html><html><head><title>Test Game</title></head><body><h1>Test Game</h1><p>This is a test game</p></body></html>',
      difficulty: 'medium',
      estimatedTime: 10
    };

    const response = await fetch(`${API_BASE}/ai-games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      log(`  ✅ Juego creado: ${data.data?.title}`, 'white');
      log(`  🆔 ID: ${data.data?.id}`, 'white');
      
      // Guardar ID para tests posteriores
      global.testGameId = data.data?.id;
      return true;
    } else {
      log(`  ❌ Error: ${data.error || 'Unknown error'}`, 'red');
      if (data.errores) {
        data.errores.forEach(err => {
          log(`    - ${err.message} (${err.path?.join('.')})`, 'red');
        });
      }
      return false;
    }
  });

  // Test 5: GET /ai-games/{id} - Obtener juego específico
  if (global.testGameId) {
    await runTest('GET /ai-games/{id} - Obtener juego por ID', async () => {
      const response = await fetch(`${API_BASE}/ai-games/${global.testGameId}`);
      const data = await response.json();
      
      if (response.ok) {
        log(`  🎮 Juego: ${data.title}`, 'white');
        log(`  📝 Descripción: ${data.description?.substring(0, 50)}...`, 'white');
        log(`  ⏱️ Tiempo estimado: ${data.estimatedTime} min`, 'white');
        return true;
      }
      return false;
    });

    // Test 6: GET /ai-games/{id}/play - Jugar juego
    await runTest('GET /ai-games/{id}/play - Obtener juego para jugar', async () => {
      const response = await fetch(`${API_BASE}/ai-games/${global.testGameId}/play`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        log(`  🎯 Juego listo para jugar: ${data.data?.title}`, 'white');
        log(`  📄 HTML size: ${data.data?.htmlContent?.length || 0} caracteres`, 'white');
        log(`  🎮 Subtopic: ${data.data?.subtopic?.name || 'N/A'}`, 'white');
        return true;
      }
      return false;
    });
  }

  // Test 7: Probar generación con IA (si hay subtopics)
  await testGameGeneration();

  // Resumen final
  log('\n📊 RESUMEN DE TESTS DE ENDPOINTS', 'cyan');
  log('=' .repeat(40), 'cyan');
  log(`Tests ejecutados: ${totalTests}`, 'white');
  log(`Tests exitosos: ${passedTests}`, 'green');
  log(`Tests fallidos: ${totalTests - passedTests}`, 'red');
  log(`Tasa de éxito: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`, 'yellow');

  async function runTest(name, testFn) {
    totalTests++;
    log(`\n🔍 ${name}`, 'yellow');
    
    try {
      const result = await testFn();
      if (result) {
        log(`  ✅ PASÓ`, 'green');
        passedTests++;
      } else {
        log(`  ❌ FALLÓ`, 'red');
      }
    } catch (error) {
      log(`  💥 ERROR: ${error.message}`, 'red');
      if (error.message.includes('fetch')) {
        log(`  💡 Asegúrate de que el servidor esté corriendo en puerto 3001`, 'yellow');
      }
    }
  }
}

async function testGameGeneration() {
  log('\n🤖 PROBANDO GENERACIÓN DE JUEGOS CON IA', 'cyan');
  log('=' .repeat(50), 'cyan');

  // Primero, obtener subtopics disponibles
  try {
    const subtopicsResponse = await fetch(`${API_BASE}/subtopics`);
    let subtopicId = testSubtopic.id; // fallback

    if (subtopicsResponse.ok) {
      const subtopics = await subtopicsResponse.json();
      if (Array.isArray(subtopics) && subtopics.length > 0) {
        subtopicId = subtopics[0].id;
        log(`📚 Usando subtopic real: ${subtopics[0].name}`, 'white');
      } else {
        log(`⚠️ No hay subtopics, usando ID de prueba`, 'yellow');
      }
    }

    // Test de generación automática (agente adaptativo)
    log('\n🧠 Probando generación automática (agente adaptativo)...', 'yellow');
    
    try {
      const generateResponse = await fetch(`${API_BASE}/ai-games/generate/${subtopicId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty: 'medium',
          language: 'es',
          customPrompt: 'Crear un juego educativo interesante y divertido'
        })
      });

      const generateData = await generateResponse.json();

      if (generateResponse.ok && generateData.success) {
        log(`  ✅ Juego generado exitosamente!`, 'green');
        log(`  🎮 Título: ${generateData.data?.game?.title}`, 'white');
        log(`  🎯 Tipo: ${generateData.data?.game?.gameType}`, 'white');
        log(`  🤖 Agente usado: ${generateData.data?.generationInfo?.agentUsed}`, 'white');
        log(`  ⏱️ Tiempo estimado: ${generateData.data?.game?.estimatedTime} min`, 'white');
        log(`  📄 HTML generado: ${generateData.data?.game?.htmlContent?.length || 0} caracteres`, 'white');
        
        // Guardar el juego generado para inspección
        if (generateData.data?.game?.htmlContent) {
          await saveGeneratedGame(generateData.data.game);
        }
        
      } else {
        log(`  ❌ Error en generación: ${generateData.error}`, 'red');
        log(`  📝 Código: ${generateData.code}`, 'red');
        if (generateData.details) {
          log(`  🔍 Detalles: ${generateData.details}`, 'red');
        }
      }
    } catch (error) {
      log(`  💥 Error en generación: ${error.message}`, 'red');
    }

    // Test de generación específica (quiz)
    log('\n❓ Probando generación específica (quiz)...', 'yellow');
    
    try {
      const quizResponse = await fetch(`${API_BASE}/ai-games/generate/${subtopicId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'quiz',
          difficulty: 'easy',
          language: 'es'
        })
      });

      const quizData = await quizResponse.json();

      if (quizResponse.ok && quizData.success) {
        log(`  ✅ Quiz generado exitosamente!`, 'green');
        log(`  🎮 Título: ${quizData.data?.game?.title}`, 'white');
        log(`  📊 Dificultad: ${quizData.data?.game?.difficulty}`, 'white');
      } else {
        log(`  ❌ Error en generación de quiz: ${quizData.error}`, 'red');
      }
    } catch (error) {
      log(`  💥 Error en quiz: ${error.message}`, 'red');
    }

  } catch (error) {
    log(`💥 Error general en generación: ${error.message}`, 'red');
  }
}

async function saveGeneratedGame(game) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const fileName = `generated-game-${game.gameType}-${Date.now()}.html`;
    const filePath = path.join(process.cwd(), 'SchoolAI', 'temp', fileName);
    
    // Crear directorio temp si no existe
    const tempDir = path.dirname(filePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Guardar HTML del juego
    fs.writeFileSync(filePath, game.htmlContent);
    
    log(`  💾 Juego guardado en: temp/${fileName}`, 'cyan');
    log(`  🌐 Puedes abrirlo en el navegador para probarlo`, 'cyan');
    
  } catch (error) {
    log(`  ⚠️ No se pudo guardar el juego: ${error.message}`, 'yellow');
  }
}

// Ejecutar si es llamado directamente
if (process.argv[1].endsWith('test-aigame-endpoints.js')) {
  testAIGameEndpoints().catch(console.error);
}

export { testAIGameEndpoints };
