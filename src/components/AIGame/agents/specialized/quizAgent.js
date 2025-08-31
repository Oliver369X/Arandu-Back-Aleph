import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const quizAgent = {
  name: 'Agente Quiz Educativo',
  description: 'Especialista en crear quizzes interactivos con preguntas de opción múltiple',
  type: 'specialized',
  gameType: 'quiz',
  capabilities: [
    'Generación de preguntas contextuales',
    'Creación de opciones múltiples',
    'Explicaciones educativas',
    'Adaptación por dificultad'
  ],
  estimatedTime: '4-7 minutos',

  /**
   * Genera un quiz basado en el contexto educativo
   */
  async generateGame(gameContext) {
    try {
      console.log(`❓ [QuizAgent] Generando quiz para: ${gameContext.subtopic.name}`);

      // 1. Generar preguntas según el tema
      const questions = await this.generateQuestions(gameContext);
      
      if (questions.length < 3) {
        return {
          success: false,
          error: 'No se pudieron generar suficientes preguntas para el tema',
          code: 'INSUFFICIENT_QUESTIONS'
        };
      }

      // 2. Configurar según dificultad
      const config = this.getGameConfig(gameContext.options.difficulty, questions.length);

      // 3. Seleccionar preguntas finales
      const selectedQuestions = questions.slice(0, config.maxQuestions);

      // 4. Generar el HTML del juego
      const htmlContent = await this.generateHTML(gameContext, selectedQuestions, config);

      // 5. Crear metadatos del juego
      const gameData = this.createGameMetadata(gameContext, selectedQuestions);

      return {
        success: true,
        gameType: 'quiz',
        title: gameData.title,
        description: gameData.description,
        instructions: gameData.instructions,
        htmlContent: htmlContent,
        estimatedTime: config.estimatedTime,
        tokensUsed: 0 // Generación algorítmica
      };

    } catch (error) {
      console.error(`❌ [QuizAgent] Error:`, error);
      return {
        success: false,
        error: 'Error interno en la generación del quiz',
        code: 'GENERATION_ERROR',
        details: error.message
      };
    }
  },

  /**
   * Genera preguntas basadas en el contexto
   */
  async generateQuestions(gameContext) {
    const { subtopic, options } = gameContext;
    let questions = [];

    // Obtener preguntas base según el tema
    const baseQuestions = this.getBaseQuestions(subtopic);
    questions.push(...baseQuestions);

    // Generar preguntas específicas del tema
    const thematicQuestions = this.generateThematicQuestions(subtopic);
    questions.push(...thematicQuestions);

    // Generar preguntas de definición
    const definitionQuestions = this.generateDefinitionQuestions(subtopic);
    questions.push(...definitionQuestions);

    // Mezclar y filtrar
    questions = this.shuffleArray(questions);
    
    console.log(`❓ [QuizAgent] Preguntas generadas: ${questions.length}`);
    return questions;
  },

  /**
   * Obtiene preguntas base según el tema
   */
  getBaseQuestions(subtopic) {
    const subjectName = subtopic.subject?.name?.toLowerCase() || '';
    const topicName = subtopic.name.toLowerCase();

    // Preguntas por materia - mejorado matching
    if (subjectName.includes('blockchain') || topicName.includes('blockchain')) {
      return this.getBlockchainQuestions(subtopic);
    }
    
    if (subjectName.includes('ethereum') || topicName.includes('ethereum') || 
        topicName.includes('etherium') || topicName.includes('eth')) {
      return this.getEthereumQuestions(subtopic);
    }
    
    if (subjectName.includes('avalanche') || topicName.includes('avalanche')) {
      return this.getAvalancheQuestions(subtopic);
    }

    if (subjectName.includes('matemática') || subjectName.includes('math')) {
      return this.getMathQuestions(subtopic);
    }

    if (subjectName.includes('ciencias') || subjectName.includes('science')) {
      return this.getScienceQuestions(subtopic);
    }

    // Preguntas generales
    return this.getGeneralQuestions(subtopic);
  },

  /**
   * Preguntas específicas de Blockchain
   */
  getBlockchainQuestions(subtopic) {
    return [
      {
        question: "¿Qué es una blockchain?",
        answers: [
          { text: "Una base de datos distribuida e inmutable", correct: true },
          { text: "Un tipo de criptomoneda", correct: false },
          { text: "Un programa de computadora", correct: false },
          { text: "Una red social descentralizada", correct: false }
        ],
        explanation: "Una blockchain es una base de datos distribuida que mantiene registros inmutables de transacciones."
      },
      {
        question: "¿Cuál es la principal característica de los smart contracts?",
        answers: [
          { text: "Se ejecutan automáticamente cuando se cumplen condiciones", correct: true },
          { text: "Solo pueden ser modificados por administradores", correct: false },
          { text: "Requieren intervención humana constante", correct: false },
          { text: "Solo funcionan con Bitcoin", correct: false }
        ],
        explanation: "Los smart contracts se ejecutan automáticamente cuando se cumplen las condiciones programadas."
      },
      {
        question: "¿Qué significa 'descentralizado' en blockchain?",
        answers: [
          { text: "No hay una autoridad central que controle la red", correct: true },
          { text: "Todos los datos están en un solo servidor", correct: false },
          { text: "Solo una empresa puede validar transacciones", correct: false },
          { text: "Las transacciones son privadas", correct: false }
        ],
        explanation: "Descentralizado significa que no existe una autoridad central, la red es mantenida por múltiples participantes."
      }
    ];
  },

  /**
   * Preguntas específicas de Ethereum
   */
  getEthereumQuestions(subtopic) {
    return [
      {
        question: "¿Qué es Ethereum?",
        answers: [
          { text: "Una plataforma blockchain que permite smart contracts", correct: true },
          { text: "Solo una criptomoneda como Bitcoin", correct: false },
          { text: "Un exchange centralizado", correct: false },
          { text: "Una empresa de tecnología", correct: false }
        ],
        explanation: "Ethereum es una plataforma blockchain descentralizada que permite ejecutar smart contracts y aplicaciones descentralizadas."
      },
      {
        question: "¿Cuál es el token nativo de Ethereum?",
        answers: [
          { text: "Ether (ETH)", correct: true },
          { text: "Bitcoin (BTC)", correct: false },
          { text: "USDC", correct: false },
          { text: "Ethereum Classic (ETC)", correct: false }
        ],
        explanation: "Ether (ETH) es la criptomoneda nativa de la red Ethereum, usada para pagar gas y transacciones."
      },
      {
        question: "¿Qué es el 'gas' en Ethereum?",
        answers: [
          { text: "El costo de ejecutar operaciones en la red", correct: true },
          { text: "Un tipo de combustible físico", correct: false },
          { text: "Una criptomoneda diferente", correct: false },
          { text: "Un protocolo de seguridad", correct: false }
        ],
        explanation: "Gas es la unidad que mide el trabajo computacional requerido para ejecutar operaciones en Ethereum."
      },
      {
        question: "¿Qué lenguaje se usa principalmente para smart contracts en Ethereum?",
        answers: [
          { text: "Solidity", correct: true },
          { text: "JavaScript", correct: false },
          { text: "Python", correct: false },
          { text: "Java", correct: false }
        ],
        explanation: "Solidity es el lenguaje de programación más popular para escribir smart contracts en Ethereum."
      },
      {
        question: "¿Qué es una DApp (Aplicación Descentralizada)?",
        answers: [
          { text: "Una aplicación que funciona en blockchain sin autoridad central", correct: true },
          { text: "Una aplicación móvil normal", correct: false },
          { text: "Un juego descargable", correct: false },
          { text: "Una página web estática", correct: false }
        ],
        explanation: "Las DApps son aplicaciones descentralizadas que funcionan en blockchain, sin control centralizado."
      }
    ];
  },

  /**
   * Preguntas específicas de Avalanche
   */
  getAvalancheQuestions(subtopic) {
    return [
      {
        question: "¿Cuál es el token nativo de Avalanche?",
        answers: [
          { text: "AVAX", correct: true },
          { text: "ETH", correct: false },
          { text: "BTC", correct: false },
          { text: "ADA", correct: false }
        ],
        explanation: "AVAX es el token nativo de la red Avalanche, usado para staking y fees."
      },
      {
        question: "¿Qué son las Subnets en Avalanche?",
        answers: [
          { text: "Redes personalizadas que pueden ejecutar sus propias reglas", correct: true },
          { text: "Wallets especiales para AVAX", correct: false },
          { text: "Contratos inteligentes predefinidos", correct: false },
          { text: "Exchanges descentralizados", correct: false }
        ],
        explanation: "Las Subnets permiten crear redes blockchain personalizadas con sus propias reglas y validadores."
      },
      {
        question: "¿Cuántas cadenas principales tiene Avalanche?",
        answers: [
          { text: "3 (X-Chain, P-Chain, C-Chain)", correct: true },
          { text: "1", correct: false },
          { text: "2", correct: false },
          { text: "5", correct: false }
        ],
        explanation: "Avalanche tiene 3 cadenas: X-Chain (intercambio), P-Chain (plataforma) y C-Chain (contratos)."
      }
    ];
  },

  /**
   * Preguntas generales adaptables
   */
  getGeneralQuestions(subtopic) {
    const topicName = subtopic.name;
    
    return [
      {
        question: `¿Cuál es el concepto principal de ${topicName}?`,
        answers: [
          { text: `${topicName} es un tema fundamental en esta materia`, correct: true },
          { text: "Es un concepto obsoleto", correct: false },
          { text: "No tiene aplicación práctica", correct: false },
          { text: "Solo se usa en teoría", correct: false }
        ],
        explanation: `${topicName} es un concepto importante que tiene aplicaciones prácticas en el área de estudio.`
      },
      {
        question: `¿Por qué es importante estudiar ${topicName}?`,
        answers: [
          { text: "Porque proporciona conocimientos fundamentales para la materia", correct: true },
          { text: "No es importante", correct: false },
          { text: "Solo para aprobar exámenes", correct: false },
          { text: "Es opcional en el currículo", correct: false }
        ],
        explanation: `Estudiar ${topicName} es fundamental para comprender conceptos más avanzados en la materia.`
      },
      {
        question: `¿Cuál es la aplicación práctica de ${topicName}?`,
        answers: [
          { text: "Tiene múltiples aplicaciones en el campo profesional", correct: true },
          { text: "Solo se usa en investigación académica", correct: false },
          { text: "No tiene aplicaciones reales", correct: false },
          { text: "Solo para estudiantes", correct: false }
        ],
        explanation: `${topicName} tiene aplicaciones prácticas importantes en el ámbito profesional y académico.`
      },
      {
        question: `¿Qué características definen a ${topicName}?`,
        answers: [
          { text: "Es un tema completo con múltiples aspectos interrelacionados", correct: true },
          { text: "Es un concepto simple y aislado", correct: false },
          { text: "No tiene estructura definida", correct: false },
          { text: "Solo tiene aspectos teóricos", correct: false }
        ],
        explanation: `${topicName} se caracteriza por ser un tema integral con múltiples dimensiones de estudio.`
      },
      {
        question: `¿Cómo se relaciona ${topicName} con otros temas?`,
        answers: [
          { text: "Está conectado con otros conceptos de la materia", correct: true },
          { text: "Es completamente independiente", correct: false },
          { text: "Solo se relaciona con temas básicos", correct: false },
          { text: "No tiene conexiones relevantes", correct: false }
        ],
        explanation: `${topicName} forma parte de un sistema interconectado de conocimientos en la materia.`
      }
    ];
  },

  /**
   * Genera preguntas temáticas específicas
   */
  generateThematicQuestions(subtopic) {
    // Esta función puede expandirse para generar preguntas más específicas
    // basadas en el análisis del contenido del subtopic
    return [];
  },

  /**
   * Genera preguntas de definición
   */
  generateDefinitionQuestions(subtopic) {
    // Generar preguntas sobre definiciones clave
    return [];
  },

  /**
   * Configuración del juego según dificultad
   */
  getGameConfig(difficulty, availableQuestions) {
    const configs = {
      easy: {
        maxQuestions: Math.min(5, availableQuestions),
        estimatedTime: 8
      },
      medium: {
        maxQuestions: Math.min(8, availableQuestions),
        estimatedTime: 12
      },
      hard: {
        maxQuestions: Math.min(12, availableQuestions),
        estimatedTime: 18
      }
    };

    return configs[difficulty] || configs.medium;
  },

  /**
   * Genera el HTML completo del juego
   */
  async generateHTML(gameContext, questions, config) {
    try {
      // Leer la plantilla
      const templatePath = path.join(__dirname, '../../examples/quiz-template.html');
      let template = fs.readFileSync(templatePath, 'utf8');

      // Crear metadata del juego
      const metadata = this.createGameMetadata(gameContext, questions);

      // Reemplazar placeholders
      template = template
        .replace(/\{\{GAME_TITLE\}\}/g, metadata.title)
        .replace(/\{\{GAME_DESCRIPTION\}\}/g, metadata.description)
        .replace(/\{\{TOTAL_QUESTIONS\}\}/g, questions.length)
        .replace(/\{\{QUIZ_DATA\}\}/g, JSON.stringify(questions));

      return template;

    } catch (error) {
      console.error('Error leyendo plantilla:', error);
      throw new Error('No se pudo cargar la plantilla de quiz');
    }
  },

  /**
   * Crea los metadatos del juego
   */
  createGameMetadata(gameContext, questions) {
    const { subtopic } = gameContext;
    
    return {
      title: `Quiz: ${subtopic.name}`,
      description: `Pon a prueba tus conocimientos sobre ${subtopic.name} con este quiz de ${questions.length} preguntas de opción múltiple.`,
      instructions: `Responde cada pregunta seleccionando la opción correcta. Recibirás retroalimentación inmediata y tu puntuación final al completar todas las preguntas.`
    };
  },

  /**
   * Mezcla un array aleatoriamente
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Preguntas de matemáticas
   */
  getMathQuestions(subtopic) {
    return [
      {
        question: "¿Cuál es el resultado de 2 + 2?",
        answers: [
          { text: "4", correct: true },
          { text: "3", correct: false },
          { text: "5", correct: false },
          { text: "22", correct: false }
        ],
        explanation: "2 + 2 = 4 es una operación básica de suma."
      }
    ];
  },

  /**
   * Preguntas de ciencias
   */
  getScienceQuestions(subtopic) {
    return [
      {
        question: "¿Cuál es la unidad básica de la vida?",
        answers: [
          { text: "La célula", correct: true },
          { text: "El átomo", correct: false },
          { text: "La molécula", correct: false },
          { text: "El tejido", correct: false }
        ],
        explanation: "La célula es la unidad estructural y funcional básica de todos los seres vivos."
      }
    ];
  }
};

export default quizAgent;
