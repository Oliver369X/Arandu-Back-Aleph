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
        description: datos.description?.trim() || null,
        category: datos.category?.trim() || null,
        price: datos.price || null,
        duration: datos.duration?.trim() || null,
        difficulty: datos.difficulty || null,
        createdBy: datos.createdBy || null // ID del teacher que crea el subject
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
    const updateData = {};
    
    if (datos.name !== undefined) {
      updateData.name = datos.name.toLowerCase().trim();
    }
    if (datos.description !== undefined) {
      updateData.description = datos.description?.trim() || null;
    }
    if (datos.category !== undefined) {
      updateData.category = datos.category?.trim() || null;
    }
    if (datos.price !== undefined) {
      updateData.price = datos.price || null;
    }
    if (datos.duration !== undefined) {
      updateData.duration = datos.duration?.trim() || null;
    }
    if (datos.difficulty !== undefined) {
      updateData.difficulty = datos.difficulty || null;
    }

    const subject = await prisma.subject.update({
      where: {
        id: datos.id
      },
      data: updateData
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

export const obtenerSubjectsPorCreador = async (teacherId) => {
  try {
    console.log(`🔍 [SubjectModel] Buscando subjects creados por teacher: ${teacherId}`);
    
    const subjects = await prisma.subject.findMany({
      where: {
        createdBy: teacherId
      },
      include: {
        subtopics: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ [SubjectModel] Encontrados ${subjects.length} subjects creados por teacher ${teacherId}`);
    return subjects;
  } catch (error) {
    console.error(`❌ [SubjectModel] Error obteniendo subjects por creador:`, error);
    throw new Error(`Error fetching subjects by creator: ${error.message}`);
  }
};
