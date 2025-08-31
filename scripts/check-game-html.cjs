const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGameHTML() {
  console.log('🔍 Verificando el HTML de los juegos generados...\n');

  try {
    // Buscar juegos recientes
    const recentGames = await prisma.aIGame.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 3,
      include: {
        subtopic: true
      }
    });

    for (const game of recentGames) {
      console.log(`\n🎮 Juego: ${game.title}`);
      console.log(`📝 Tipo: ${game.gameType}`);
      console.log(`📏 HTML Size: ${Math.round(game.htmlContent.length / 1024)}KB`);
      
      // Verificar si tiene JavaScript funcional
      const hasJavaScript = game.htmlContent.includes('<script>') && 
                          game.htmlContent.includes('function') &&
                          game.htmlContent.length > 5000; // Mínimo para ser funcional
      
      console.log(`🤖 JavaScript funcional: ${hasJavaScript ? '✅ SÍ' : '❌ NO'}`);
      
      if (!hasJavaScript) {
        console.log('⚠️  PROBLEMA: El HTML no contiene lógica de juego funcional');
        
        // Mostrar una muestra del HTML
        const htmlSample = game.htmlContent.substring(0, 500);
        console.log('📄 Muestra del HTML:');
        console.log('---');
        console.log(htmlSample + '...');
        console.log('---');
      }
      
      // Verificar elementos específicos del juego
      if (game.gameType === 'wordsearch') {
        const hasGrid = game.htmlContent.includes('wordGrid') || 
                       game.htmlContent.includes('grid') ||
                       game.htmlContent.includes('table');
        console.log(`🔤 Sopa de letras - Grilla: ${hasGrid ? '✅' : '❌'}`);
      }
      
      if (game.gameType === 'quiz') {
        const hasQuestions = game.htmlContent.includes('question') ||
                            game.htmlContent.includes('quiz');
        console.log(`❓ Quiz - Preguntas: ${hasQuestions ? '✅' : '❌'}`);
      }
      
      if (game.gameType === 'memory') {
        const hasCards = game.htmlContent.includes('card') ||
                        game.htmlContent.includes('memory');
        console.log(`🧠 Memory - Cartas: ${hasCards ? '✅' : '❌'}`);
      }
    }

    console.log('\n🎯 DIAGNÓSTICO:');
    const functionalGames = recentGames.filter(g => 
      g.htmlContent.includes('<script>') && 
      g.htmlContent.includes('function') &&
      g.htmlContent.length > 5000
    );

    console.log(`📊 Juegos funcionales: ${functionalGames.length}/${recentGames.length}`);
    
    if (functionalGames.length === 0) {
      console.log('❌ PROBLEMA: Los agentes NO están generando JavaScript funcional');
      console.log('🔧 SOLUCIÓN NECESARIA:');
      console.log('   1. Revisar y mejorar los agentes especializados');
      console.log('   2. Agregar plantillas de juegos funcionales');
      console.log('   3. Usar juegos pre-creados como fallback');
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
checkGameHTML();
