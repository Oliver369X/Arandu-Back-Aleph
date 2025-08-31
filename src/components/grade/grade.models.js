import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerGrades = async () => {
  try {
    const grades = await prisma.grade.findMany({
      orderBy: [
        { year: 'desc' },
        { name: 'asc' }
      ]
    });
    return grades;
  } catch (error) {
    throw new Error(`Error fetching grades: ${error.message}`);
  }
};

export const crearGrade = async (datos) => {
  try {
    const grade = await prisma.grade.create({
      data: {
        name: datos.name.trim(),
        year: datos.year
      }
    });
    return grade;
  } catch (error) {
    throw new Error(`Error creating grade: ${error.message}`);
  }
};

export const actualizarGrade = async (datos) => {
  try {
    const grade = await prisma.grade.update({
      where: {
        id: datos.id
      },
      data: {
        name: datos.name ? datos.name.trim() : undefined,
        year: datos.year
      }
    });
    return grade;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Grade not found');
    }
    throw new Error(`Error updating grade: ${error.message}`);
  }
};

export const eliminarGrade = async (id) => {
  try {
    const grade = await prisma.grade.delete({
      where: {
        id: id
      }
    });
    return { message: 'Grade deleted successfully', grade };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Grade not found');
    }
    if (error.code === 'P2003') {
      throw new Error('Cannot delete grade: it has related class assignments');
    }
    throw new Error(`Error deleting grade: ${error.message}`);
  }
};

export const obtenerGradePorId = async (id) => {
  try {
    const grade = await prisma.grade.findUnique({
      where: {
        id: id
      }
    });
    return grade;
  } catch (error) {
    throw new Error(`Error fetching grade: ${error.message}`);
  }
};

export const obtenerGradesPorYear = async (year) => {
  try {
    const grades = await prisma.grade.findMany({
      where: {
        year: year
      },
      orderBy: {
        name: 'asc'
      }
    });
    return grades;
  } catch (error) {
    throw new Error(`Error fetching grades by year: ${error.message}`);
  }
};
