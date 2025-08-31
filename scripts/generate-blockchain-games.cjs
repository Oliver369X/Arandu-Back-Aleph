const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateBlockchainAIGames() {
  console.log('🎮 Generando AI Games para el curso de Blockchain...\n');

  try {
    // 1. BUSCAR EL CURSO DE BLOCKCHAIN Y SUS SUBTÓPICOS
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

    console.log(`📚 Curso encontrado: ${blockchainSubject.name}`);
    console.log(`📖 Subtópicos disponibles: ${blockchainSubject.subtopics.length}\n`);

    // 2. GENERAR JUEGOS PARA SUBTÓPICOS ESPECÍFICOS
    const gamesConfig = [
      {
        subtopic: 'Bitcoin: La Primera Criptomoneda',
        gameType: 'quiz',
        title: 'Quiz: Conocimientos de Bitcoin',
        description: 'Pon a prueba tus conocimientos sobre Bitcoin, su historia y funcionamiento',
        difficulty: 'medium'
      },
      {
        subtopic: 'Ethereum y Smart Contracts',
        gameType: 'memory',
        title: 'Memory Game: Conceptos de Ethereum',
        description: 'Encuentra las parejas de conceptos relacionados con Ethereum y Smart Contracts',
        difficulty: 'easy'
      },
      {
        subtopic: 'DeFi: Finanzas Descentralizadas',
        gameType: 'matching',
        title: 'Matching: Protocolos DeFi',
        description: 'Conecta cada protocolo DeFi con su función principal',
        difficulty: 'hard'
      },
      {
        subtopic: 'Criptografía y Hashing',
        gameType: 'wordsearch',
        title: 'Sopa de Letras: Términos Criptográficos',
        description: 'Encuentra términos relacionados con criptografía y hashing',
        difficulty: 'easy'
      },
      {
        subtopic: 'Avalanche Ecosystem',
        gameType: 'puzzle',
        title: 'Puzzle: Arquitectura de Avalanche',
        description: 'Arma el rompecabezas sobre la arquitectura de subredes de Avalanche',
        difficulty: 'medium'
      },
      {
        subtopic: 'NFTs y Tokens no Fungibles',
        gameType: 'adaptive',
        title: 'Explorador NFT Interactivo',
        description: 'Experiencia interactiva para explorar el mundo de los NFTs',
        difficulty: 'medium'
      }
    ];

    // 3. CREAR LOS JUEGOS
    for (const gameConfig of gamesConfig) {
      // Buscar el subtópico específico
      const subtopic = blockchainSubject.subtopics.find(s => 
        s.name === gameConfig.subtopic
      );

      if (!subtopic) {
        console.log(`⚠️ Subtópico "${gameConfig.subtopic}" no encontrado, saltando...`);
        continue;
      }

      console.log(`🎯 Generando juego: ${gameConfig.title}`);
      console.log(`   📖 Subtópico: ${gameConfig.subtopic}`);
      console.log(`   🎮 Tipo: ${gameConfig.gameType}`);

      // Generar el contenido HTML del juego basado en el tipo
      const htmlContent = generateGameHTML(gameConfig.gameType, gameConfig.subtopic);

      // Crear el juego en la base de datos
      const aiGame = await prisma.aIGame.create({
        data: {
          subtopicId: subtopic.id,
          gameType: gameConfig.gameType,
          agentType: ['threejs', 'pixijs', 'adaptive'].includes(gameConfig.gameType) ? 'free' : 'specialized',
          title: gameConfig.title,
          description: gameConfig.description,
          instructions: generateInstructions(gameConfig.gameType),
          htmlContent: htmlContent,
          difficulty: gameConfig.difficulty,
          estimatedTime: getEstimatedTime(gameConfig.gameType),
          isActive: true,
          playCount: Math.floor(Math.random() * 10) // Simular algunas jugadas
        }
      });

      console.log(`   ✅ Juego creado con ID: ${aiGame.id}\n`);
    }

    // 4. MOSTRAR RESUMEN
    const totalGames = await prisma.aIGame.count({
      where: {
        subtopic: {
          subjectId: blockchainSubject.id
        }
      }
    });

    console.log('🎉 GENERACIÓN DE JUEGOS COMPLETADA!');
    console.log('================================');
    console.log(`🎮 Total de juegos creados: ${totalGames}`);
    console.log(`📚 Para el curso: ${blockchainSubject.name}`);
    
    console.log('\n🎯 JUEGOS DISPONIBLES EN EL DASHBOARD:');
    gamesConfig.forEach((game, index) => {
      console.log(`${index + 1}. ${game.title} (${game.gameType})`);
    });

    console.log('\n🚀 ¡Ahora puedes:');
    console.log('1. Ir al dashboard del teacher');
    console.log('2. Ver la pestaña "Contenido"');
    console.log('3. Hacer clic en los botones 🎮 junto a cada subtópico');
    console.log('4. Ver los juegos generados en la sección "Juegos AI"');

  } catch (error) {
    console.error('❌ Error generando juegos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// FUNCIONES AUXILIARES

function generateGameHTML(gameType, subtopicName) {
  const baseContent = getGameContent(gameType, subtopicName);
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subtopicName} - Juego Educativo</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .game-container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
        }
        .game-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .game-title {
            color: #333;
            margin-bottom: 10px;
        }
        .game-subtitle {
            color: #666;
            font-size: 16px;
        }
        .btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        ${getGameStyles(gameType)}
    </style>
</head>
<body>
    <div class="game-container">
        <div class="game-header">
            <h1 class="game-title">${subtopicName}</h1>
            <p class="game-subtitle">Juego educativo interactivo</p>
        </div>
        ${baseContent}
    </div>
    <script>
        ${getGameScript(gameType, subtopicName)}
    </script>
</body>
</html>
  `.trim();
}

function getGameContent(gameType, subtopicName) {
  const contents = {
    quiz: `
      <div class="quiz-container">
        <div class="question-counter">Pregunta <span id="currentQuestion">1</span> de <span id="totalQuestions">5</span></div>
        <div class="question" id="question">¿Quién es el creador pseudónimo de Bitcoin?</div>
        <div class="options">
          <button class="option" data-answer="correct">Satoshi Nakamoto</button>
          <button class="option">Vitalik Buterin</button>
          <button class="option">Charlie Lee</button>
          <button class="option">Roger Ver</button>
        </div>
        <div class="score">Puntuación: <span id="score">0</span></div>
      </div>
    `,
    memory: `
      <div class="memory-game">
        <div class="memory-board" id="memoryBoard"></div>
        <div class="game-info">
          <div>Movimientos: <span id="moves">0</span></div>
          <div>Parejas: <span id="pairs">0</span>/6</div>
        </div>
        <button class="btn" onclick="restartGame()">Reiniciar</button>
      </div>
    `,
    matching: `
      <div class="matching-game">
        <div class="matching-columns">
          <div class="column" id="leftColumn">
            <h3>Protocolos</h3>
          </div>
          <div class="column" id="rightColumn">
            <h3>Funciones</h3>
          </div>
        </div>
        <div class="score">Conexiones correctas: <span id="connections">0</span>/5</div>
      </div>
    `,
    wordsearch: `
      <div class="wordsearch-game">
        <div class="word-list">
          <h3>Encuentra estas palabras:</h3>
          <div id="wordList"></div>
        </div>
        <div class="grid-container">
          <table id="wordGrid"></table>
        </div>
      </div>
    `,
    puzzle: `
      <div class="puzzle-game">
        <div class="puzzle-board" id="puzzleBoard"></div>
        <div class="puzzle-controls">
          <button class="btn" onclick="shufflePuzzle()">Mezclar</button>
          <button class="btn" onclick="solvePuzzle()">Resolver</button>
        </div>
      </div>
    `,
    adaptive: `
      <div class="adaptive-game">
        <div class="interactive-scene" id="interactiveScene">
          <div class="nft-showcase">
            <h3>Explora el mundo de los NFTs</h3>
            <div class="nft-gallery" id="nftGallery"></div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress" id="progress"></div>
        </div>
      </div>
    `
  };

  return contents[gameType] || contents.quiz;
}

function getGameStyles(gameType) {
  const styles = {
    quiz: `
      .quiz-container { text-align: center; }
      .question-counter { margin-bottom: 20px; font-size: 14px; color: #666; }
      .question { font-size: 24px; font-weight: bold; margin-bottom: 30px; color: #333; }
      .options { display: grid; gap: 15px; margin-bottom: 30px; }
      .option { padding: 15px; border: 2px solid #ddd; border-radius: 10px; background: white; cursor: pointer; transition: all 0.3s ease; }
      .option:hover { background: #f0f0f0; border-color: #667eea; }
      .option.correct { background: #4CAF50; color: white; }
      .option.incorrect { background: #f44336; color: white; }
    `,
    memory: `
      .memory-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 400px; margin: 0 auto 20px; }
      .memory-card { aspect-ratio: 1; background: #667eea; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; color: white; transition: all 0.3s ease; }
      .memory-card.flipped { background: white; color: #333; border: 2px solid #667eea; }
      .game-info { display: flex; justify-content: space-between; margin: 20px 0; }
    `,
    matching: `
      .matching-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px; }
      .column { padding: 20px; border: 2px dashed #ddd; border-radius: 10px; min-height: 300px; }
      .match-item { padding: 10px; margin: 10px 0; background: #f0f0f0; border-radius: 5px; cursor: pointer; transition: all 0.3s ease; }
      .match-item:hover { background: #667eea; color: white; }
    `,
    wordsearch: `
      .wordsearch-game { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }
      .word-list { padding: 20px; background: #f9f9f9; border-radius: 10px; }
      #wordGrid { border-collapse: collapse; margin: 0 auto; }
      #wordGrid td { width: 30px; height: 30px; text-align: center; border: 1px solid #ddd; cursor: pointer; }
      #wordGrid td:hover { background: #667eea; color: white; }
    `,
    puzzle: `
      .puzzle-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; max-width: 300px; margin: 0 auto 20px; }
      .puzzle-piece { aspect-ratio: 1; background: #667eea; border: 2px solid white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; }
      .puzzle-piece.empty { background: #f0f0f0; }
      .puzzle-controls { text-align: center; }
    `,
    adaptive: `
      .adaptive-game { text-align: center; }
      .interactive-scene { padding: 30px; background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); border-radius: 15px; margin-bottom: 20px; }
      .nft-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 20px; }
      .nft-card { padding: 15px; background: rgba(255,255,255,0.9); border-radius: 10px; cursor: pointer; transition: all 0.3s ease; }
      .nft-card:hover { transform: scale(1.05); }
      .progress-bar { height: 10px; background: #f0f0f0; border-radius: 5px; overflow: hidden; }
      .progress { height: 100%; background: linear-gradient(45deg, #667eea, #764ba2); width: 0%; transition: width 0.5s ease; }
    `
  };

  return styles[gameType] || styles.quiz;
}

function getGameScript(gameType, subtopicName) {
  // Script básico para cada tipo de juego
  return `
    console.log('🎮 Juego "${subtopicName}" cargado correctamente');
    
    // Lógica específica del juego tipo ${gameType}
    document.addEventListener('DOMContentLoaded', function() {
      initializeGame();
    });

    function initializeGame() {
      console.log('Inicializando juego de tipo: ${gameType}');
      // Aquí iría la lógica específica del juego
    }
  `;
}

function generateInstructions(gameType) {
  const instructions = {
    quiz: 'Responde correctamente las preguntas sobre el tema. Tienes una sola oportunidad por pregunta.',
    memory: 'Encuentra todas las parejas de cartas. Haz clic para voltear las cartas y memoriza su posición.',
    matching: 'Conecta cada concepto con su definición correcta arrastrando desde la columna izquierda.',
    wordsearch: 'Busca las palabras ocultas en la sopa de letras. Pueden estar horizontal, vertical o diagonal.',
    puzzle: 'Reorganiza las piezas para formar la imagen completa. Haz clic para mover las piezas.',
    adaptive: 'Explora la experiencia interactiva y completa todas las actividades para avanzar.'
  };

  return instructions[gameType] || instructions.quiz;
}

function getEstimatedTime(gameType) {
  const times = {
    quiz: 5,
    memory: 8,
    matching: 10,
    wordsearch: 12,
    puzzle: 15,
    adaptive: 20
  };

  return times[gameType] || 10;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateBlockchainAIGames();
}

module.exports = { generateBlockchainAIGames };
