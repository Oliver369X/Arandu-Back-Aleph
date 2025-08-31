// Test directo de generación de juegos (sin API)
import fs from 'fs';
import path from 'path';

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

// Contexto de prueba
const testContext = {
  subtopic: {
    id: 'test-subtopic-id',
    name: 'Blockchain Fundamentals',
    description: 'Introduction to blockchain technology and its core concepts',
    subject: {
      id: 'test-subject-id',
      name: 'Blockchain Technology'
    }
  },
  options: {
    difficulty: 'medium',
    language: 'es',
    customPrompt: 'Crear un juego educativo sobre blockchain'
  }
};

async function testGameGeneration() {
  log('\n🎮 PROBANDO GENERACIÓN DIRECTA DE JUEGOS', 'cyan');
  log('=' .repeat(60), 'cyan');

  const gameTypes = [
    { type: 'wordsearch', name: 'Sopa de Letras', path: '../src/components/AIGame/agents/specialized/wordSearchAgent.js' },
    { type: 'quiz', name: 'Quiz Educativo', path: '../src/components/AIGame/agents/specialized/quizAgent.js' },
    { type: 'memory', name: 'Juego de Memoria', path: '../src/components/AIGame/agents/specialized/memoryAgent.js' },
    { type: 'puzzle', name: 'Rompecabezas', path: '../src/components/AIGame/agents/specialized/puzzleAgent.js' },
    { type: 'matching', name: 'Emparejar', path: '../src/components/AIGame/agents/specialized/matchingAgent.js' },
    { type: 'adaptive', name: 'Agente Adaptativo', path: '../src/components/AIGame/agents/free/adaptiveAgent.js' }
  ];

  let totalTests = 0;
  let passedTests = 0;
  let generatedGames = [];

  for (const gameInfo of gameTypes) {
    totalTests++;
    log(`\n🎯 Probando: ${gameInfo.name} (${gameInfo.type})`, 'yellow');
    
    try {
      // Importar el agente
      const agentModule = await import(gameInfo.path);
      const agent = agentModule.default || agentModule[Object.keys(agentModule)[0]];
      
      if (!agent || typeof agent.generateGame !== 'function') {
        log(`  ❌ Agente no válido o sin método generateGame`, 'red');
        continue;
      }

      // Generar el juego
      log(`  🔄 Generando juego...`, 'white');
      const startTime = Date.now();
      
      const result = await agent.generateGame(testContext);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (result.success) {
        log(`  ✅ Generación exitosa en ${duration}ms`, 'green');
        log(`     📝 Título: ${result.title}`, 'white');
        log(`     📄 Descripción: ${result.description?.substring(0, 80)}...`, 'white');
        log(`     🎮 Tipo: ${result.gameType || gameInfo.type}`, 'white');
        log(`     ⏱️ Tiempo estimado: ${result.estimatedTime} min`, 'white');
        log(`     📊 HTML generado: ${result.htmlContent?.length || 0} caracteres`, 'white');
        
        if (result.adaptiveInfo) {
          log(`     🧠 Agente seleccionado: ${result.adaptiveInfo.selectedGameType}`, 'magenta');
          log(`     🎯 Confianza: ${(result.adaptiveInfo.confidence * 100).toFixed(1)}%`, 'magenta');
        }

        // Guardar juego generado
        const gameData = {
          type: gameInfo.type,
          name: gameInfo.name,
          result: result,
          duration: duration,
          timestamp: new Date().toISOString()
        };
        
        generatedGames.push(gameData);
        await saveGameToFile(gameData);
        
        passedTests++;
        
      } else {
        log(`  ❌ Error en generación: ${result.error}`, 'red');
        log(`     📝 Código: ${result.code || 'N/A'}`, 'red');
        if (result.details) {
          log(`     🔍 Detalles: ${result.details}`, 'red');
        }
      }
      
    } catch (error) {
      log(`  💥 Excepción: ${error.message}`, 'red');
      console.error(error.stack);
    }
  }

  // Generar reporte
  await generateReport(generatedGames, totalTests, passedTests);

  // Resumen
  log('\n📊 RESUMEN DE GENERACIÓN', 'cyan');
  log('=' .repeat(40), 'cyan');
  log(`Total de agentes probados: ${totalTests}`, 'white');
  log(`Generaciones exitosas: ${passedTests}`, 'green');
  log(`Generaciones fallidas: ${totalTests - passedTests}`, 'red');
  log(`Tasa de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'yellow');
  log(`Juegos guardados en: ./temp/`, 'cyan');
}

async function saveGameToFile(gameData) {
  try {
    const fileName = `${gameData.type}-${Date.now()}.html`;
    const filePath = path.join('temp', fileName);
    
    // Crear HTML completo con metadatos
    const htmlWithMeta = `<!-- 
JUEGO GENERADO AUTOMÁTICAMENTE
===============================
Tipo: ${gameData.name} (${gameData.type})
Título: ${gameData.result.title}
Descripción: ${gameData.result.description}
Tiempo de generación: ${gameData.duration}ms
Generado: ${gameData.timestamp}
===============================
-->

${gameData.result.htmlContent}`;

    fs.writeFileSync(filePath, htmlWithMeta, 'utf8');
    log(`     💾 Guardado: temp/${fileName}`, 'cyan');
    
  } catch (error) {
    log(`     ⚠️ Error guardando: ${error.message}`, 'yellow');
  }
}

async function generateReport(games, total, passed) {
  try {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalAgents: total,
        successfulGenerations: passed,
        failedGenerations: total - passed,
        successRate: ((passed / total) * 100).toFixed(1) + '%'
      },
      games: games.map(game => ({
        type: game.type,
        name: game.name,
        title: game.result.title,
        description: game.result.description?.substring(0, 100) + '...',
        gameType: game.result.gameType,
        estimatedTime: game.result.estimatedTime,
        htmlSize: game.result.htmlContent?.length || 0,
        generationTime: game.duration + 'ms',
        adaptiveInfo: game.result.adaptiveInfo || null
      })),
      testContext: testContext
    };

    const reportPath = path.join('temp', `game-generation-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    log(`\n📋 Reporte completo guardado: ${reportPath}`, 'cyan');
    
    // Mostrar resumen de tipos generados
    log('\n🎮 TIPOS DE JUEGOS GENERADOS:', 'cyan');
    games.forEach(game => {
      log(`  • ${game.name}: ${game.result.title}`, 'white');
      log(`    HTML: ${(game.result.htmlContent?.length || 0).toLocaleString()} caracteres`, 'white');
    });
    
  } catch (error) {
    log(`⚠️ Error generando reporte: ${error.message}`, 'yellow');
  }
}

// Función para probar un agente específico
async function testSpecificAgent(agentType) {
  log(`\n🎯 PROBANDO AGENTE ESPECÍFICO: ${agentType}`, 'cyan');
  
  const agentPaths = {
    wordsearch: '../src/components/AIGame/agents/specialized/wordSearchAgent.js',
    quiz: '../src/components/AIGame/agents/specialized/quizAgent.js',
    memory: '../src/components/AIGame/agents/specialized/memoryAgent.js',
    puzzle: '../src/components/AIGame/agents/specialized/puzzleAgent.js',
    crossword: '../src/components/AIGame/agents/specialized/crosswordAgent.js',
    matching: '../src/components/AIGame/agents/specialized/matchingAgent.js',
    threejs: '../src/components/AIGame/agents/free/threejsAgent.js',
    pixijs: '../src/components/AIGame/agents/free/pixijsAgent.js',
    adaptive: '../src/components/AIGame/agents/free/adaptiveAgent.js'
  };

  if (!agentPaths[agentType]) {
    log(`❌ Tipo de agente no reconocido: ${agentType}`, 'red');
    log(`Tipos disponibles: ${Object.keys(agentPaths).join(', ')}`, 'yellow');
    return;
  }

  try {
    const agentModule = await import(agentPaths[agentType]);
    const agent = agentModule.default || agentModule[Object.keys(agentModule)[0]];
    
    log(`🤖 Agente: ${agent.name}`, 'white');
    log(`📝 Descripción: ${agent.description}`, 'white');
    log(`🎯 Capacidades: ${agent.capabilities?.join(', ') || 'N/A'}`, 'white');
    
    const result = await agent.generateGame(testContext);
    
    if (result.success) {
      log(`✅ Generación exitosa!`, 'green');
      log(`🎮 Juego: ${result.title}`, 'white');
      
      // Guardar y mostrar
      const gameData = {
        type: agentType,
        name: agent.name,
        result: result,
        duration: 0,
        timestamp: new Date().toISOString()
      };
      
      await saveGameToFile(gameData);
      
    } else {
      log(`❌ Error: ${result.error}`, 'red');
    }
    
  } catch (error) {
    log(`💥 Error: ${error.message}`, 'red');
  }
}

// Ejecutar según argumentos
const args = process.argv.slice(2);

if (args.length > 0 && args[0] !== 'all') {
  // Probar agente específico
  testSpecificAgent(args[0]).catch(console.error);
} else {
  // Probar todos los agentes
  testGameGeneration().catch(console.error);
}

export { testGameGeneration, testSpecificAgent };
