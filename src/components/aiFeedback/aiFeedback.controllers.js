import {
  obtenerAIFeedbacks,
  crearAIFeedback,
  actualizarAIFeedback,
  eliminarAIFeedback,
  obtenerAIFeedbackPorId,
  obtenerAIFeedbacksPorSubtopic,
  obtenerAIFeedbacksPorStepNumber,
  obtenerAIFeedbacksCompletos
} from "./aiFeedback.models.js";
import { crearAIFeedbackSchema } from "./dto/aiFeedback.dto.js";
import { actualizarAIFeedbackSchema } from "./dto/aiFeedback.update.dto.js";

export const getAIFeedbacks = async (req, res) => {
  try {
    const response = await obtenerAIFeedbacks();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getAIFeedbackPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await obtenerAIFeedbackPorId(id);
    if (!response) {
      return res.status(404).json({ message: "AI Feedback not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAIFeedbacksPorSubtopic = async (req, res) => {
  const { subtopicId } = req.params;
  try {
    const response = await obtenerAIFeedbacksPorSubtopic(subtopicId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAIFeedbacksPorStepNumber = async (req, res) => {
  const { stepNumber } = req.params;
  try {
    const response = await obtenerAIFeedbacksPorStepNumber(parseInt(stepNumber));
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAIFeedbacksCompletos = async (req, res) => {
  try {
    const response = await obtenerAIFeedbacksCompletos();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postAIFeedback = async (req, res) => {
  try {
    const datos = crearAIFeedbackSchema.parse(req.body);
    
    const nuevoAIFeedback = await crearAIFeedback(datos);

    res.json({
      message: 'AI Feedback created successfully!',
      ...nuevoAIFeedback
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error(error);
    res.status(500).send({ error: 'Error creating AI Feedback' });
  }
};

export const putAIFeedback = async (req, res) => {
  try {
    const datos = actualizarAIFeedbackSchema.parse(req.body);

    const aiFeedbackActualizado = await actualizarAIFeedback(datos);

    res.status(200).json({
      message: 'AI Feedback updated successfully!',
      ...aiFeedbackActualizado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error('Error updating AI Feedback:', error);
    res.status(500).send({ error: 'Error updating AI Feedback' });
  }
};

export const deleteAIFeedback = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await eliminarAIFeedback(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
