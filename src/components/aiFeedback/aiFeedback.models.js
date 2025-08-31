import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerAIFeedbacks = async () => {
  try {
    const aiFeedbacks = await prisma.aIFeedBack.findMany({
      include: {
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
      orderBy: [
        { subtopicId: 'asc' },
        { stepNumber: 'asc' }
      ]
    });
    return aiFeedbacks;
  } catch (error) {
    throw new Error(`Error fetching AI feedbacks: ${error.message}`);
  }
};

export const crearAIFeedback = async (datos) => {
  try {
    const aiFeedback = await prisma.aIFeedBack.create({
      data: {
        subtopicId: datos.subtopicId,
        timeMinutes: datos.timeMinutes,
        stepNumber: datos.stepNumber,
        stepName: datos.stepName.trim(),
        content: datos.content.trim(),
        studentActivity: datos.studentActivity?.trim() || null,
        timeAllocation: datos.timeAllocation,
        materialsNeeded: datos.materialsNeeded?.trim() || null,
        successIndicator: datos.successIndicator?.trim() || null
      },
      include: {
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
    return aiFeedback;
  } catch (error) {
    if (error.code === 'P2003') {
      throw new Error('Subtopic not found');
    }
    throw new Error(`Error creating AI feedback: ${error.message}`);
  }
};

export const actualizarAIFeedback = async (datos) => {
  try {
    const aiFeedback = await prisma.aIFeedBack.update({
      where: {
        id: datos.id
      },
      data: {
        subtopicId: datos.subtopicId,
        timeMinutes: datos.timeMinutes,
        stepNumber: datos.stepNumber,
        stepName: datos.stepName ? datos.stepName.trim() : undefined,
        content: datos.content ? datos.content.trim() : undefined,
        studentActivity: datos.studentActivity?.trim() || null,
        timeAllocation: datos.timeAllocation,
        materialsNeeded: datos.materialsNeeded?.trim() || null,
        successIndicator: datos.successIndicator?.trim() || null
      },
      include: {
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
    return aiFeedback;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('AI Feedback not found');
    }
    if (error.code === 'P2003') {
      throw new Error('Subtopic not found');
    }
    throw new Error(`Error updating AI feedback: ${error.message}`);
  }
};

export const eliminarAIFeedback = async (id) => {
  try {
    const aiFeedback = await prisma.aIFeedBack.delete({
      where: {
        id: id
      }
    });
    return { message: 'AI Feedback deleted successfully', aiFeedback };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('AI Feedback not found');
    }
    throw new Error(`Error deleting AI feedback: ${error.message}`);
  }
};

export const obtenerAIFeedbackPorId = async (id) => {
  try {
    const aiFeedback = await prisma.aIFeedBack.findUnique({
      where: {
        id: id
      },
      include: {
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
    return aiFeedback;
  } catch (error) {
    throw new Error(`Error fetching AI feedback: ${error.message}`);
  }
};

export const obtenerAIFeedbacksPorSubtopic = async (subtopicId) => {
  try {
    const aiFeedbacks = await prisma.aIFeedBack.findMany({
      where: {
        subtopicId: subtopicId
      },
      include: {
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
        stepNumber: 'asc'
      }
    });
    return aiFeedbacks;
  } catch (error) {
    throw new Error(`Error fetching AI feedbacks by subtopic: ${error.message}`);
  }
};

export const obtenerAIFeedbacksPorStepNumber = async (stepNumber) => {
  try {
    const aiFeedbacks = await prisma.aIFeedBack.findMany({
      where: {
        stepNumber: stepNumber
      },
      include: {
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
        subtopicId: 'asc'
      }
    });
    return aiFeedbacks;
  } catch (error) {
    throw new Error(`Error fetching AI feedbacks by step number: ${error.message}`);
  }
};

export const obtenerAIFeedbacksCompletos = async () => {
  try {
    const aiFeedbacks = await prisma.aIFeedBack.findMany({
      where: {
        AND: [
          { content: { not: null } },
          { content: { not: '' } },
          { stepName: { not: null } },
          { stepName: { not: '' } }
        ]
      },
      include: {
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
      orderBy: [
        { subtopicId: 'asc' },
        { stepNumber: 'asc' }
      ]
    });
    return aiFeedbacks;
  } catch (error) {
    throw new Error(`Error fetching complete AI feedbacks: ${error.message}`);
  }
};
