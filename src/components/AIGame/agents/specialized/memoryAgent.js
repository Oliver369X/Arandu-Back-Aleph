export const memoryAgent = {
  name: 'Agente Juego de Memoria',
  description: 'Especialista en crear juegos de memoria con pares de conceptos educativos',
  type: 'specialized',
  gameType: 'memory',
  capabilities: ['Generación de pares conceptuales', 'Adaptación de dificultad', 'Interfaz de cartas'],
  estimatedTime: '5-8 minutos',

  async generateGame(gameContext) {
    try {
      console.log(`🧠 [MemoryAgent] Generando juego de memoria para: ${gameContext.subtopic.name}`);

      const pairs = await this.generatePairs(gameContext);
      const config = this.getGameConfig(gameContext.options.difficulty, pairs.length);
      const htmlContent = this.generateHTML(gameContext, pairs, config);
      const metadata = this.createGameMetadata(gameContext, pairs);

      return {
        success: true,
        gameType: 'memory',
        title: metadata.title,
        description: metadata.description,
        instructions: metadata.instructions,
        htmlContent: htmlContent,
        estimatedTime: config.estimatedTime,
        tokensUsed: 0
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error en generación de juego de memoria',
        code: 'GENERATION_ERROR',
        details: error.message
      };
    }
  },

  async generatePairs(gameContext) {
    const { subtopic } = gameContext;
    
    // Generar pares concepto-definición basados en el tema
    const pairs = [
      { concept: subtopic.name, definition: `Concepto principal del tema` },
      { concept: 'Aplicación', definition: `Uso práctico de ${subtopic.name}` },
      { concept: 'Importancia', definition: `Relevancia de ${subtopic.name}` },
      { concept: 'Características', definition: `Propiedades de ${subtopic.name}` }
    ];

    // Agregar pares específicos según el tema
    if (subtopic.name.toLowerCase().includes('blockchain')) {
      pairs.push(
        { concept: 'Descentralización', definition: 'Sin autoridad central' },
        { concept: 'Inmutabilidad', definition: 'No se puede cambiar' },
        { concept: 'Transparencia', definition: 'Visible para todos' }
      );
    }

    return pairs.slice(0, 8); // Máximo 8 pares
  },

  getGameConfig(difficulty, pairsCount) {
    const configs = {
      easy: { maxPairs: 4, estimatedTime: 6 },
      medium: { maxPairs: 6, estimatedTime: 10 },
      hard: { maxPairs: 8, estimatedTime: 15 }
    };
    return configs[difficulty] || configs.medium;
  },

  generateHTML(gameContext, pairs, config) {
    const metadata = this.createGameMetadata(gameContext, pairs);
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.title}</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
        .game-container { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 800px; width: 100%; }
        .game-header { text-align: center; margin-bottom: 30px; }
        .game-title { color: #333; font-size: 2.5em; margin: 0 0 10px 0; }
        .game-description { color: #666; font-size: 1.1em; margin-bottom: 20px; }
        .instructions { background: #f8f9fa; padding: 15px; border-radius: 10px; border-left: 4px solid #007bff; margin-bottom: 20px; }
        .memory-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .memory-card { aspect-ratio: 1; background: #007bff; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; color: white; font-weight: bold; text-align: center; padding: 10px; font-size: 0.9em; }
        .memory-card:hover { transform: scale(1.05); }
        .memory-card.flipped { background: #28a745; }
        .memory-card.matched { background: #6c757d; pointer-events: none; }
        .game-stats { display: flex; justify-content: space-around; background: #f8f9fa; padding: 20px; border-radius: 10px; }
        .stat-item { text-align: center; }
        .stat-value { font-size: 1.5em; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="game-container">
        <div class="game-header">
            <h1 class="game-title">${metadata.title}</h1>
            <p class="game-description">${metadata.description}</p>
            <div class="instructions"><strong>Instrucciones:</strong> ${metadata.instructions}</div>
        </div>
        <div class="memory-grid" id="memoryGrid"></div>
        <div class="game-stats">
            <div class="stat-item">
                <div class="stat-value" id="moves">0</div>
                <div class="stat-label">Movimientos</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="matches">0</div>
                <div class="stat-label">Pares Encontrados</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="timer">00:00</div>
                <div class="stat-label">Tiempo</div>
            </div>
        </div>
    </div>

    <script>
        const pairs = ${JSON.stringify(pairs)};
        let cards = [];
        let flippedCards = [];
        let matches = 0;
        let moves = 0;
        let startTime = Date.now();
        let gameTimer;

        function initGame() {
            // Crear cartas (cada par se duplica)
            pairs.forEach(pair => {
                cards.push({ type: 'concept', content: pair.concept, pairId: pair.concept });
                cards.push({ type: 'definition', content: pair.definition, pairId: pair.concept });
            });
            
            // Mezclar cartas
            cards = cards.sort(() => Math.random() - 0.5);
            
            renderGrid();
            startTimer();
        }

        function renderGrid() {
            const grid = document.getElementById('memoryGrid');
            grid.innerHTML = '';
            
            cards.forEach((card, index) => {
                const cardElement = document.createElement('div');
                cardElement.className = 'memory-card';
                cardElement.textContent = '?';
                cardElement.dataset.index = index;
                cardElement.onclick = () => flipCard(index);
                grid.appendChild(cardElement);
            });
        }

        function flipCard(index) {
            if (flippedCards.length >= 2 || flippedCards.includes(index)) return;
            
            const cardElement = document.querySelector(\`[data-index="\${index}"]\`);
            cardElement.textContent = cards[index].content;
            cardElement.classList.add('flipped');
            flippedCards.push(index);
            
            if (flippedCards.length === 2) {
                moves++;
                document.getElementById('moves').textContent = moves;
                setTimeout(checkMatch, 1000);
            }
        }

        function checkMatch() {
            const [first, second] = flippedCards;
            const firstCard = cards[first];
            const secondCard = cards[second];
            
            if (firstCard.pairId === secondCard.pairId) {
                // Match found
                document.querySelector(\`[data-index="\${first}"]\`).classList.add('matched');
                document.querySelector(\`[data-index="\${second}"]\`).classList.add('matched');
                matches++;
                document.getElementById('matches').textContent = matches;
                
                if (matches === pairs.length) {
                    clearInterval(gameTimer);
                    setTimeout(() => alert('¡Felicitaciones! Has completado el juego.'), 500);
                }
            } else {
                // No match
                document.querySelector(\`[data-index="\${first}"]\`).textContent = '?';
                document.querySelector(\`[data-index="\${second}"]\`).textContent = '?';
                document.querySelector(\`[data-index="\${first}"]\`).classList.remove('flipped');
                document.querySelector(\`[data-index="\${second}"]\`).classList.remove('flipped');
            }
            
            flippedCards = [];
        }

        function startTimer() {
            gameTimer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('timer').textContent = 
                    \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
            }, 1000);
        }

        document.addEventListener('DOMContentLoaded', initGame);
    </script>
</body>
</html>`;
  },

  createGameMetadata(gameContext, pairs) {
    const { subtopic } = gameContext;
    return {
      title: `Memoria: ${subtopic.name}`,
      description: `Encuentra los pares de conceptos y definiciones relacionados con ${subtopic.name}.`,
      instructions: `Haz clic en las cartas para voltearlas y encuentra los pares que coincidan. Cada concepto tiene su definición correspondiente.`
    };
  }
};

export default memoryAgent;
