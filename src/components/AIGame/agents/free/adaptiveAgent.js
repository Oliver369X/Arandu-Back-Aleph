import { wordSearchAgent } from '../specialized/wordSearchAgent.js';
import { quizAgent } from '../specialized/quizAgent.js';
import { memoryAgent } from '../specialized/memoryAgent.js';
import { puzzleAgent } from '../specialized/puzzleAgent.js';
import { crosswordAgent } from '../specialized/crosswordAgent.js';
import { matchingAgent } from '../specialized/matchingAgent.js';
import { threejsAgent } from './threejsAgent.js';
import { pixijsAgent } from './pixijsAgent.js';

export const adaptiveAgent = {
  name: 'Agente Adaptativo Inteligente',
  description: 'Analiza el tema y selecciona automáticamente el mejor tipo de juego educativo',
  type: 'free',
  gameType: 'adaptive',
  capabilities: [
    'Análisis de contenido educativo',
    'Selección inteligente de juego',
    'Adaptación automática',
    'Optimización pedagógica'
  ],
  estimatedTime: '5-15 minutos (variable)',

  /**
   * Genera un juego adaptativo analizando el contexto educativo
   */
  async generateGame(gameContext) {
    try {
      console.log(`🧠 [AdaptiveAgent] Analizando tema para selección inteligente: ${gameContext.subtopic.name}`);

      // 1. Analizar el contexto educativo
      const analysis = await this.analyzeEducationalContext(gameContext);
      
      // 2. Seleccionar el mejor tipo de juego
      const selectedGameType = this.selectOptimalGameType(analysis);
      
      // 3. Obtener el agente especializado
      const selectedAgent = this.getAgentByType(selectedGameType);
      
      if (!selectedAgent) {
        return {
          success: false,
          error: `No se encontró agente para el tipo: ${selectedGameType}`,
          code: 'AGENT_NOT_FOUND'
        };
      }

      console.log(`🎯 [AdaptiveAgent] Tipo de juego seleccionado: ${selectedGameType}`);
      
      // 4. Generar el juego usando el agente seleccionado
      const gameResult = await selectedAgent.generateGame(gameContext);
      
      if (!gameResult.success) {
        // Si falla, intentar con un tipo de juego alternativo
        const fallbackType = this.getFallbackGameType(analysis);
        const fallbackAgent = this.getAgentByType(fallbackType);
        
        if (fallbackAgent) {
          console.log(`🔄 [AdaptiveAgent] Intentando con tipo alternativo: ${fallbackType}`);
          const fallbackResult = await fallbackAgent.generateGame(gameContext);
          
          if (fallbackResult.success) {
            return {
              ...fallbackResult,
              adaptiveInfo: {
                originalChoice: selectedGameType,
                finalChoice: fallbackType,
                reason: 'Fallback debido a error en primera opción',
                analysis: analysis
              }
            };
          }
        }
        
        return gameResult;
      }

      // 5. Agregar información adaptativa al resultado
      return {
        ...gameResult,
        adaptiveInfo: {
          selectedGameType: selectedGameType,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          analysis: analysis
        }
      };

    } catch (error) {
      console.error(`❌ [AdaptiveAgent] Error:`, error);
      return {
        success: false,
        error: 'Error interno en el agente adaptativo',
        code: 'ADAPTIVE_ERROR',
        details: error.message
      };
    }
  },

  /**
   * Analiza el contexto educativo para determinar características del tema
   */
  async analyzeEducationalContext(gameContext) {
    const { subtopic, options } = gameContext;
    
    const analysis = {
      topicName: subtopic.name.toLowerCase(),
      subjectName: subtopic.subject?.name?.toLowerCase() || '',
      description: subtopic.description?.toLowerCase() || '',
      difficulty: options.difficulty || 'medium',
      characteristics: {
        isVisual: false,
        isConceptual: false,
        isInteractive: false,
        isMemoryBased: false,
        isLogical: false,
        isTechnical: false,
        isCreative: false
      },
      keywords: [],
      confidence: 0,
      reasoning: ''
    };

    // Extraer palabras clave
    const allText = `${analysis.topicName} ${analysis.subjectName} ${analysis.description}`;
    analysis.keywords = this.extractKeywords(allText);

    // Analizar características del tema
    this.analyzeTopicCharacteristics(analysis);

    // Calcular confianza y razonamiento
    this.calculateConfidenceAndReasoning(analysis);

    return analysis;
  },

  /**
   * Extrae palabras clave del texto
   */
  extractKeywords(text) {
    const keywords = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .map(word => word.toLowerCase());
    
    return [...new Set(keywords)]; // Eliminar duplicados
  },

  /**
   * Analiza las características del tema
   */
  analyzeTopicCharacteristics(analysis) {
    const { keywords, topicName, subjectName } = analysis;
    const allTerms = [...keywords, topicName, subjectName];

    // Términos que indican diferentes características
    const patterns = {
      visual: ['imagen', 'gráfico', 'visual', 'color', 'forma', 'diseño', 'arte', 'dibujo'],
      conceptual: ['concepto', 'teoría', 'principio', 'definición', 'idea', 'noción', 'fundamento'],
      interactive: ['interactivo', 'juego', 'simulación', 'práctica', 'ejercicio', 'actividad'],
      memoryBased: ['memoria', 'recordar', 'memorizar', 'aprender', 'vocabulario', 'términos'],
      logical: ['lógica', 'razonamiento', 'problema', 'solución', 'algoritmo', 'matemática', 'cálculo'],
      technical: ['técnico', 'tecnología', 'programación', 'código', 'sistema', 'blockchain', 'avalanche'],
      creative: ['creativo', 'crear', 'diseñar', 'innovar', 'arte', 'música', 'escritura']
    };

    // Contar coincidencias para cada característica
    Object.keys(patterns).forEach(characteristic => {
      const matches = patterns[characteristic].filter(pattern => 
        allTerms.some(term => term.includes(pattern))
      );
      
      analysis.characteristics[characteristic] = matches.length > 0;
    });

    // Análisis específico por materia
    if (subjectName.includes('blockchain') || topicName.includes('blockchain')) {
      analysis.characteristics.technical = true;
      analysis.characteristics.conceptual = true;
    }

    if (subjectName.includes('avalanche') || topicName.includes('avalanche')) {
      analysis.characteristics.technical = true;
      analysis.characteristics.interactive = true;
    }

    if (subjectName.includes('matemática') || subjectName.includes('math')) {
      analysis.characteristics.logical = true;
      analysis.characteristics.conceptual = true;
    }

    if (subjectName.includes('historia') || subjectName.includes('history')) {
      analysis.characteristics.memoryBased = true;
      analysis.characteristics.conceptual = true;
    }
  },

  /**
   * Calcula la confianza y el razonamiento de la selección
   */
  calculateConfidenceAndReasoning(analysis) {
    const { characteristics } = analysis;
    
    // Contar características activas
    const activeCharacteristics = Object.keys(characteristics).filter(
      key => characteristics[key]
    );

    // Calcular confianza basada en la cantidad de características identificadas
    analysis.confidence = Math.min(0.9, activeCharacteristics.length * 0.15 + 0.3);

    // Generar razonamiento
    if (activeCharacteristics.length > 0) {
      analysis.reasoning = `Tema identificado como: ${activeCharacteristics.join(', ')}. `;
    } else {
      analysis.reasoning = 'Tema general sin características específicas identificadas. ';
    }
  },

  /**
   * Selecciona el tipo de juego óptimo basado en el análisis
   */
  selectOptimalGameType(analysis) {
    const { characteristics, difficulty, topicName, subjectName } = analysis;

    // Reglas de selección basadas en características
    
    // Si es muy técnico y complejo, usar visualización 3D
    if (characteristics.technical && characteristics.interactive && difficulty === 'hard') {
      return 'threejs';
    }

    // Si es visual e interactivo, usar Pixi.js
    if (characteristics.visual && characteristics.interactive) {
      return 'pixijs';
    }

    // Si es conceptual y lógico, usar quiz
    if (characteristics.conceptual && characteristics.logical) {
      return 'quiz';
    }

    // Si es basado en memoria, usar juego de memoria o sopa de letras
    if (characteristics.memoryBased) {
      return Math.random() > 0.5 ? 'memory' : 'wordsearch';
    }

    // Si es técnico pero no muy complejo, usar matching
    if (characteristics.technical && !characteristics.interactive) {
      return 'matching';
    }

    // Si es creativo, usar puzzle
    if (characteristics.creative) {
      return 'puzzle';
    }

    // Selección específica por materia
    if (subjectName.includes('blockchain') || topicName.includes('blockchain')) {
      return difficulty === 'hard' ? 'threejs' : 'quiz';
    }

    if (subjectName.includes('avalanche') || topicName.includes('avalanche')) {
      return difficulty === 'easy' ? 'matching' : 'pixijs';
    }

    // Selección por dificultad como fallback
    switch (difficulty) {
      case 'easy':
        return 'wordsearch';
      case 'medium':
        return 'quiz';
      case 'hard':
        return 'crossword';
      default:
        return 'quiz';
    }
  },

  /**
   * Obtiene un tipo de juego alternativo si el principal falla
   */
  getFallbackGameType(analysis) {
    const { difficulty } = analysis;
    
    // Tipos de juego ordenados por confiabilidad
    const fallbackOrder = {
      easy: ['wordsearch', 'memory', 'matching'],
      medium: ['quiz', 'puzzle', 'wordsearch'],
      hard: ['crossword', 'quiz', 'matching']
    };

    const fallbacks = fallbackOrder[difficulty] || fallbackOrder.medium;
    return fallbacks[0];
  },

  /**
   * Obtiene el agente correspondiente al tipo de juego
   */
  getAgentByType(gameType) {
    const agents = {
      'wordsearch': wordSearchAgent,
      'quiz': quizAgent,
      'memory': memoryAgent,
      'puzzle': puzzleAgent,
      'crossword': crosswordAgent,
      'matching': matchingAgent,
      'threejs': threejsAgent,
      'pixijs': pixijsAgent
    };

    return agents[gameType] || null;
  },

  /**
   * Obtiene información sobre la selección adaptativa
   */
  getAdaptiveInfo(gameContext) {
    return {
      name: this.name,
      description: this.description,
      capabilities: this.capabilities,
      supportedGameTypes: [
        'wordsearch', 'quiz', 'memory', 'puzzle', 
        'crossword', 'matching', 'threejs', 'pixijs'
      ],
      selectionCriteria: [
        'Análisis de contenido temático',
        'Identificación de características educativas',
        'Adaptación por dificultad',
        'Optimización pedagógica'
      ]
    };
  }
};

export default adaptiveAgent;
