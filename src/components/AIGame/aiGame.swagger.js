/**
 * @swagger
 * components:
 *   schemas:
 *     AIGame:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del juego
 *         subtopicId:
 *           type: string
 *           format: uuid
 *           description: ID del subtopic asociado
 *         gameType:
 *           type: string
 *           enum: [wordsearch, quiz, memory, puzzle, crossword, matching, threejs, pixijs, adaptive]
 *           description: Tipo de juego educativo
 *         agentType:
 *           type: string
 *           enum: [specialized, free]
 *           description: Tipo de agente que generó el juego
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Título del juego
 *         description:
 *           type: string
 *           description: Descripción del juego
 *         instructions:
 *           type: string
 *           description: Instrucciones para jugar
 *         htmlContent:
 *           type: string
 *           description: Código HTML completo del juego
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Nivel de dificultad
 *         estimatedTime:
 *           type: integer
 *           minimum: 1
 *           maximum: 120
 *           description: Tiempo estimado de juego en minutos
 *         isActive:
 *           type: boolean
 *           description: Si el juego está activo
 *         playCount:
 *           type: integer
 *           description: Número de veces que se ha jugado
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         subtopic:
 *           $ref: '#/components/schemas/Subtopic'
 *       required:
 *         - subtopicId
 *         - gameType
 *         - agentType
 *         - title
 *         - description
 *         - instructions
 *         - htmlContent
 *         - difficulty
 *         - estimatedTime
 * 
 *     AIGameCreate:
 *       type: object
 *       properties:
 *         subtopicId:
 *           type: string
 *           format: uuid
 *           description: ID del subtopic
 *         gameType:
 *           type: string
 *           enum: [wordsearch, quiz, memory, puzzle, crossword, matching, threejs, pixijs, adaptive]
 *           description: Tipo de juego
 *         agentType:
 *           type: string
 *           enum: [specialized, free]
 *           description: Tipo de agente
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Título del juego
 *         description:
 *           type: string
 *           minLength: 10
 *           description: Descripción del juego
 *         instructions:
 *           type: string
 *           minLength: 5
 *           description: Instrucciones del juego
 *         htmlContent:
 *           type: string
 *           minLength: 100
 *           description: Código HTML del juego
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           default: medium
 *           description: Dificultad del juego
 *         estimatedTime:
 *           type: integer
 *           minimum: 1
 *           maximum: 120
 *           default: 10
 *           description: Tiempo estimado en minutos
 *       required:
 *         - subtopicId
 *         - gameType
 *         - agentType
 *         - title
 *         - description
 *         - instructions
 *         - htmlContent
 * 
 *     AIGameUpdate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID del juego a actualizar
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Nuevo título
 *         description:
 *           type: string
 *           minLength: 10
 *           description: Nueva descripción
 *         instructions:
 *           type: string
 *           minLength: 5
 *           description: Nuevas instrucciones
 *         htmlContent:
 *           type: string
 *           minLength: 100
 *           description: Nuevo código HTML
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Nueva dificultad
 *         estimatedTime:
 *           type: integer
 *           minimum: 1
 *           maximum: 120
 *           description: Nuevo tiempo estimado
 *         isActive:
 *           type: boolean
 *           description: Estado activo del juego
 *       required:
 *         - id
 * 
 *     GameGenerationRequest:
 *       type: object
 *       properties:
 *         gameType:
 *           type: string
 *           enum: [wordsearch, quiz, memory, puzzle, crossword, matching, threejs, pixijs, adaptive]
 *           description: Tipo de juego a generar (opcional para adaptive)
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           default: medium
 *           description: Dificultad del juego
 *         customPrompt:
 *           type: string
 *           maxLength: 1000
 *           description: Prompt personalizado para la generación
 *         focus:
 *           type: string
 *           maxLength: 200
 *           description: Enfoque específico del juego
 *         targetAge:
 *           type: string
 *           maxLength: 50
 *           description: Edad objetivo del juego
 *         language:
 *           type: string
 *           enum: [es, en]
 *           default: es
 *           description: Idioma del juego
 * 
 *     GameStatistics:
 *       type: object
 *       properties:
 *         totalJuegos:
 *           type: integer
 *           description: Total de juegos creados
 *         juegosPorTipo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               gameType:
 *                 type: string
 *               _count:
 *                 type: object
 *                 properties:
 *                   gameType:
 *                     type: integer
 *           description: Conteo de juegos por tipo
 *         totalJugadas:
 *           type: integer
 *           description: Total de veces que se han jugado todos los juegos
 */

/**
 * @swagger
 * /ai-games:
 *   get:
 *     summary: Obtener todos los juegos AI
 *     tags: [AI Games]
 *     responses:
 *       200:
 *         description: Lista de juegos AI
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AIGame'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 * 
 *   post:
 *     summary: Crear un nuevo juego AI
 *     tags: [AI Games]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIGameCreate'
 *           example:
 *             subtopicId: "550e8400-e29b-41d4-a716-446655440000"
 *             gameType: "quiz"
 *             agentType: "specialized"
 *             title: "Quiz: Blockchain Fundamentals"
 *             description: "Pon a prueba tus conocimientos sobre blockchain con este quiz interactivo"
 *             instructions: "Responde cada pregunta seleccionando la opción correcta"
 *             htmlContent: "<!DOCTYPE html><html>...</html>"
 *             difficulty: "medium"
 *             estimatedTime: 10
 *     responses:
 *       201:
 *         description: Juego creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AIGame'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                 errores:
 *                   type: array
 *                   items:
 *                     type: object
 * 
 *   put:
 *     summary: Actualizar un juego AI existente
 *     tags: [AI Games]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIGameUpdate'
 *     responses:
 *       200:
 *         description: Juego actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AIGame'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /ai-games/{id}:
 *   get:
 *     summary: Obtener un juego AI por ID
 *     tags: [AI Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del juego
 *     responses:
 *       200:
 *         description: Juego encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIGame'
 *       404:
 *         description: Juego no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 * 
 *   delete:
 *     summary: Eliminar un juego AI
 *     tags: [AI Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del juego a eliminar
 *     responses:
 *       200:
 *         description: Juego eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /ai-games/{id}/play:
 *   get:
 *     summary: Obtener juego para jugar (incrementa contador)
 *     tags: [AI Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del juego
 *     responses:
 *       200:
 *         description: Datos del juego para jugar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     instructions:
 *                       type: string
 *                     htmlContent:
 *                       type: string
 *                     difficulty:
 *                       type: string
 *                     estimatedTime:
 *                       type: integer
 *                     subtopic:
 *                       type: object
 *       404:
 *         description: Juego no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /ai-games/subtopic/{subtopicId}:
 *   get:
 *     summary: Obtener juegos por subtopic
 *     tags: [AI Games]
 *     parameters:
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del subtopic
 *     responses:
 *       200:
 *         description: Lista de juegos del subtopic
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AIGame'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /ai-games/tipo/{gameType}:
 *   get:
 *     summary: Obtener juegos por tipo
 *     tags: [AI Games]
 *     parameters:
 *       - in: path
 *         name: gameType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [wordsearch, quiz, memory, puzzle, crossword, matching, threejs, pixijs, adaptive]
 *         description: Tipo de juego
 *     responses:
 *       200:
 *         description: Lista de juegos del tipo especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AIGame'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /ai-games/populares:
 *   get:
 *     summary: Obtener juegos más populares
 *     tags: [AI Games]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Número máximo de juegos a retornar
 *     responses:
 *       200:
 *         description: Lista de juegos populares
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIGame'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /ai-games/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de juegos
 *     tags: [AI Games]
 *     responses:
 *       200:
 *         description: Estadísticas de juegos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GameStatistics'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /ai-games/generate/{subtopicId}:
 *   post:
 *     summary: Generar juego con IA
 *     tags: [AI Games]
 *     description: Genera automáticamente un juego educativo usando agentes de IA especializados
 *     parameters:
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del subtopic para el cual generar el juego
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameGenerationRequest'
 *           example:
 *             gameType: "quiz"
 *             difficulty: "medium"
 *             customPrompt: "Crear un quiz sobre conceptos básicos de blockchain"
 *             focus: "Conceptos fundamentales"
 *             targetAge: "18-25 años"
 *             language: "es"
 *     responses:
 *       201:
 *         description: Juego generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     game:
 *                       $ref: '#/components/schemas/AIGame'
 *                     generationInfo:
 *                       type: object
 *                       properties:
 *                         agentUsed:
 *                           type: string
 *                           description: Tipo de agente utilizado
 *                         tokensUsed:
 *                           type: integer
 *                           description: Tokens de IA utilizados
 *                         generatedAt:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha y hora de generación
 *       400:
 *         description: Error en la generación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                 details:
 *                   type: string
 */

/**
 * @swagger
 * tags:
 *   name: AI Games
 *   description: Endpoints para gestionar juegos educativos generados por IA
 */

export default {};
