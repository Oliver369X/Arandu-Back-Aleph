const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function addBlockchain3DGame() {
  console.log('🎮 Agregando juego 3D de Blockchain...\n');

  try {
    // 1. BUSCAR EL SUBTÓPICO "Introducción a Blockchain"
    const blockchainSubject = await prisma.subject.findFirst({
      where: {
        name: 'Fundamentos de Blockchain y Criptomonedas'
      },
      include: {
        subtopics: true
      }
    });

    if (!blockchainSubject) {
      console.log('❌ No se encontró el curso de Blockchain');
      return;
    }

    // Buscar el subtópico "Introducción a Blockchain"
    const introSubtopic = blockchainSubject.subtopics.find(s => 
      s.name.includes('Introducción') || s.name.includes('blockchain')
    );

    if (!introSubtopic) {
      console.log('❌ No se encontró el subtópico de Introducción a Blockchain');
      console.log('Subtópicos disponibles:', blockchainSubject.subtopics.map(s => s.name));
      return;
    }

    console.log(`📖 Subtópico encontrado: ${introSubtopic.name}`);

    // 2. LEER EL CONTENIDO HTML DEL JUEGO
    const gameHtmlPath = path.join(__dirname, '../src/components/AIGame/examples/juegos/gameBlokchin.html');
    
    if (!fs.existsSync(gameHtmlPath)) {
      console.log('❌ No se encontró el archivo del juego:', gameHtmlPath);
      return;
    }

    const gameHtmlContent = fs.readFileSync(gameHtmlPath, 'utf8');
    console.log(`📄 Contenido HTML leído: ${Math.round(gameHtmlContent.length / 1024)}KB`);

    // 3. VERIFICAR SI YA EXISTE UN JUEGO 3D PARA ESTE SUBTÓPICO
    const existingGame = await prisma.aIGame.findFirst({
      where: {
        subtopicId: introSubtopic.id,
        gameType: 'threejs'
      }
    });

    if (existingGame) {
      console.log('⚠️ Ya existe un juego 3D para este subtópico. Actualizando...');
      
      const updatedGame = await prisma.aIGame.update({
        where: {
          id: existingGame.id
        },
        data: {
          title: '🎮 Aventura Blockchain 3D Interactiva',
          description: 'Explora el mundo del blockchain en una aventura 3D. Construye bloques, mina criptomonedas y aprende cómo funciona la cadena de bloques de forma interactiva.',
          instructions: '¡Bienvenido a la Aventura Blockchain! Arrastra para rotar la cámara, usa la rueda del mouse para zoom. Haz clic en los bloques para aprender. Usa las teclas: ESPACIO (agregar bloque), M (minar), B (romper cadena), R (reiniciar), T (tutorial)',
          htmlContent: gameHtmlContent,
          difficulty: 'easy',
          estimatedTime: 25,
          playCount: 0, // Reset play count
          updatedAt: new Date()
        }
      });

      console.log(`✅ Juego 3D actualizado: ${updatedGame.id}`);
    } else {
      // 4. CREAR EL NUEVO JUEGO 3D
      const newGame = await prisma.aIGame.create({
        data: {
          subtopicId: introSubtopic.id,
          gameType: 'threejs',
          agentType: 'free',
          title: '🎮 Aventura Blockchain 3D Interactiva',
          description: 'Explora el mundo del blockchain en una aventura 3D completa. Construye bloques, mina criptomonedas, rompe cadenas para entender la seguridad, y aprende cómo funciona la tecnología blockchain de forma visual e interactiva.',
          instructions: `¡Bienvenido a la Aventura Blockchain! 🎮

🖱️ CONTROLES:
• Arrastra para rotar la cámara
• Rueda del mouse para zoom
• Haz clic en los bloques para aprender

⌨️ TECLAS RÁPIDAS:
• ESPACIO: Agregar bloque rápido
• M: Iniciar minería con puzzle
• B: Romper cadena (ver seguridad)
• R: Reiniciar blockchain
• T: Mostrar tutorial completo

🎯 OBJETIVOS:
• Entender qué es un blockchain
• Aprender sobre bloques y cadenas
• Experimentar con minería
• Ver cómo funciona la seguridad

¡Gana puntos explorando y completando actividades!`,
          htmlContent: gameHtmlContent,
          difficulty: 'easy',
          estimatedTime: 25, // 25 minutos de juego
          isActive: true,
          playCount: 0
        }
      });

      console.log(`✅ Nuevo juego 3D creado: ${newGame.id}`);
    }

    // 5. VERIFICAR QUE SE CREÓ CORRECTAMENTE
    const allGamesForSubtopic = await prisma.aIGame.findMany({
      where: {
        subtopicId: introSubtopic.id
      },
      select: {
        id: true,
        gameType: true,
        title: true,
        playCount: true
      }
    });

    console.log('\n🎯 JUEGOS PARA "INTRODUCCIÓN A BLOCKCHAIN":');
    allGamesForSubtopic.forEach((game, index) => {
      console.log(`${index + 1}. ${game.title} (${game.gameType}) - ${game.playCount} jugadas`);
    });

    console.log('\n🎉 ¡JUEGO 3D DE BLOCKCHAIN AGREGADO EXITOSAMENTE!');
    console.log('=====================================');
    console.log('🎮 Ahora puedes:');
    console.log('1. Ir al dashboard del teacher');
    console.log('2. Ver la sección "Juegos AI"');
    console.log('3. Buscar "Aventura Blockchain 3D"');
    console.log('4. ¡Hacer clic en "Jugar" y disfrutar!');
    console.log('');
    console.log('💡 El juego incluye:');
    console.log('• Gráficos 3D con Three.js');
    console.log('• Tutorial interactivo');
    console.log('• Sistema de puntuación');
    console.log('• Minería con puzzles');
    console.log('• Efectos visuales y animaciones');
    console.log('• Controles de cámara avanzados');

  } catch (error) {
    console.error('❌ Error agregando el juego:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  addBlockchain3DGame();
}

module.exports = { addBlockchain3DGame };
