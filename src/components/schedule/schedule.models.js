import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerSchedules = async () => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        assignment: {
          select: {
            id: true,
            grade: {
              select: {
                id: true,
                name: true,
                year: true
              }
            },
            subject: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });
    return schedules;
  } catch (error) {
    throw new Error(`Error fetching schedules: ${error.message}`);
  }
};

export const crearSchedule = async (datos) => {
  try {
    const schedule = await prisma.schedule.create({
      data: {
        assignmentId: datos.assignmentId,
        dayOfWeek: datos.dayOfWeek.toLowerCase().trim(),
        startTime: new Date(datos.startTime),
        endTime: new Date(datos.endTime),
        quarter: datos.quarter.trim()
      },
      include: {
        assignment: {
          select: {
            id: true,
            grade: {
              select: {
                id: true,
                name: true,
                year: true
              }
            },
            subject: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            teacher: {
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
    return schedule;
  } catch (error) {
    if (error.code === 'P2003') {
      throw new Error('Class assignment not found');
    }
    throw new Error(`Error creating schedule: ${error.message}`);
  }
};

export const actualizarSchedule = async (datos) => {
  try {
    const schedule = await prisma.schedule.update({
      where: {
        id: datos.id
      },
      data: {
        assignmentId: datos.assignmentId,
        dayOfWeek: datos.dayOfWeek ? datos.dayOfWeek.toLowerCase().trim() : undefined,
        startTime: datos.startTime ? new Date(datos.startTime) : undefined,
        endTime: datos.endTime ? new Date(datos.endTime) : undefined,
        quarter: datos.quarter ? datos.quarter.trim() : undefined
      },
      include: {
        assignment: {
          select: {
            id: true,
            grade: {
              select: {
                id: true,
                name: true,
                year: true
              }
            },
            subject: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            teacher: {
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
    return schedule;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Schedule not found');
    }
    if (error.code === 'P2003') {
      throw new Error('Class assignment not found');
    }
    throw new Error(`Error updating schedule: ${error.message}`);
  }
};

export const eliminarSchedule = async (id) => {
  try {
    const schedule = await prisma.schedule.delete({
      where: {
        id: id
      }
    });
    return { message: 'Schedule deleted successfully', schedule };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Schedule not found');
    }
    throw new Error(`Error deleting schedule: ${error.message}`);
  }
};

export const obtenerSchedulePorId = async (id) => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: {
        id: id
      },
      include: {
        assignment: {
          select: {
            id: true,
            grade: {
              select: {
                id: true,
                name: true,
                year: true
              }
            },
            subject: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            teacher: {
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
    return schedule;
  } catch (error) {
    throw new Error(`Error fetching schedule: ${error.message}`);
  }
};

export const obtenerSchedulesPorAssignment = async (assignmentId) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        assignmentId: assignmentId
      },
      include: {
        assignment: {
          select: {
            id: true,
            grade: {
              select: {
                id: true,
                name: true,
                year: true
              }
            },
            subject: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });
    return schedules;
  } catch (error) {
    throw new Error(`Error fetching schedules by assignment: ${error.message}`);
  }
};

export const obtenerSchedulesPorDay = async (dayOfWeek) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        dayOfWeek: dayOfWeek.toLowerCase().trim()
      },
      include: {
        assignment: {
          select: {
            id: true,
            grade: {
              select: {
                id: true,
                name: true,
                year: true
              }
            },
            subject: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    return schedules;
  } catch (error) {
    throw new Error(`Error fetching schedules by day: ${error.message}`);
  }
};

export const obtenerSchedulesPorQuarter = async (quarter) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        quarter: quarter.trim()
      },
      include: {
        assignment: {
          select: {
            id: true,
            grade: {
              select: {
                id: true,
                name: true,
                year: true
              }
            },
            subject: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });
    return schedules;
  } catch (error) {
    throw new Error(`Error fetching schedules by quarter: ${error.message}`);
  }
};
