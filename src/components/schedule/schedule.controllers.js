import {
  obtenerSchedules,
  crearSchedule,
  actualizarSchedule,
  eliminarSchedule,
  obtenerSchedulePorId,
  obtenerSchedulesPorAssignment,
  obtenerSchedulesPorDay,
  obtenerSchedulesPorQuarter
} from "./schedule.models.js";
import { crearScheduleSchema } from "./dto/schedule.dto.js";
import { actualizarScheduleSchema } from "./dto/schedule.update.dto.js";

export const getSchedules = async (req, res) => {
  try {
    const response = await obtenerSchedules();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getSchedulePorId = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await obtenerSchedulePorId(id);
    if (!response) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSchedulesPorAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  try {
    const response = await obtenerSchedulesPorAssignment(assignmentId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSchedulesPorDay = async (req, res) => {
  const { dayOfWeek } = req.params;
  try {
    const response = await obtenerSchedulesPorDay(dayOfWeek);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSchedulesPorQuarter = async (req, res) => {
  const { quarter } = req.params;
  try {
    const response = await obtenerSchedulesPorQuarter(quarter);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postSchedule = async (req, res) => {
  try {
    const datos = crearScheduleSchema.parse(req.body);
    
    const nuevoSchedule = await crearSchedule(datos);

    res.json({
      message: 'Schedule created successfully!',
      ...nuevoSchedule
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error(error);
    res.status(500).send({ error: 'Error creating schedule' });
  }
};

export const putSchedule = async (req, res) => {
  try {
    const datos = actualizarScheduleSchema.parse(req.body);

    const scheduleActualizado = await actualizarSchedule(datos);

    res.status(200).json({
      message: 'Schedule updated successfully!',
      ...scheduleActualizado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error('Error updating schedule:', error);
    res.status(500).send({ error: 'Error updating schedule' });
  }
};

export const deleteSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await eliminarSchedule(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
