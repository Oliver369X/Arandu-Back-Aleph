export const crosswordAgent = {
  name: 'Agente Crucigrama',
  description: 'Genera crucigramas educativos con pistas del tema',
  type: 'specialized',
  gameType: 'crossword',
  capabilities: ['Generación de pistas', 'Colocación de palabras', 'Cruces inteligentes'],
  estimatedTime: '10-15 minutos',

  async generateGame(gameContext) {
    try {
      const words = await this.generateWords(gameContext);
      const config = this.getGameConfig(gameContext.options.difficulty);
      const htmlContent = this.generateHTML(gameContext, words, config);
      const metadata = this.createGameMetadata(gameContext, words);

      return {
        success: true,
        gameType: 'crossword',
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
        error: 'Error en generación de crucigrama',
        code: 'GENERATION_ERROR'
      };
    }
  },

  async generateWords(gameContext) {
    const { subtopic } = gameContext;
    const words = [
      { word: 'EDUCACION', clue: 'Proceso de enseñanza y aprendizaje', direction: 'across', row: 2, col: 1 },
      { word: 'CONOCIMIENTO', clue: 'Información y habilidades adquiridas', direction: 'down', row: 1, col: 3 },
      { word: 'APRENDER', clue: 'Adquirir nuevas habilidades', direction: 'across', row: 5, col: 2 }
    ];

    // Agregar palabras específicas del tema
    if (subtopic.name.toLowerCase().includes('blockchain')) {
      words.push(
        { word: 'BLOCKCHAIN', clue: 'Cadena de bloques distribuida', direction: 'across', row: 1, col: 1 },
        { word: 'BITCOIN', clue: 'Primera criptomoneda', direction: 'down', row: 1, col: 5 }
      );
    }

    return words.slice(0, 8);
  },

  getGameConfig(difficulty) {
    const configs = {
      easy: { gridSize: 10, estimatedTime: 10 },
      medium: { gridSize: 12, estimatedTime: 15 },
      hard: { gridSize: 15, estimatedTime: 20 }
    };
    return configs[difficulty] || configs.medium;
  },

  generateHTML(gameContext, words, config) {
    const metadata = this.createGameMetadata(gameContext, words);
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${metadata.title}</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); margin: 0; padding: 20px; }
        .crossword-container { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 900px; margin: 0 auto; }
        .crossword-header { text-align: center; margin-bottom: 30px; }
        .crossword-title { color: #333; font-size: 2.5em; margin: 0 0 10px 0; }
        .game-content { display: flex; gap: 30px; }
        .crossword-grid { display: grid; grid-template-columns: repeat(${config.gridSize}, 30px); grid-template-rows: repeat(${config.gridSize}, 30px); gap: 1px; background: #ddd; }
        .crossword-cell { background: white; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; }
        .crossword-cell.black { background: #333; }
        .crossword-cell input { width: 100%; height: 100%; border: none; text-align: center; font-size: 14px; font-weight: bold; text-transform: uppercase; }
        .clues-panel { flex: 1; }
        .clues-section { margin-bottom: 20px; }
        .clues-title { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; color: #333; }
        .clue-item { margin-bottom: 8px; padding: 8px; background: #f8f9fa; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="crossword-container">
        <div class="crossword-header">
            <h1 class="crossword-title">${metadata.title}</h1>
            <p>${metadata.description}</p>
            <div><strong>Instrucciones:</strong> ${metadata.instructions}</div>
        </div>
        <div class="game-content">
            <div class="crossword-grid" id="crosswordGrid"></div>
            <div class="clues-panel">
                <div class="clues-section">
                    <div class="clues-title">Horizontales</div>
                    <div id="acrossClues"></div>
                </div>
                <div class="clues-section">
                    <div class="clues-title">Verticales</div>
                    <div id="downClues"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const words = ${JSON.stringify(words)};
        const gridSize = ${config.gridSize};

        function initCrossword() {
            renderGrid();
            renderClues();
        }

        function renderGrid() {
            const grid = document.getElementById('crosswordGrid');
            grid.innerHTML = '';
            
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    const cell = document.createElement('div');
                    cell.className = 'crossword-cell';
                    
                    // Verificar si esta celda es parte de alguna palabra
                    const isPartOfWord = words.some(wordData => {
                        if (wordData.direction === 'across') {
                            return row === wordData.row && col >= wordData.col && col < wordData.col + wordData.word.length;
                        } else {
                            return col === wordData.col && row >= wordData.row && row < wordData.row + wordData.word.length;
                        }
                    });
                    
                    if (isPartOfWord) {
                        const input = document.createElement('input');
                        input.maxLength = 1;
                        input.dataset.row = row;
                        input.dataset.col = col;
                        cell.appendChild(input);
                    } else {
                        cell.classList.add('black');
                    }
                    
                    grid.appendChild(cell);
                }
            }
        }

        function renderClues() {
            const acrossClues = document.getElementById('acrossClues');
            const downClues = document.getElementById('downClues');
            
            words.forEach((wordData, index) => {
                const clueElement = document.createElement('div');
                clueElement.className = 'clue-item';
                clueElement.textContent = \`\${index + 1}. \${wordData.clue}\`;
                
                if (wordData.direction === 'across') {
                    acrossClues.appendChild(clueElement);
                } else {
                    downClues.appendChild(clueElement);
                }
            });
        }

        document.addEventListener('DOMContentLoaded', initCrossword);
    </script>
</body>
</html>`;
  },

  createGameMetadata(gameContext, words) {
    const { subtopic } = gameContext;
    return {
      title: `Crucigrama: ${subtopic.name}`,
      description: `Completa este crucigrama con términos relacionados a ${subtopic.name}.`,
      instructions: `Lee las pistas y completa las palabras en el crucigrama. Las palabras se cruzan entre sí.`
    };
  }
};

export default crosswordAgent;
