import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerSubjects = async () => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    return subjects;
  } catch (error) {
    throw new Error(`Error fetching subjects: ${error.message}`);
  }
};

export const crearSubject = async (datos) => {
  try {
    const subject = await prisma.subject.create({
      data: {
        name: datos.name.toLowerCase().trim(),
        description: datos.description?.trim() || null
      }
    });
    return subject;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Subject name already exists');
    }
    throw new Error(`Error creating subject: ${error.message}`);
  }
};

export const actualizarSubject = async (datos) => {
  try {
    const subject = await prisma.subject.update({
      where: {
        id: datos.id
      },
      data: {
        name: datos.name ? datos.name.toLowerCase().trim() : undefined,
        description: datos.description?.trim() || null
      }
    });
    return subject;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Subject not found');
    }
    if (error.code === 'P2002') {
      throw new Error('Subject name already exists');
    }
    throw new Error(`Error updating subject: ${error.message}`);
  }
};

export const eliminarSubject = async (id) => {
  try {
    const subject = await prisma.subject.delete({
      where: {
        id: id
      }
    });
    return { message: 'Subject deleted successfully', subject };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Subject not found');
    }
    if (error.code === 'P2003') {
      throw new Error('Cannot delete subject: it has related subtopics');
    }
    throw new Error(`Error deleting subject: ${error.message}`);
  }
};

export const obtenerSubjectPorId = async (id) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: {
        id: id
      }
    });
    return subject;
  } catch (error) {
    throw new Error(`Error fetching subject: ${error.message}`);
  }
};

export const obtenerSubjectPorNombre = async (name) => {
  try {
    const subject = await prisma.subject.findFirst({
      where: {
        name: {
          equals: name.toLowerCase().trim(),
          mode: 'insensitive'
        }
      }
    });
    return subject;
  } catch (error) {
    throw new Error(`Error fetching subject by name: ${error.message}`);
  }
};

export const obtenerSubjectsConSubtopics = async () => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        subtopics: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    return subjects;
  } catch (error) {
    throw new Error(`Error fetching subjects with subtopics: ${error.message}`);
  }
};
