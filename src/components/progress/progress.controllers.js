import {
  obtenerProgress,
  crearProgress,
  actualizarProgress,
  eliminarProgress,
  obtenerProgressPorId,
  obtenerProgressPorUsuario,
  obtenerProgressPorSubtopic,
  obtenerProgressPorTipo,
  obtenerProgressCompletado
} from "./progress.models.js";
import { crearProgressSchema } from "./dto/progress.dto.js";
import { actualizarProgressSchema } from "./dto/progress.update.dto.js";

export const getProgress = async (req, res) => {
  try {
    const response = await obtenerProgress();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getProgressPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await obtenerProgressPorId(id);
    if (!response) {
      return res.status(404).json({ message: "Progress not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgressPorUsuario = async (req, res) => {
  const { userId } = req.params;
  try {
    const response = await obtenerProgressPorUsuario(userId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgressPorSubtopic = async (req, res) => {
  const { subtopicId } = req.params;
  try {
    const response = await obtenerProgressPorSubtopic(subtopicId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgressPorTipo = async (req, res) => {
  const { progressType } = req.params;
  try {
    const response = await obtenerProgressPorTipo(progressType);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgressCompletado = async (req, res) => {
  try {
    const response = await obtenerProgressCompletado();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postProgress = async (req, res) => {
  try {
    const datos = crearProgressSchema.parse(req.body);
    
    const nuevoProgress = await crearProgress(datos);

    res.json({
      message: 'Progress created successfully!',
      ...nuevoProgress
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error(error);
    res.status(500).send({ error: 'Error creating progress' });
  }
};

export const putProgress = async (req, res) => {
  try {
    const datos = actualizarProgressSchema.parse(req.body);

    const progressActualizado = await actualizarProgress(datos);

    res.status(200).json({
      message: 'Progress updated successfully!',
      ...progressActualizado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error('Error updating progress:', error);
    res.status(500).send({ error: 'Error updating progress' });
  }
};

export const deleteProgress = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await eliminarProgress(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
