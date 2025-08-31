import pkg from '@prisma/client';
const {PrismaClient} = pkg;
const prisma = new PrismaClient();

export const obtenerRoles = async () => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,

              }
            }
          }
        }
      }
    });
    return roles;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const crearRol = async (datos) => {
  try {
    const { 
      name,
      description,
      permissions
    } = datos;
    
    const nuevoRol = await prisma.role.create({
      data: {
        name,
        description,
        permissions
      }
    });
    return nuevoRol;
  } catch (error) {
    console.error('Error al crear rol:', error);
    throw error;
  }
};

export const actualizarRol = async (rol) => {
  const {
    id,
    name,
    description,
    permissions
  } = rol;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (permissions) updateData.permissions = permissions;

    const rolActualizado = await prisma.role.update({
      where: { id },
      data: updateData
    });
    return rolActualizado;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const validarRolExiste = async (id) => {
  const rol = await prisma.role.findUnique({ where: { id } });
  return !!rol;
};

export const eliminarRol = async (id) => {
  try {
    const existeRol = await validarRolExiste(id);
    if (!existeRol) {
      return {
        message: `Error: el rol con id ${id} no existe`
      };
    }

    await prisma.role.delete({ where: { id } });

    return {
      message: `Rol eliminado`
    };
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const obtenerRolPorId = async (id) => {
  try {
    const rol = await prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,

              }
            }
          }
        }
      }
    });
    return rol;
  } catch (error) {
    console.error(error);
    return error;
  } 
};

export const obtenerRolPorNombre = async (name) => {
  try {
    const rol = await prisma.role.findUnique({
      where: { name },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,

              }
            }
          }
        }
      }
    });
    return rol;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const obtenerUsuariosConRol = async (roleId) => {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { roleId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isPremium: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });
    return userRoles;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const obtenerRolesActivos = async () => {
  try {
    const roles = await prisma.role.findMany({
      where: {
        userRoles: {
          some: {}
        }
      },
      include: {
        _count: {
          select: {
            userRoles: true
          }
        }
      }
    });
    return roles;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const obtenerRolesPorPermisos = async (permissions) => {
  try {
    const roles = await prisma.role.findMany({
      where: {
        permissions: {
          contains: permissions
        }
      },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    return roles;
  } catch (error) {
    console.error(error);
    return error;
  }
}; 