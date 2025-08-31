const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Invalid JSON', raw: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function testAIGamesAPI() {
  console.log('🎮 Probando los endpoints de AI Games...\n');

  const baseUrl = 'http://localhost:3001';
  
  const endpoints = [
    { name: 'Todos los juegos', url: '/api-v1/ai-games' },
    { name: 'Juegos populares', url: '/api-v1/ai-games/populares?limit=6' },
    { name: 'Estadísticas', url: '/api-v1/ai-games/estadisticas' }
  ];

  for (const endpoint of endpoints) {
    console.log(`🔍 Probando: ${endpoint.name}`);
    console.log(`   URL: ${baseUrl}${endpoint.url}`);
    
    try {
      const data = await makeRequest(endpoint.url);
      
      console.log(`   ✅ Success: ${data ? 'true' : 'false'}`);
      console.log(`   📄 Response:`, JSON.stringify(data, null, 2));
      
      if (endpoint.url.includes('populares')) {
        console.log(`   🔍 Array check: ${Array.isArray(data.data)}`);
        console.log(`   📊 Count: ${data.data ? data.data.length : 'N/A'}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log('');
    }
  }
  
  // Test específico para un subtópico de blockchain
  console.log('🔍 Probando juegos por subtópico (blockchain)...');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Buscar un subtópico de blockchain
    const blockchainSubtopic = await prisma.subtopic.findFirst({
      where: {
        subject: {
          name: 'Fundamentos de Blockchain y Criptomonedas'
        }
      }
    });
    
    if (blockchainSubtopic) {
      console.log(`   📖 Subtópico encontrado: ${blockchainSubtopic.name}`);
      
      const data = await makeRequest(`/api-v1/ai-games/subtopic/${blockchainSubtopic.id}`);
      
      console.log(`   ✅ Success: ${data ? 'true' : 'false'}`);
      console.log(`   📊 Juegos para este subtópico: ${data.data ? data.data.length : 'N/A'}`);
      
      if (data.data && data.data.length > 0) {
        console.log('   🎮 Juegos encontrados:');
        data.data.forEach((game, index) => {
          console.log(`     ${index + 1}. ${game.title} (${game.gameType})`);
        });
      }
    } else {
      console.log('   ⚠️ No se encontró subtópico de blockchain');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.log(`   ❌ Error probando subtópico: ${error.message}`);
  }
}

// Ejecutar
testAIGamesAPI().catch(console.error);
