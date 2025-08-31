import {
  registrarUsuarios,
  cambiarContrasena,
  contrasenaActual,
  validarUsuariosExistentes,
  obtenerUsuarios,
  updateUsuario,
  deleteUser,
  obtenerUsuariosById,
  obtenerUsuarioPorSuCorreo,
  asignarRolUsuario,
  removerRolUsuario
} from "./user.models.js";
import bcrypt from "bcrypt";
import { registrarUsuarioSchema } from "./dto/userCreate.dto.js";
import { actualizarUsuarioSchema } from "./dto/usuario.update.dto.js";
import { asignarRolSchema, removerRolSchema } from "./dto/role.dto.js";

export const getUsuariosById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await obtenerUsuariosById(id);
    if (!response) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsuariosByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const response = await obtenerUsuarioPorSuCorreo(email);
    if (!response) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsuarios = async (req, res) => {
  try {
    const response = await obtenerUsuarios();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const postUsuario = async (req, res) => {
  try {
    // 👉 Validar usando Zod
    const datos = registrarUsuarioSchema.parse(req.body);

    const contrasenaHash = await encryptarContrasena(datos.password);
    datos.password = contrasenaHash;
    datos.name = datos.name.toLowerCase().trim();
    
    const nuevoUsuario = await registrarUsuarios(datos);

    // Formatear la respuesta para el frontend
    const userResponse = {
      id: nuevoUsuario.id,
      name: nuevoUsuario.name,
      email: nuevoUsuario.email,
      image: nuevoUsuario.image,
      bio: nuevoUsuario.bio,
      roles: nuevoUsuario.userRoles?.map(ur => ur.role.name) || [],
      createdAt: nuevoUsuario.createdAt,
      updatedAt: nuevoUsuario.updatedAt
    };

    res.json({
      success: true,
      message: 'Usuario registrado con éxito!',
      data: userResponse
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Datos inválidos', errores: error.errors });
    }

    if (error.code === 'EMAIL_ALREADY_EXISTS') {
      return res.status(400).json({ success: false, error: 'El email ya está registrado. Por favor usa otro email.' });
    }

    if (error.code === 'ROLE_NOT_FOUND') {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Manejar error de foreign key constraint (rol no válido)
    if (error.code === 'P2003' && error.meta?.constraint === 'user_roles_roleId_fkey') {
      return res.status(400).json({ 
        success: false, 
        error: 'El rol seleccionado no es válido. Por favor selecciona un rol válido.' 
      });
    }

    console.error('Error al registrar usuario:', error);
    res.status(500).json({ success: false, error: 'Error al registrar el usuario' });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const datos = actualizarUsuarioSchema.parse(req.body);

    if (datos.name) {
      datos.name = datos.name.toLowerCase().trim();
    }

    if (datos.password) {
      datos.password = await encryptarContrasena(datos.password);
    }

    const usuarioActualizado = await updateUsuario(datos);

    res.status(200).json({
      message: 'Usuario actualizado con éxito!',
      ...usuarioActualizado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error('Error al actualizar usuario:', error);
    res.status(500).send({ error: 'Error al actualizar el usuario' });
  }
};

export const eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
      const response = await deleteUser(id);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export const patchContrasena = async (req, res) => {
  try {
    const { id, antiguacontrasena, nuevacontrasena } = req.body;

    if (!(await validarUsuariosExistentes(id))) {
      res.status(403).send(`El usuario con el id : ${id} no existe`);
      return;
    }
    const match = await bcrypt.compare(
      antiguacontrasena,
      await contrasenaActual(id)
    );
    if (match) {
      await cambiarContrasena(id, await encryptarContrasena(nuevacontrasena));
      res.status(200).send("La contrasena ha sido actualizada");
    } else {
      res.status(403).send("Las contrasenas no coinciden");
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const encryptarContrasena = async (contrasena) => {
  const salt = await bcrypt.genSalt(5);
  const newHash = await bcrypt.hash(contrasena, salt);
  return newHash;
};

export const renovarToken = async (req, res) => {
  return res.status(200).json({ message: "Token renovado con exito!" });
};

export const asignarRol = async (req, res) => {
  try {
    const datos = asignarRolSchema.parse(req.body);
    const response = await asignarRolUsuario(datos.userId, datos.roleId);
    res.status(200).json({
      message: 'Rol asignado exitosamente',
      ...response
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }
    console.error('Error al asignar rol:', error);
    res.status(500).json({ error: error.message });
  }
};

export const removerRol = async (req, res) => {
  try {
    const datos = removerRolSchema.parse(req.body);
    const response = await removerRolUsuario(datos.userId, datos.roleId);
    res.status(200).json(response);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }
    console.error('Error al remover rol:', error);
    res.status(500).json({ error: error.message });
  }
};




