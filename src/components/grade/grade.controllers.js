import {
  obtenerGrades,
  crearGrade,
  actualizarGrade,
  eliminarGrade,
  obtenerGradePorId,
  obtenerGradesPorYear
} from "./grade.models.js";
import { crearGradeSchema } from "./dto/grade.dto.js";
import { actualizarGradeSchema } from "./dto/grade.update.dto.js";

export const getGrades = async (req, res) => {
  try {
    const response = await obtenerGrades();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getGradePorId = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await obtenerGradePorId(id);
    if (!response) {
      return res.status(404).json({ message: "Grade not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGradesPorYear = async (req, res) => {
  const { year } = req.params;
  try {
    const response = await obtenerGradesPorYear(parseInt(year));
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postGrade = async (req, res) => {
  try {
    const datos = crearGradeSchema.parse(req.body);
    
    const nuevoGrade = await crearGrade(datos);

    res.json({
      message: 'Grade created successfully!',
      ...nuevoGrade
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error(error);
    res.status(500).send({ error: 'Error creating grade' });
  }
};

export const putGrade = async (req, res) => {
  try {
    const datos = actualizarGradeSchema.parse(req.body);

    const gradeActualizado = await actualizarGrade(datos);

    res.status(200).json({
      message: 'Grade updated successfully!',
      ...gradeActualizado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error('Error updating grade:', error);
    res.status(500).send({ error: 'Error updating grade' });
  }
};

export const deleteGrade = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await eliminarGrade(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
