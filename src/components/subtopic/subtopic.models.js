import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerSubtopics = async () => {
  try {
    const subtopics = await prisma.subtopic.findMany({
      include: {
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    return subtopics;
  } catch (error) {
    throw new Error(`Error fetching subtopics: ${error.message}`);
  }
};

export const crearSubtopic = async (datos) => {
  try {
    const subtopic = await prisma.subtopic.create({
      data: {
        subjectId: datos.subjectId,
        name: datos.name.toLowerCase().trim(),
        description: datos.description?.trim() || null
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    return subtopic;
  } catch (error) {
    if (error.code === 'P2003') {
      throw new Error('Subject not found');
    }
    throw new Error(`Error creating subtopic: ${error.message}`);
  }
};

export const actualizarSubtopic = async (datos) => {
  try {
    const subtopic = await prisma.subtopic.update({
      where: {
        id: datos.id
      },
      data: {
        subjectId: datos.subjectId,
        name: datos.name ? datos.name.toLowerCase().trim() : undefined,
        description: datos.description?.trim() || null
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    return subtopic;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Subtopic not found');
    }
    if (error.code === 'P2003') {
      throw new Error('Subject not found');
    }
    throw new Error(`Error updating subtopic: ${error.message}`);
  }
};

export const eliminarSubtopic = async (id) => {
  try {
    const subtopic = await prisma.subtopic.delete({
      where: {
        id: id
      }
    });
    return { message: 'Subtopic deleted successfully', subtopic };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Subtopic not found');
    }
    if (error.code === 'P2003') {
      throw new Error('Cannot delete subtopic: it has related progress records');
    }
    throw new Error(`Error deleting subtopic: ${error.message}`);
  }
};

export const obtenerSubtopicPorId = async (id) => {
  try {
    const subtopic = await prisma.subtopic.findUnique({
      where: {
        id: id
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    return subtopic;
  } catch (error) {
    throw new Error(`Error fetching subtopic: ${error.message}`);
  }
};

export const obtenerSubtopicPorNombre = async (name) => {
  try {
    const subtopic = await prisma.subtopic.findFirst({
      where: {
        name: {
          equals: name.toLowerCase().trim(),
          mode: 'insensitive'
        }
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    return subtopic;
  } catch (error) {
    throw new Error(`Error fetching subtopic by name: ${error.message}`);
  }
};

export const obtenerSubtopicsPorSubject = async (subjectId) => {
  try {
    const subtopics = await prisma.subtopic.findMany({
      where: {
        subjectId: subjectId
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    return subtopics;
  } catch (error) {
    throw new Error(`Error fetching subtopics by subject: ${error.message}`);
  }
};

export const obtenerSubtopicsConProgress = async () => {
  try {
    const subtopics = await prisma.subtopic.findMany({
      include: {
        subject: {
          select: {
            id: true,
            name: true
          }
        },
        progress: {
          select: {
            id: true,
            userId: true,
            progressType: true,
            percentage: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    return subtopics;
  } catch (error) {
    throw new Error(`Error fetching subtopics with progress: ${error.message}`);
  }
};
