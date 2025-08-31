import pkg from '@prisma/client';
const {PrismaClient} = pkg;
const prisma = new PrismaClient();

export const obtenerJuegos = async () => {
  try {
    const juegos = await prisma.aIGame.findMany({
      include: {
        subtopic: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return juegos;
  } catch (error) {
    console.error('Error al obtener juegos:', error);
    throw error;
  }
};

export const obtenerJuegoPorId = async (id) => {
  try {
    const juego = await prisma.aIGame.findUnique({
      where: { id },
      include: {
        subtopic: {
          include: {
            subject: true
          }
        }
      }
    });
    return juego;
  } catch (error) {
    console.error('Error al obtener juego por ID:', error);
    throw error;
  }
};

export const obtenerJuegosPorSubtopic = async (subtopicId) => {
  try {
    const juegos = await prisma.aIGame.findMany({
      where: { 
        subtopicId,
        isActive: true
      },
      include: {
        subtopic: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return juegos;
  } catch (error) {
    console.error('Error al obtener juegos por subtopic:', error);
    throw error;
  }
};

export const obtenerJuegosPorTipo = async (gameType) => {
  try {
    const juegos = await prisma.aIGame.findMany({
      where: { 
        gameType,
        isActive: true
      },
      include: {
        subtopic: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return juegos;
  } catch (error) {
    console.error('Error al obtener juegos por tipo:', error);
    throw error;
  }
};

export const crearJuego = async (datos) => {
  try {
    const nuevoJuego = await prisma.aIGame.create({
      data: {
        subtopicId: datos.subtopicId,
        gameType: datos.gameType,
        agentType: datos.agentType,
        title: datos.title,
        description: datos.description,
        instructions: datos.instructions,
        htmlContent: datos.htmlContent,
        difficulty: datos.difficulty,
        estimatedTime: datos.estimatedTime
      },
      include: {
        subtopic: {
          include: {
            subject: true
          }
        }
      }
    });
    return nuevoJuego;
  } catch (error) {
    console.error('Error al crear juego:', error);
    throw error;
  }
};

export const actualizarJuego = async (datos) => {
  try {
    const juegoActualizado = await prisma.aIGame.update({
      where: { id: datos.id },
      data: {
        title: datos.title,
        description: datos.description,
        instructions: datos.instructions,
        htmlContent: datos.htmlContent,
        difficulty: datos.difficulty,
        estimatedTime: datos.estimatedTime,
        isActive: datos.isActive
      },
      include: {
        subtopic: {
          include: {
            subject: true
          }
        }
      }
    });
    return juegoActualizado;
  } catch (error) {
    console.error('Error al actualizar juego:', error);
    throw error;
  }
};

export const eliminarJuego = async (id) => {
  try {
    const juegoEliminado = await prisma.aIGame.delete({
      where: { id }
    });
    return {
      message: 'Juego eliminado con éxito',
      data: juegoEliminado
    };
  } catch (error) {
    console.error('Error al eliminar juego:', error);
    throw error;
  }
};

export const incrementarContadorJuego = async (id) => {
  try {
    const juegoActualizado = await prisma.aIGame.update({
      where: { id },
      data: {
        playCount: {
          increment: 1
        }
      }
    });
    return juegoActualizado;
  } catch (error) {
    console.error('Error al incrementar contador:', error);
    throw error;
  }
};

export const obtenerJuegosPopulares = async (limit = 10) => {
  try {
    const juegos = await prisma.aIGame.findMany({
      where: { isActive: true },
      include: {
        subtopic: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        playCount: 'desc'
      },
      take: limit
    });
    return juegos;
  } catch (error) {
    console.error('Error al obtener juegos populares:', error);
    throw error;
  }
};

export const obtenerEstadisticasJuegos = async () => {
  try {
    const totalJuegos = await prisma.aIGame.count();
    const juegosPorTipo = await prisma.aIGame.groupBy({
      by: ['gameType'],
      _count: {
        gameType: true
      }
    });
    const totalJugadas = await prisma.aIGame.aggregate({
      _sum: {
        playCount: true
      }
    });
    
    return {
      totalJuegos,
      juegosPorTipo,
      totalJugadas: totalJugadas._sum.playCount || 0
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

