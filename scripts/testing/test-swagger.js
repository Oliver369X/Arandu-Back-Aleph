import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testSwaggerDocumentation() {
  console.log('🔍 Probando documentación Swagger...\n');

  try {
    // Test 1: Verificar que Swagger UI esté disponible
    console.log('1. Verificando Swagger UI...');
    const swaggerUIResponse = await fetch(`${API_BASE}/api-docs/`);
    
    if (swaggerUIResponse.ok) {
      console.log('✅ Swagger UI disponible en /api-docs/');
    } else {
      console.log(`❌ Swagger UI no disponible (${swaggerUIResponse.status})`);
    }

    // Test 2: Verificar JSON de documentación
    console.log('\n2. Verificando JSON de documentación...');
    const swaggerJSONResponse = await fetch(`${API_BASE}/api-docs/swagger.json`);
    
    if (swaggerJSONResponse.ok) {
      const swaggerData = await swaggerJSONResponse.json();
      console.log('✅ JSON de Swagger disponible');
      
      // Verificar que AIGame esté incluido
      const paths = Object.keys(swaggerData.paths || {});
      const aiGamePaths = paths.filter(path => path.includes('ai-games'));
      
      console.log(`\n📊 Estadísticas de documentación:`);
      console.log(`   - Total de endpoints: ${paths.length}`);
      console.log(`   - Endpoints de AI Games: ${aiGamePaths.length}`);
      
      if (aiGamePaths.length > 0) {
        console.log('✅ Endpoints de AI Games encontrados:');
        aiGamePaths.forEach(path => {
          const methods = Object.keys(swaggerData.paths[path]);
          console.log(`   - ${methods.join(', ').toUpperCase()} ${path}`);
        });
      } else {
        console.log('❌ No se encontraron endpoints de AI Games en la documentación');
      }

      // Verificar tags
      const tags = swaggerData.tags || [];
      const aiGameTag = tags.find(tag => tag.name === 'AI Games');
      
      if (aiGameTag) {
        console.log('✅ Tag "AI Games" encontrado en la documentación');
      } else {
        console.log('❌ Tag "AI Games" no encontrado');
        console.log('   Tags disponibles:', tags.map(t => t.name).join(', '));
      }

    } else {
      console.log(`❌ JSON de Swagger no disponible (${swaggerJSONResponse.status})`);
    }

    // Test 3: Verificar endpoint específico de AI Games
    console.log('\n3. Verificando endpoint de AI Games...');
    const aiGamesResponse = await fetch(`${API_BASE}/api-v1/ai-games`);
    
    if (aiGamesResponse.ok) {
      console.log('✅ Endpoint /api-v1/ai-games funcional');
    } else {
      console.log(`❌ Endpoint /api-v1/ai-games no funcional (${aiGamesResponse.status})`);
    }

  } catch (error) {
    console.log(`❌ Error al probar Swagger: ${error.message}`);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo en el puerto 3001');
  }
}

// Ejecutar si es llamado directamente
if (process.argv[1].endsWith('test-swagger.js')) {
  testSwaggerDocumentation().catch(console.error);
}

export { testSwaggerDocumentation };
