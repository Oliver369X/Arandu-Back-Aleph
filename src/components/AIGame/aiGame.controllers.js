import {
  obtenerJuegos,
  obtenerJuegoPorId,
  obtenerJuegosPorSubtopic,
  obtenerJuegosPorTipo,
  crearJuego,
  actualizarJuego,
  eliminarJuego,
  incrementarContadorJuego,
  obtenerJuegosPopulares,
  obtenerEstadisticasJuegos
} from "./aiGame.models.js";
import { crearJuegoSchema, actualizarJuegoSchema } from "./dto/aiGame.dto.js";
import { generateGameWithAI } from "./agents/gameAgentManager.js";

export const getJuegos = async (req, res) => {
  try {
    const juegos = await obtenerJuegos();
    res.status(200).json(juegos);
  } catch (error) {
    console.error('Error al obtener juegos:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getJuegoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const juego = await obtenerJuegoPorId(id);
    if (!juego) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    res.status(200).json(juego);
  } catch (error) {
    console.error('Error al obtener juego:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getJuegosPorSubtopic = async (req, res) => {
  const { subtopicId } = req.params;
  try {
    const juegos = await obtenerJuegosPorSubtopic(subtopicId);
    res.status(200).json(juegos);
  } catch (error) {
    console.error('Error al obtener juegos por subtopic:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getJuegosPorTipo = async (req, res) => {
  const { gameType } = req.params;
  try {
    const juegos = await obtenerJuegosPorTipo(gameType);
    res.status(200).json(juegos);
  } catch (error) {
    console.error('Error al obtener juegos por tipo:', error);
    res.status(500).json({ error: error.message });
  }
};

export const postJuego = async (req, res) => {
  try {
    const datos = crearJuegoSchema.parse(req.body);
    const nuevoJuego = await crearJuego(datos);

    res.status(201).json({
      success: true,
      message: 'Juego creado con éxito!',
      data: nuevoJuego
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Datos inválidos', 
        errores: error.errors 
      });
    }

    console.error('Error al crear juego:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al crear el juego' 
    });
  }
};

export const putJuego = async (req, res) => {
  try {
    const datos = actualizarJuegoSchema.parse(req.body);
    const juegoActualizado = await actualizarJuego(datos);

    res.status(200).json({
      success: true,
      message: 'Juego actualizado con éxito!',
      data: juegoActualizado
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Datos inválidos', 
        errores: error.errors 
      });
    }

    console.error('Error al actualizar juego:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar el juego' 
    });
  }
};

export const deleteJuego = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await eliminarJuego(id);
    res.status(200).json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error al eliminar juego:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const playJuego = async (req, res) => {
  const { id } = req.params;
  try {
    const juego = await obtenerJuegoPorId(id);
    if (!juego) {
      return res.status(404).json({ 
        success: false, 
        message: "Juego no encontrado" 
      });
    }

    // Incrementar contador de jugadas
    await incrementarContadorJuego(id);

    // Retornar el HTML del juego
    res.status(200).json({
      success: true,
      data: {
        id: juego.id,
        title: juego.title,
        description: juego.description,
        instructions: juego.instructions,
        htmlContent: juego.htmlContent,
        difficulty: juego.difficulty,
        estimatedTime: juego.estimatedTime,
        subtopic: juego.subtopic
      }
    });
  } catch (error) {
    console.error('Error al obtener juego para jugar:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getJuegosPopulares = async (req, res) => {
  const { limit = 10 } = req.query;
  try {
    const juegos = await obtenerJuegosPopulares(parseInt(limit));
    res.status(200).json({
      success: true,
      data: juegos
    });
  } catch (error) {
    console.error('Error al obtener juegos populares:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getEstadisticasJuegos = async (req, res) => {
  try {
    const estadisticas = await obtenerEstadisticasJuegos();
    res.status(200).json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== AI GAME GENERATION ====================

export const generateJuegoConIA = async (req, res) => {
  const { subtopicId } = req.params;
  const { gameType, difficulty = 'medium', customPrompt } = req.body;

  try {
    console.log(`🎮 Generando juego con IA para subtopic: ${subtopicId}, tipo: ${gameType}`);

    // Generar juego usando el sistema de agentes
    const juegoGenerado = await generateGameWithAI(subtopicId, gameType, {
      difficulty,
      customPrompt
    });

    if (!juegoGenerado.success) {
      return res.status(400).json({
        success: false,
        error: juegoGenerado.error,
        code: juegoGenerado.code
      });
    }

    // Guardar el juego generado en la base de datos
    const nuevoJuego = await crearJuego({
      subtopicId,
      gameType,
      agentType: juegoGenerado.agentType,
      title: juegoGenerado.title,
      description: juegoGenerado.description,
      instructions: juegoGenerado.instructions,
      htmlContent: juegoGenerado.htmlContent,
      difficulty,
      estimatedTime: juegoGenerado.estimatedTime || 10
    });

    res.status(201).json({
      success: true,
      message: 'Juego generado con IA exitosamente',
      data: {
        game: nuevoJuego,
        generationInfo: {
          agentUsed: juegoGenerado.agentType,
          tokensUsed: juegoGenerado.tokensUsed,
          generatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error al generar juego con IA:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno al generar el juego',
      details: error.message
    });
  }
};

