const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Invalid JSON', raw: data, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      reject(new Error('Request timeout'));
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testGameGenerator() {
  console.log('🤖 Probando el generador de juegos AI...\n');

  try {
    // 1. BUSCAR UN SUBTÓPICO DE BLOCKCHAIN
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const blockchainSubject = await prisma.subject.findFirst({
      where: {
        name: 'Fundamentos de Blockchain y Criptomonedas'
      },
      include: {
        subtopics: true
      }
    });

    if (!blockchainSubject || blockchainSubject.subtopics.length === 0) {
      console.log('❌ No se encontró curso de blockchain con subtópicos');
      return;
    }

    const subtopic = blockchainSubject.subtopics[0];
    console.log(`📖 Usando subtópico: ${subtopic.name} (${subtopic.id})`);

    // 2. PROBAR DIFERENTES TIPOS DE JUEGO
    const testCases = [
      { 
        gameType: 'quiz', 
        difficulty: 'easy',
        customPrompt: 'Crear un quiz básico sobre blockchain para principiantes'
      },
      { 
        gameType: 'memory', 
        difficulty: 'medium',
        customPrompt: 'Memory game con conceptos de blockchain'
      },
      { 
        gameType: 'wordsearch', 
        difficulty: 'easy',
        customPrompt: 'Sopa de letras con términos de criptomonedas'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🎮 Probando generación de juego tipo: ${testCase.gameType}`);
      console.log(`   Dificultad: ${testCase.difficulty}`);
      
      try {
        const startTime = Date.now();
        const response = await makeRequest(
          `/api-v1/ai-games/generate/${subtopic.id}`,
          'POST',
          testCase
        );
        const endTime = Date.now();

        console.log(`   ⏱️ Tiempo de generación: ${endTime - startTime}ms`);
        console.log(`   📊 Status: ${response.success ? '✅ Success' : '❌ Error'}`);

        if (response.success && response.data) {
          const game = response.data.game;
          console.log(`   🎯 Juego generado: ${game.title}`);
          console.log(`   📝 Descripción: ${game.description.substring(0, 100)}...`);
          console.log(`   🤖 Agente usado: ${response.data.generationInfo.agentUsed}`);
          console.log(`   📏 HTML size: ${Math.round(game.htmlContent.length / 1024)}KB`);
          console.log(`   ⏰ Tiempo estimado: ${game.estimatedTime} min`);
        } else {
          console.log(`   ❌ Error: ${response.error || response.raw}`);
        }

      } catch (error) {
        console.log(`   ❌ Error en request: ${error.message}`);
      }
    }

    await prisma.$disconnect();

    console.log('\n🏁 PRUEBA COMPLETADA');
    console.log('================');
    console.log('Si todos los tests pasaron, el generador está funcionando correctamente');
    console.log('con los agentes especializados y free');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar
testGameGenerator();
