import {
  obtenerRoles,
  crearRol,
  actualizarRol,
  eliminarRol,
  obtenerRolPorId,
  obtenerRolPorNombre,
  obtenerUsuariosConRol,
  obtenerRolesActivos,
  obtenerRolesPorPermisos
} from "./role.models.js";
import { crearRolSchema } from "./dto/role.dto.js";
import { actualizarRolSchema } from "./dto/role.update.dto.js";

export const getRoles = async (req, res) => {
  try {
    const response = await obtenerRoles();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getRolPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await obtenerRolPorId(id);
    if (!response) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRolPorNombre = async (req, res) => {
  const { name } = req.params;
  try {
    const response = await obtenerRolPorNombre(name);
    if (!response) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postRol = async (req, res) => {
  try {
    const datos = crearRolSchema.parse(req.body);
    
    const nuevoRol = await crearRol(datos);

    res.json({
      message: 'Rol creado con éxito!',
      ...nuevoRol
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error(error);
    res.status(500).send({ error: 'Error al crear el rol' });
  }
};

export const putRol = async (req, res) => {
  try {
    const datos = actualizarRolSchema.parse(req.body);

    const rolActualizado = await actualizarRol(datos);

    res.status(200).json({
      message: 'Rol actualizado con éxito!',
      ...rolActualizado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error('Error al actualizar rol:', error);
    res.status(500).send({ error: 'Error al actualizar el rol' });
  }
};

export const deleteRol = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await eliminarRol(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsuariosConRol = async (req, res) => {
  const { roleId } = req.params;
  try {
    const response = await obtenerUsuariosConRol(roleId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRolesActivos = async (req, res) => {
  try {
    const response = await obtenerRolesActivos();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRolesPorPermisos = async (req, res) => {
  const { permissions } = req.query;
  try {
    if (!permissions) {
      return res.status(400).json({ message: "Permisos requeridos" });
    }
    const response = await obtenerRolesPorPermisos(permissions);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 