import pkg from '@prisma/client';
const {PrismaClient} = pkg;
const prisma = new PrismaClient();

export const obtenerUsuarios = async () => {
  try {
    const usuarios = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    return usuarios;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const registrarUsuarios = async (datos) => {
  try {
    let { 
      name,
      email,
      password,
      image,
      bio,
      role
    } = datos;
    email=email.toLowerCase();
    
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      const error = new Error('El email ya está registrado');
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }
    
    // Crear el usuario
    const nuevoUsuario = await prisma.user.create({
      data: {
        name,
        email,
        password,
        image,
        bio
      }
    });

    // Si se proporciona un rol, asignarlo al usuario
    if (role) {
      console.log('🔍 [registrarUsuarios] Asignando rol:', { userId: nuevoUsuario.id, roleId: role });
      
      // 🚨 MAPEO DE ROLES EN EL BACKEND - SOLUCIÓN TEMPORAL
      const roleMapping = {
        'teacher': 'ee9f44dd-621d-4acd-ba7f-b51fba39de00',
        'student': '44f5da8f-4a10-4ef2-8657-ba5df72e0ef1',
        'admin': 'b14573f9-523b-49ff-bc16-ce026a1893c8',
        'institution': '55499a80-a71a-4962-a3df-c56ffd090f41'
      };
      
      // Si es un nombre de rol, convertir a ID
      let finalRoleId = role;
      if (roleMapping[role]) {
        finalRoleId = roleMapping[role];
        console.log('🔧 [registrarUsuarios] Mapeo de rol:', role, '→', finalRoleId);
      }
      
      // Verificar que el rol existe antes de asignarlo
      const roleExists = await prisma.role.findUnique({
        where: { id: finalRoleId }
      });
      
      if (!roleExists) {
        console.error('❌ [registrarUsuarios] Rol no encontrado:', finalRoleId);
        const error = new Error(`El rol con ID ${finalRoleId} no existe`);
        error.code = 'ROLE_NOT_FOUND';
        throw error;
      }
      
      console.log('✅ [registrarUsuarios] Rol encontrado:', roleExists.name);
      
      await prisma.userRole.create({
        data: {
          userId: nuevoUsuario.id,
          roleId: finalRoleId,
          assignedAt: new Date()
        }
      });
      
      console.log('✅ [registrarUsuarios] Rol asignado exitosamente');
    }

    // Retornar el usuario con sus roles
    const usuarioConRoles = await prisma.user.findUnique({
      where: { id: nuevoUsuario.id },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    return usuarioConRoles;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

export const updateUsuario = async (user) => {
  let {
    name,
    email,
    password,
    image,
    bio
  } = user;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (password) updateData.password = password;
    if (image !== undefined) updateData.image = image;
    if (bio !== undefined) updateData.bio = bio;

    const usuarioActualizado = await prisma.user.update({
      where: { email },
      data: updateData
    });
    return usuarioActualizado;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const validarUsuariosExistentes = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return !!user; 
};

export const deleteUser = async (id) => {
  try {
    const existeUsuario = await validarUsuariosExistentes(id);
    if (!existeUsuario) {
      return {
        message: `Error: el usuario con id ${id} no existe`
      };
    }

    const res= await prisma.user.delete({ where: { id } });

    return {
      message: `Usuario eliminado`,
      data: res
    };
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const cambiarContrasena = async (id, nuevaContrasena) => {
  try {
    const usuarioActualizado = await prisma.user.update({
      where: { id },
      data: { password: nuevaContrasena }
    });
    return usuarioActualizado;
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    throw error;
  }
};

export const contrasenaActual = async (id) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id },
      select: { password: true }
    });

    return usuario?.password || null;
  } catch (error) {
    console.error("Error al obtener la contraseña:", error);
    throw error;
  }
};

export const obtenerUsuarioPorSuCorreo = async (email) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true, // 👈 Aquí se incluye la contraseña
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    return usuario;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const obtenerUsuariosById = async (id) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    return usuario;
  } catch (error) {
    console.error(error);
    return error;
  } 
};

export const asignarRolUsuario = async (userId, roleId) => {
  try {
    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId
      }
    });
    return userRole;
  } catch (error) {
    console.error("Error al asignar rol:", error);
    throw error;
  }
};

export const removerRolUsuario = async (userId, roleId) => {
  try {
    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });
    return { message: "Rol removido exitosamente" };
  } catch (error) {
    console.error("Error al remover rol:", error);
    throw error;
  }
};




