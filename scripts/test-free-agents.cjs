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
    req.setTimeout(45000, () => {  // Más tiempo para agentes free
      reject(new Error('Request timeout'));
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testFreeAgents() {
  console.log('🚀 Probando los agentes FREE (threejs, pixijs, adaptive)...\n');

  try {
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

    const subtopic = blockchainSubject.subtopics[0];
    console.log(`📖 Usando subtópico: ${subtopic.name}`);

    // PROBAR AGENTES FREE
    const freeAgentTests = [
      { 
        gameType: 'adaptive', 
        difficulty: 'medium',
        customPrompt: 'Experiencia interactiva sobre conceptos básicos de blockchain'
      },
      { 
        gameType: 'threejs', 
        difficulty: 'hard',
        customPrompt: 'Visualización 3D de una cadena de bloques'
      }
    ];

    for (const test of freeAgentTests) {
      console.log(`\n🎯 Probando agente FREE: ${test.gameType}`);
      console.log(`   Prompt: ${test.customPrompt}`);
      
      try {
        const startTime = Date.now();
        const response = await makeRequest(
          `/api-v1/ai-games/generate/${subtopic.id}`,
          'POST',
          test
        );
        const endTime = Date.now();

        console.log(`   ⏱️ Tiempo de generación: ${endTime - startTime}ms`);
        console.log(`   📊 Status: ${response.success ? '✅ Success' : '❌ Error'}`);

        if (response.success && response.data) {
          const game = response.data.game;
          console.log(`   🎯 Juego generado: ${game.title}`);
          console.log(`   📝 Descripción: ${game.description.substring(0, 120)}...`);
          console.log(`   🤖 Agente usado: ${response.data.generationInfo.agentUsed}`);
          console.log(`   📏 HTML size: ${Math.round(game.htmlContent.length / 1024)}KB`);
          console.log(`   ⏰ Tiempo estimado: ${game.estimatedTime} min`);
          
          // Verificar que incluya librerías necesarias
          if (test.gameType === 'threejs' && game.htmlContent.includes('three.js')) {
            console.log('   ✅ Incluye Three.js correctamente');
          }
          if (test.gameType === 'pixijs' && game.htmlContent.includes('pixi.js')) {
            console.log('   ✅ Incluye PixiJS correctamente');
          }
        } else {
          console.log(`   ❌ Error: ${response.error || response.raw}`);
        }

      } catch (error) {
        console.log(`   ❌ Error en request: ${error.message}`);
      }
    }

    await prisma.$disconnect();

    console.log('\n🏁 PRUEBA DE AGENTES FREE COMPLETADA');
    console.log('==================================');
    console.log('Los agentes free son más lentos pero generan contenido más complejo');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar
testFreeAgents();
