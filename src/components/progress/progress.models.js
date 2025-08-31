import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerProgress = async () => {
  try {
    const progress = await prisma.progress.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subtopic: {
          select: {
            id: true,
            name: true,
            description: true,
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return progress;
  } catch (error) {
    throw new Error(`Error fetching progress: ${error.message}`);
  }
};

export const crearProgress = async (datos) => {
  try {
    const progress = await prisma.progress.create({
      data: {
        userId: datos.userId,
        subtopicId: datos.subtopicId,
        progressType: datos.progressType.toLowerCase().trim(),
        percentage: datos.percentage,
        completedAt: datos.percentage >= 100 ? new Date() : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subtopic: {
          select: {
            id: true,
            name: true,
            description: true,
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    return progress;
  } catch (error) {
    if (error.code === 'P2003') {
      throw new Error('User or subtopic not found');
    }
    if (error.code === 'P2002') {
      throw new Error('Progress record already exists for this user and subtopic');
    }
    throw new Error(`Error creating progress: ${error.message}`);
  }
};

export const actualizarProgress = async (datos) => {
  try {
    const progress = await prisma.progress.update({
      where: {
        id: datos.id
      },
      data: {
        userId: datos.userId,
        subtopicId: datos.subtopicId,
        progressType: datos.progressType ? datos.progressType.toLowerCase().trim() : undefined,
        percentage: datos.percentage,
        completedAt: datos.percentage >= 100 ? new Date() : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subtopic: {
          select: {
            id: true,
            name: true,
            description: true,
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    return progress;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Progress not found');
    }
    if (error.code === 'P2003') {
      throw new Error('User or subtopic not found');
    }
    throw new Error(`Error updating progress: ${error.message}`);
  }
};

export const eliminarProgress = async (id) => {
  try {
    const progress = await prisma.progress.delete({
      where: {
        id: id
      }
    });
    return { message: 'Progress deleted successfully', progress };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Progress not found');
    }
    throw new Error(`Error deleting progress: ${error.message}`);
  }
};

export const obtenerProgressPorId = async (id) => {
  try {
    const progress = await prisma.progress.findUnique({
      where: {
        id: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subtopic: {
          select: {
            id: true,
            name: true,
            description: true,
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    return progress;
  } catch (error) {
    throw new Error(`Error fetching progress: ${error.message}`);
  }
};

export const obtenerProgressPorUsuario = async (userId) => {
  try {
    const progress = await prisma.progress.findMany({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subtopic: {
          select: {
            id: true,
            name: true,
            description: true,
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return progress;
  } catch (error) {
    throw new Error(`Error fetching progress by user: ${error.message}`);
  }
};

export const obtenerProgressPorSubtopic = async (subtopicId) => {
  try {
    const progress = await prisma.progress.findMany({
      where: {
        subtopicId: subtopicId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subtopic: {
          select: {
            id: true,
            name: true,
            description: true,
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return progress;
  } catch (error) {
    throw new Error(`Error fetching progress by subtopic: ${error.message}`);
  }
};

export const obtenerProgressPorTipo = async (progressType) => {
  try {
    const progress = await prisma.progress.findMany({
      where: {
        progressType: progressType.toLowerCase().trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subtopic: {
          select: {
            id: true,
            name: true,
            description: true,
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return progress;
  } catch (error) {
    throw new Error(`Error fetching progress by type: ${error.message}`);
  }
};

export const obtenerProgressCompletado = async () => {
  try {
    const progress = await prisma.progress.findMany({
      where: {
        percentage: {
          gte: 100
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subtopic: {
          select: {
            id: true,
            name: true,
            description: true,
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });
    return progress;
  } catch (error) {
    throw new Error(`Error fetching completed progress: ${error.message}`);
  }
};
