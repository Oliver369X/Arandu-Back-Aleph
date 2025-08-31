import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const wordSearchAgent = {
  name: 'Agente Sopa de Letras',
  description: 'Especialista en crear sopas de letras educativas adaptadas al tema',
  type: 'specialized',
  gameType: 'wordsearch',
  capabilities: [
    'Extracción de palabras clave del tema',
    'Generación de grillas de letras',
    'Colocación inteligente de palabras',
    'Adaptación por dificultad'
  ],
  estimatedTime: '3-5 minutos',

  /**
   * Genera una sopa de letras basada en el contexto educativo
   */
  async generateGame(gameContext) {
    try {
      console.log(`🔤 [WordSearchAgent] Generando sopa de letras para: ${gameContext.subtopic.name}`);

      // 1. Extraer palabras clave del tema
      const keywords = await this.extractKeywords(gameContext);
      
      if (keywords.length < 3) {
        return {
          success: false,
          error: 'No se pudieron extraer suficientes palabras clave del tema',
          code: 'INSUFFICIENT_KEYWORDS'
        };
      }

      // 2. Determinar configuración según dificultad
      const config = this.getGameConfig(gameContext.options.difficulty, keywords.length);

      // 3. Seleccionar palabras finales
      const selectedWords = keywords.slice(0, config.maxWords);

      // 4. Generar el HTML del juego
      const htmlContent = await this.generateHTML(gameContext, selectedWords, config);

      // 5. Crear título y descripción
      const gameData = this.createGameMetadata(gameContext, selectedWords);

      return {
        success: true,
        gameType: 'wordsearch',
        title: gameData.title,
        description: gameData.description,
        instructions: gameData.instructions,
        htmlContent: htmlContent,
        estimatedTime: config.estimatedTime,
        tokensUsed: 0 // No usa IA externa, es generación algorítmica
      };

    } catch (error) {
      console.error(`❌ [WordSearchAgent] Error:`, error);
      return {
        success: false,
        error: 'Error interno en la generación de sopa de letras',
        code: 'GENERATION_ERROR',
        details: error.message
      };
    }
  },

  /**
   * Extrae palabras clave relevantes del tema
   */
  async extractKeywords(gameContext) {
    const { subtopic, options } = gameContext;
    
    // Palabras base del tema
    let keywords = [];
    
    // Extraer del nombre del subtopic
    const topicWords = this.extractWordsFromText(subtopic.name);
    keywords.push(...topicWords);
    
    // Extraer de la descripción si existe
    if (subtopic.description) {
      const descWords = this.extractWordsFromText(subtopic.description);
      keywords.push(...descWords);
    }
    
    // Agregar palabras del subject
    if (subtopic.subject && subtopic.subject.name) {
      const subjectWords = this.extractWordsFromText(subtopic.subject.name);
      keywords.push(...subjectWords);
    }

    // Palabras temáticas por materia
    const thematicWords = this.getThematicWords(subtopic.subject?.name || '');
    keywords.push(...thematicWords);

    // Filtrar y limpiar palabras
    keywords = keywords
      .filter(word => word.length >= 3 && word.length <= 12) // Longitud apropiada
      .filter(word => /^[A-ZÁÉÍÓÚÑ]+$/i.test(word)) // Solo letras
      .map(word => word.toUpperCase())
      .filter((word, index, arr) => arr.indexOf(word) === index) // Únicos
      .slice(0, 15); // Máximo 15 palabras

    console.log(`🔍 [WordSearchAgent] Palabras extraídas:`, keywords);
    return keywords;
  },

  /**
   * Extrae palabras de un texto
   */
  extractWordsFromText(text) {
    return text
      .replace(/[^\w\sáéíóúñÁÉÍÓÚÑ]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3)
      .map(word => word.toUpperCase());
  },

  /**
   * Obtiene palabras temáticas según la materia
   */
  getThematicWords(subjectName) {
    const thematicSets = {
      'matemática': ['NUMERO', 'SUMA', 'RESTA', 'MULTIPLICAR', 'DIVIDIR', 'FRACCION', 'DECIMAL', 'GEOMETRIA', 'ALGEBRA'],
      'ciencias': ['CELULA', 'ATOMO', 'ENERGIA', 'FUERZA', 'MATERIA', 'ELEMENTO', 'REACCION', 'MOLECULA', 'ORGANISMO'],
      'historia': ['EPOCA', 'CULTURA', 'CIVILIZACION', 'GUERRA', 'PAZ', 'IMPERIO', 'REVOLUCION', 'SIGLO', 'DINASTIA'],
      'lengua': ['VERBO', 'SUSTANTIVO', 'ADJETIVO', 'ORACION', 'PARRAFO', 'TEXTO', 'LECTURA', 'ESCRITURA', 'GRAMATICA'],
      'blockchain': ['BITCOIN', 'ETHEREUM', 'SMART', 'CONTRACT', 'WALLET', 'MINING', 'HASH', 'BLOCK', 'CHAIN', 'TOKEN', 'DEFI', 'NFT'],
      'avalanche': ['AVALANCHE', 'SUBNET', 'CONSENSUS', 'VALIDATOR', 'STAKING', 'AVAX', 'CCHAIN', 'PCHAIN', 'XCHAIN']
    };

    const subject = subjectName.toLowerCase();
    for (const [key, words] of Object.entries(thematicSets)) {
      if (subject.includes(key)) {
        return words;
      }
    }
    
    return [];
  },

  /**
   * Configuración del juego según dificultad
   */
  getGameConfig(difficulty, availableWords) {
    const configs = {
      easy: {
        gridSize: 10,
        maxWords: Math.min(6, availableWords),
        estimatedTime: 8
      },
      medium: {
        gridSize: 12,
        maxWords: Math.min(8, availableWords),
        estimatedTime: 12
      },
      hard: {
        gridSize: 15,
        maxWords: Math.min(12, availableWords),
        estimatedTime: 18
      }
    };

    return configs[difficulty] || configs.medium;
  },

  /**
   * Genera el HTML completo del juego
   */
  async generateHTML(gameContext, words, config) {
    try {
      // Leer la plantilla
      const templatePath = path.join(__dirname, '../../examples/wordsearch-template.html');
      let template = fs.readFileSync(templatePath, 'utf8');

      // Crear metadata del juego
      const metadata = this.createGameMetadata(gameContext, words);

      // Reemplazar placeholders
      template = template
        .replace(/\{\{GAME_TITLE\}\}/g, metadata.title)
        .replace(/\{\{GAME_DESCRIPTION\}\}/g, metadata.description)
        .replace(/\{\{GAME_INSTRUCTIONS\}\}/g, metadata.instructions)
        .replace(/\{\{GRID_SIZE\}\}/g, config.gridSize)
        .replace(/\{\{TOTAL_WORDS\}\}/g, words.length)
        .replace(/\{\{WORDS_ARRAY\}\}/g, JSON.stringify(words));

      return template;

    } catch (error) {
      console.error('Error leyendo plantilla:', error);
      throw new Error('No se pudo cargar la plantilla de sopa de letras');
    }
  },

  /**
   * Crea los metadatos del juego
   */
  createGameMetadata(gameContext, words) {
    const { subtopic, options } = gameContext;
    
    return {
      title: `Sopa de Letras: ${subtopic.name}`,
      description: `Encuentra las ${words.length} palabras relacionadas con ${subtopic.name}. Las palabras pueden estar en cualquier dirección: horizontal, vertical o diagonal.`,
      instructions: `Arrastra el mouse para seleccionar las palabras ocultas en la grilla. Las palabras están relacionadas con el tema "${subtopic.name}" y pueden leerse en cualquier dirección.`
    };
  }
};

export default wordSearchAgent;
