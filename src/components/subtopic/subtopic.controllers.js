import {
  obtenerSubtopics,
  crearSubtopic,
  actualizarSubtopic,
  eliminarSubtopic,
  obtenerSubtopicPorId,
  obtenerSubtopicPorNombre,
  obtenerSubtopicsPorSubject,
  obtenerSubtopicsConProgress
} from "./subtopic.models.js";
import { crearSubtopicSchema } from "./dto/subtopic.dto.js";
import { actualizarSubtopicSchema } from "./dto/subtopic.update.dto.js";

export const getSubtopics = async (req, res) => {
  try {
    const response = await obtenerSubtopics();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getSubtopicPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await obtenerSubtopicPorId(id);
    if (!response) {
      return res.status(404).json({ message: "Subtopic not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubtopicPorNombre = async (req, res) => {
  const { name } = req.params;
  try {
    const response = await obtenerSubtopicPorNombre(name);
    if (!response) {
      return res.status(404).json({ message: "Subtopic not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubtopicsPorSubject = async (req, res) => {
  const { subjectId } = req.params;
  try {
    const response = await obtenerSubtopicsPorSubject(subjectId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postSubtopic = async (req, res) => {
  try {
    const datos = crearSubtopicSchema.parse(req.body);
    
    const nuevoSubtopic = await crearSubtopic(datos);

    res.json({
      message: 'Subtopic created successfully!',
      ...nuevoSubtopic
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error(error);
    res.status(500).send({ error: 'Error creating subtopic' });
  }
};

export const putSubtopic = async (req, res) => {
  try {
    const datos = actualizarSubtopicSchema.parse(req.body);

    const subtopicActualizado = await actualizarSubtopic(datos);

    res.status(200).json({
      message: 'Subtopic updated successfully!',
      ...subtopicActualizado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error('Error updating subtopic:', error);
    res.status(500).send({ error: 'Error updating subtopic' });
  }
};

export const deleteSubtopic = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await eliminarSubtopic(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubtopicsConProgress = async (req, res) => {
  try {
    const response = await obtenerSubtopicsConProgress();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
