import {
  obtenerClassAssignments,
  crearClassAssignment,
  actualizarClassAssignment,
  eliminarClassAssignment,
  obtenerClassAssignmentPorId,
  obtenerClassAssignmentsPorTeacher,
  obtenerClassAssignmentsPorGrade,
  obtenerClassAssignmentsPorSubject
} from "./classAssignment.models.js";
import { crearClassAssignmentSchema } from "./dto/classAssignment.dto.js";
import { actualizarClassAssignmentSchema } from "./dto/classAssignment.update.dto.js";

export const getClassAssignments = async (req, res) => {
  try {
    const response = await obtenerClassAssignments();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getClassAssignmentPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await obtenerClassAssignmentPorId(id);
    if (!response) {
      return res.status(404).json({ message: "Class assignment not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClassAssignmentsPorTeacher = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const response = await obtenerClassAssignmentsPorTeacher(teacherId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClassAssignmentsPorGrade = async (req, res) => {
  const { gradeId } = req.params;
  try {
    const response = await obtenerClassAssignmentsPorGrade(gradeId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClassAssignmentsPorSubject = async (req, res) => {
  const { subjectId } = req.params;
  try {
    const response = await obtenerClassAssignmentsPorSubject(subjectId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postClassAssignment = async (req, res) => {
  try {
    const datos = crearClassAssignmentSchema.parse(req.body);
    
    const nuevoClassAssignment = await crearClassAssignment(datos);

    res.json({
      message: 'Class assignment created successfully!',
      ...nuevoClassAssignment
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error(error);
    res.status(500).send({ error: 'Error creating class assignment' });
  }
};

export const putClassAssignment = async (req, res) => {
  try {
    const datos = actualizarClassAssignmentSchema.parse(req.body);

    const classAssignmentActualizado = await actualizarClassAssignment(datos);

    res.status(200).json({
      message: 'Class assignment updated successfully!',
      ...classAssignmentActualizado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error('Error updating class assignment:', error);
    res.status(500).send({ error: 'Error updating class assignment' });
  }
};

export const deleteClassAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await eliminarClassAssignment(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
