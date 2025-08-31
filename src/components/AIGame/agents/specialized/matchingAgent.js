export const matchingAgent = {
  name: 'Agente Emparejar Conceptos',
  description: 'Crea juegos de emparejar conceptos con sus definiciones o relaciones',
  type: 'specialized',
  gameType: 'matching',
  capabilities: ['Pares conceptuales', 'Drag and drop', 'Retroalimentación inmediata'],
  estimatedTime: '6-10 minutos',

  async generateGame(gameContext) {
    try {
      const pairs = await this.generatePairs(gameContext);
      const config = this.getGameConfig(gameContext.options.difficulty);
      const htmlContent = this.generateHTML(gameContext, pairs, config);
      const metadata = this.createGameMetadata(gameContext, pairs);

      return {
        success: true,
        gameType: 'matching',
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
        error: 'Error en generación de juego de emparejar',
        code: 'GENERATION_ERROR'
      };
    }
  },

  async generatePairs(gameContext) {
    const { subtopic } = gameContext;
    let pairs = [];

    // Pares base del tema
    pairs.push({
      left: subtopic.name,
      right: 'Tema principal de estudio',
      id: 1
    });

    // Pares específicos según el tema
    if (subtopic.name.toLowerCase().includes('blockchain')) {
      pairs.push(
        { left: 'Blockchain', right: 'Cadena de bloques distribuida', id: 2 },
        { left: 'Bitcoin', right: 'Primera criptomoneda', id: 3 },
        { left: 'Smart Contract', right: 'Contrato inteligente autoejecutado', id: 4 },
        { left: 'Descentralización', right: 'Sin autoridad central', id: 5 },
        { left: 'Hash', right: 'Función criptográfica', id: 6 }
      );
    } else if (subtopic.name.toLowerCase().includes('avalanche')) {
      pairs.push(
        { left: 'AVAX', right: 'Token nativo de Avalanche', id: 2 },
        { left: 'Subnet', right: 'Red blockchain personalizada', id: 3 },
        { left: 'Consensus', right: 'Mecanismo de acuerdo', id: 4 },
        { left: 'Validator', right: 'Nodo que valida transacciones', id: 5 }
      );
    } else {
      // Pares generales
      pairs.push(
        { left: 'Concepto', right: 'Idea o noción abstracta', id: 2 },
        { left: 'Aplicación', right: 'Uso práctico del conocimiento', id: 3 },
        { left: 'Teoría', right: 'Conjunto de principios', id: 4 },
        { left: 'Práctica', right: 'Ejercicio de una actividad', id: 5 }
      );
    }

    return pairs.slice(0, 6);
  },

  getGameConfig(difficulty) {
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
    <title>${metadata.title}</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .matching-container { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 800px; width: 100%; }
        .matching-header { text-align: center; margin-bottom: 30px; }
        .matching-title { color: #333; font-size: 2.5em; margin: 0 0 10px 0; }
        .matching-area { display: flex; gap: 40px; justify-content: space-between; margin-bottom: 30px; }
        .matching-column { flex: 1; }
        .column-title { font-size: 1.3em; font-weight: bold; text-align: center; margin-bottom: 20px; color: #333; }
        .matching-item { background: #007bff; color: white; padding: 15px; margin: 10px 0; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; text-align: center; font-weight: bold; }
        .matching-item:hover { background: #0056b3; transform: translateY(-2px); }
        .matching-item.selected { background: #28a745; }
        .matching-item.matched { background: #6c757d; pointer-events: none; opacity: 0.7; }
        .matching-item.wrong { background: #dc3545; animation: shake 0.5s; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .matching-stats { display: flex; justify-content: space-around; background: #f8f9fa; padding: 20px; border-radius: 10px; }
        .stat-item { text-align: center; }
        .stat-value { font-size: 1.5em; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; font-size: 0.9em; }
        .reset-btn { width: 100%; padding: 15px; background: #007bff; color: white; border: none; border-radius: 10px; font-size: 1.1em; margin-top: 20px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="matching-container">
        <div class="matching-header">
            <h1 class="matching-title">${metadata.title}</h1>
            <p>${metadata.description}</p>
            <div><strong>Instrucciones:</strong> ${metadata.instructions}</div>
        </div>
        
        <div class="matching-area">
            <div class="matching-column">
                <div class="column-title">Conceptos</div>
                <div id="leftColumn"></div>
            </div>
            <div class="matching-column">
                <div class="column-title">Definiciones</div>
                <div id="rightColumn"></div>
            </div>
        </div>
        
        <div class="matching-stats">
            <div class="stat-item">
                <div class="stat-value" id="matches">0</div>
                <div class="stat-label">Pares Correctos</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="attempts">0</div>
                <div class="stat-label">Intentos</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="timer">00:00</div>
                <div class="stat-label">Tiempo</div>
            </div>
        </div>
        
        <button class="reset-btn" onclick="resetGame()">Reiniciar Juego</button>
    </div>

    <script>
        const pairs = ${JSON.stringify(pairs)};
        let selectedLeft = null;
        let selectedRight = null;
        let matches = 0;
        let attempts = 0;
        let startTime = Date.now();
        let gameTimer;

        function initGame() {
            renderColumns();
            startTimer();
        }

        function renderColumns() {
            const leftColumn = document.getElementById('leftColumn');
            const rightColumn = document.getElementById('rightColumn');
            
            leftColumn.innerHTML = '';
            rightColumn.innerHTML = '';
            
            // Mezclar las opciones de la derecha
            const rightOptions = [...pairs].sort(() => Math.random() - 0.5);
            
            pairs.forEach(pair => {
                const leftItem = document.createElement('div');
                leftItem.className = 'matching-item';
                leftItem.textContent = pair.left;
                leftItem.dataset.id = pair.id;
                leftItem.onclick = () => selectLeft(pair.id, leftItem);
                leftColumn.appendChild(leftItem);
            });
            
            rightOptions.forEach(pair => {
                const rightItem = document.createElement('div');
                rightItem.className = 'matching-item';
                rightItem.textContent = pair.right;
                rightItem.dataset.id = pair.id;
                rightItem.onclick = () => selectRight(pair.id, rightItem);
                rightColumn.appendChild(rightItem);
            });
        }

        function selectLeft(id, element) {
            if (element.classList.contains('matched')) return;
            
            // Deseleccionar anterior
            if (selectedLeft) {
                selectedLeft.element.classList.remove('selected');
            }
            
            selectedLeft = { id, element };
            element.classList.add('selected');
            
            checkMatch();
        }

        function selectRight(id, element) {
            if (element.classList.contains('matched')) return;
            
            // Deseleccionar anterior
            if (selectedRight) {
                selectedRight.element.classList.remove('selected');
            }
            
            selectedRight = { id, element };
            element.classList.add('selected');
            
            checkMatch();
        }

        function checkMatch() {
            if (!selectedLeft || !selectedRight) return;
            
            attempts++;
            document.getElementById('attempts').textContent = attempts;
            
            if (selectedLeft.id === selectedRight.id) {
                // Match correcto
                selectedLeft.element.classList.remove('selected');
                selectedRight.element.classList.remove('selected');
                selectedLeft.element.classList.add('matched');
                selectedRight.element.classList.add('matched');
                
                matches++;
                document.getElementById('matches').textContent = matches;
                
                selectedLeft = null;
                selectedRight = null;
                
                if (matches === pairs.length) {
                    clearInterval(gameTimer);
                    setTimeout(() => alert('¡Felicitaciones! Has completado todos los pares.'), 500);
                }
            } else {
                // Match incorrecto
                selectedLeft.element.classList.add('wrong');
                selectedRight.element.classList.add('wrong');
                
                setTimeout(() => {
                    selectedLeft.element.classList.remove('selected', 'wrong');
                    selectedRight.element.classList.remove('selected', 'wrong');
                    selectedLeft = null;
                    selectedRight = null;
                }, 1000);
            }
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

        function resetGame() {
            clearInterval(gameTimer);
            selectedLeft = null;
            selectedRight = null;
            matches = 0;
            attempts = 0;
            startTime = Date.now();
            
            document.getElementById('matches').textContent = matches;
            document.getElementById('attempts').textContent = attempts;
            
            initGame();
        }

        document.addEventListener('DOMContentLoaded', initGame);
    </script>
</body>
</html>`;
  },

  createGameMetadata(gameContext, pairs) {
    const { subtopic } = gameContext;
    return {
      title: `Emparejar: ${subtopic.name}`,
      description: `Conecta cada concepto con su definición correspondiente relacionada con ${subtopic.name}.`,
      instructions: `Haz clic en un concepto de la columna izquierda y luego en su definición correspondiente de la columna derecha.`
    };
  }
};

export default matchingAgent;
