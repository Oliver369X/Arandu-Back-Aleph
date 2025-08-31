import { PrismaClient } from '@prisma/client';
import { wordSearchAgent } from './specialized/wordSearchAgent.js';
import { quizAgent } from './specialized/quizAgent.js';
import { memoryAgent } from './specialized/memoryAgent.js';
import { puzzleAgent } from './specialized/puzzleAgent.js';
import { crosswordAgent } from './specialized/crosswordAgent.js';
import { matchingAgent } from './specialized/matchingAgent.js';
import { threejsAgent } from './free/threejsAgent.js';
import { pixijsAgent } from './free/pixijsAgent.js';
import { adaptiveAgent } from './free/adaptiveAgent.js';

const prisma = new PrismaClient();

// Mapeo de tipos de juego a agentes especializados
const SPECIALIZED_AGENTS = {
  'wordsearch': wordSearchAgent,
  'quiz': quizAgent,
  'memory': memoryAgent,
  'puzzle': puzzleAgent,
  'crossword': crosswordAgent,
  'matching': matchingAgent
};

// Agentes libres para casos más complejos
const FREE_AGENTS = {
  'threejs': threejsAgent,
  'pixijs': pixijsAgent,
  'adaptive': adaptiveAgent
};

// Todos los agentes combinados
const ALL_AGENTS = { ...SPECIALIZED_AGENTS, ...FREE_AGENTS };

/**
 * Genera un juego usando IA basado en el subtopic y tipo de juego
 * @param {string} subtopicId - ID del subtopic
 * @param {string} gameType - Tipo de juego (opcional, si no se especifica usa agente adaptativo)
 * @param {object} options - Opciones adicionales (difficulty, customPrompt, etc.)
 * @returns {object} Resultado de la generación
 */
export const generateGameWithAI = async (subtopicId, gameType = null, options = {}) => {
  try {
    console.log(`🎮 [GameAgentManager] Iniciando generación de juego para subtopic: ${subtopicId}`);
    
    // 1. Obtener información del subtopic
    const subtopic = await getSubtopicInfo(subtopicId);
    if (!subtopic) {
      return {
        success: false,
        error: 'Subtopic no encontrado',
        code: 'SUBTOPIC_NOT_FOUND'
      };
    }

    // 2. Determinar qué agente usar
    let selectedAgent;
    let agentType;
    
    if (gameType && ALL_AGENTS[gameType]) {
      // Usar agente específico solicitado
      selectedAgent = ALL_AGENTS[gameType];
      agentType = SPECIALIZED_AGENTS[gameType] ? 'specialized' : 'free';
      console.log(`🤖 [GameAgentManager] Usando agente específico: ${gameType} (${agentType})`);
    } else {
      // Usar agente adaptativo para determinar el mejor tipo de juego
      selectedAgent = adaptiveAgent;
      agentType = 'free';
      console.log(`🤖 [GameAgentManager] Usando agente adaptativo para determinar mejor juego`);
    }

    // 3. Preparar contexto para el agente
    const gameContext = {
      subtopic: {
        id: subtopic.id,
        name: subtopic.name,
        description: subtopic.description,
        subject: subtopic.subject
      },
      options: {
        difficulty: options.difficulty || 'medium',
        customPrompt: options.customPrompt,
        focus: options.focus,
        targetAge: options.targetAge,
        language: options.language || 'es'
      }
    };

    // 4. Generar el juego usando el agente seleccionado
    console.log(`🔄 [GameAgentManager] Generando juego con agente...`);
    const gameResult = await selectedAgent.generateGame(gameContext);

    if (!gameResult.success) {
      console.error(`❌ [GameAgentManager] Error en generación:`, gameResult.error);
      return gameResult;
    }

    // 5. Validar el resultado
    const validationResult = validateGameResult(gameResult);
    if (!validationResult.isValid) {
      console.error(`❌ [GameAgentManager] Validación falló:`, validationResult.errors);
      return {
        success: false,
        error: 'El juego generado no cumple con los requisitos mínimos',
        code: 'VALIDATION_FAILED',
        details: validationResult.errors
      };
    }

    // 6. Retornar resultado exitoso
    console.log(`✅ [GameAgentManager] Juego generado exitosamente: ${gameResult.title}`);
    return {
      success: true,
      agentType,
      gameType: gameResult.gameType || gameType,
      title: gameResult.title,
      description: gameResult.description,
      instructions: gameResult.instructions,
      htmlContent: gameResult.htmlContent,
      estimatedTime: gameResult.estimatedTime,
      tokensUsed: gameResult.tokensUsed || 0
    };

  } catch (error) {
    console.error(`❌ [GameAgentManager] Error general:`, error);
    return {
      success: false,
      error: 'Error interno en la generación del juego',
      code: 'INTERNAL_ERROR',
      details: error.message
    };
  }
};

/**
 * Obtiene información completa del subtopic
 */
async function getSubtopicInfo(subtopicId) {
  try {
    const subtopic = await prisma.subtopic.findUnique({
      where: { id: subtopicId },
      include: {
        subject: true
      }
    });
    return subtopic;
  } catch (error) {
    console.error('Error al obtener subtopic:', error);
    return null;
  }
}

/**
 * Valida que el resultado del juego tenga todos los campos requeridos
 */
function validateGameResult(gameResult) {
  const errors = [];
  
  // Campos requeridos
  const requiredFields = ['title', 'description', 'instructions', 'htmlContent'];
  
  for (const field of requiredFields) {
    if (!gameResult[field] || gameResult[field].trim().length === 0) {
      errors.push(`Campo requerido faltante: ${field}`);
    }
  }

  // Validaciones específicas
  if (gameResult.title && gameResult.title.length > 200) {
    errors.push('El título excede 200 caracteres');
  }

  if (gameResult.htmlContent && gameResult.htmlContent.length < 100) {
    errors.push('El contenido HTML es demasiado corto');
  }

  if (gameResult.instructions && gameResult.instructions.length < 10) {
    errors.push('Las instrucciones son demasiado cortas');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Obtiene lista de tipos de juegos disponibles
 */
export const getAvailableGameTypes = () => {
  return {
    specialized: Object.keys(SPECIALIZED_AGENTS),
    free: Object.keys(FREE_AGENTS),
    all: Object.keys(ALL_AGENTS)
  };
};

/**
 * Obtiene información sobre un agente específico
 */
export const getAgentInfo = (gameType) => {
  const agent = ALL_AGENTS[gameType];
  if (!agent) {
    return null;
  }

  return {
    name: agent.name || gameType,
    description: agent.description || 'Agente especializado en generar juegos educativos',
    type: SPECIALIZED_AGENTS[gameType] ? 'specialized' : 'free',
    capabilities: agent.capabilities || [],
    estimatedTime: agent.estimatedTime || '5-10 minutos'
  };
};

