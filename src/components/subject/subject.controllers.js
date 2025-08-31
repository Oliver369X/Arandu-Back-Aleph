import {
  obtenerSubjects,
  crearSubject,
  actualizarSubject,
  eliminarSubject,
  obtenerSubjectPorId,
  obtenerSubjectPorNombre,
  obtenerSubjectsConSubtopics
} from "./subject.models.js";
import { crearSubjectSchema } from "./dto/subject.dto.js";
import { actualizarSubjectSchema } from "./dto/subject.update.dto.js";

export const getSubjects = async (req, res) => {
  try {
    const response = await obtenerSubjects();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getSubjectPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await obtenerSubjectPorId(id);
    if (!response) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubjectPorNombre = async (req, res) => {
  const { name } = req.params;
  try {
    const response = await obtenerSubjectPorNombre(name);
    if (!response) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postSubject = async (req, res) => {
  try {
    const datos = crearSubjectSchema.parse(req.body);
    
    const nuevoSubject = await crearSubject(datos);

    res.json({
      message: 'Subject created successfully!',
      ...nuevoSubject
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error(error);
    res.status(500).send({ error: 'Error creating subject' });
  }
};

export const putSubject = async (req, res) => {
  try {
    const datos = actualizarSubjectSchema.parse(req.body);

    const subjectActualizado = await actualizarSubject(datos);

    res.status(200).json({
      message: 'Subject updated successfully!',
      ...subjectActualizado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error('Error updating subject:', error);
    res.status(500).send({ error: 'Error updating subject' });
  }
};

export const deleteSubject = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await eliminarSubject(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubjectsConSubtopics = async (req, res) => {
  try {
    const response = await obtenerSubjectsConSubtopics();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
