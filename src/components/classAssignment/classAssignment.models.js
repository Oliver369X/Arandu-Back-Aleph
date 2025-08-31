import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerClassAssignments = async () => {
  try {
    const classAssignments = await prisma.classAssignment.findMany({
      include: {
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
      },
      orderBy: {
        id: 'asc'
      }
    });
    return classAssignments;
  } catch (error) {
    throw new Error(`Error fetching class assignments: ${error.message}`);
  }
};

export const crearClassAssignment = async (datos) => {
  try {
    const classAssignment = await prisma.classAssignment.create({
      data: {
        gradeId: datos.gradeId,
        subjectId: datos.subjectId,
        teacherId: datos.teacherId
      },
      include: {
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
    });
    return classAssignment;
  } catch (error) {
    if (error.code === 'P2003') {
      throw new Error('Grade, subject, or teacher not found');
    }
    throw new Error(`Error creating class assignment: ${error.message}`);
  }
};

export const actualizarClassAssignment = async (datos) => {
  try {
    const classAssignment = await prisma.classAssignment.update({
      where: {
        id: datos.id
      },
      data: {
        gradeId: datos.gradeId,
        subjectId: datos.subjectId,
        teacherId: datos.teacherId
      },
      include: {
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
    });
    return classAssignment;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Class assignment not found');
    }
    if (error.code === 'P2003') {
      throw new Error('Grade, subject, or teacher not found');
    }
    throw new Error(`Error updating class assignment: ${error.message}`);
  }
};

export const eliminarClassAssignment = async (id) => {
  try {
    const classAssignment = await prisma.classAssignment.delete({
      where: {
        id: id
      }
    });
    return { message: 'Class assignment deleted successfully', classAssignment };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Class assignment not found');
    }
    if (error.code === 'P2003') {
      throw new Error('Cannot delete class assignment: it has related schedules');
    }
    throw new Error(`Error deleting class assignment: ${error.message}`);
  }
};

export const obtenerClassAssignmentPorId = async (id) => {
  try {
    const classAssignment = await prisma.classAssignment.findUnique({
      where: {
        id: id
      },
      include: {
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
    });
    return classAssignment;
  } catch (error) {
    throw new Error(`Error fetching class assignment: ${error.message}`);
  }
};

export const obtenerClassAssignmentsPorTeacher = async (teacherId) => {
  try {
    const classAssignments = await prisma.classAssignment.findMany({
      where: {
        teacherId: teacherId
      },
      include: {
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
      },
      orderBy: {
        id: 'asc'
      }
    });
    return classAssignments;
  } catch (error) {
    throw new Error(`Error fetching class assignments by teacher: ${error.message}`);
  }
};

export const obtenerClassAssignmentsPorGrade = async (gradeId) => {
  try {
    const classAssignments = await prisma.classAssignment.findMany({
      where: {
        gradeId: gradeId
      },
      include: {
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
      },
      orderBy: {
        id: 'asc'
      }
    });
    return classAssignments;
  } catch (error) {
    throw new Error(`Error fetching class assignments by grade: ${error.message}`);
  }
};

export const obtenerClassAssignmentsPorSubject = async (subjectId) => {
  try {
    const classAssignments = await prisma.classAssignment.findMany({
      where: {
        subjectId: subjectId
      },
      include: {
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
      },
      orderBy: {
        id: 'asc'
      }
    });
    return classAssignments;
  } catch (error) {
    throw new Error(`Error fetching class assignments by subject: ${error.message}`);
  }
};
