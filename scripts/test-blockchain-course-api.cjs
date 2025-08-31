const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBlockchainCourseAPI() {
  console.log('🔍 Probando los datos del curso de Blockchain...\n');

  try {
    // 1. VERIFICAR SUBJECTS (CURSOS)
    const subjects = await prisma.subject.findMany({
      include: {
        subtopics: true
      }
    });
    
    console.log('📚 SUBJECTS ENCONTRADOS:');
    subjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name}`);
      console.log(`   - Subtópicos: ${subject.subtopics.length}`);
      console.log(`   - Categoría: ${subject.category || 'N/A'}`);
      console.log(`   - Tipo: ${subject.subjectType || 'N/A'}\n`);
    });

    // 2. VERIFICAR USERS (TEACHERS Y STUDENTS)
    const users = await prisma.user.findMany();
    const teachers = users.filter(u => u.email.includes('blockchain') || u.name.includes('Prof'));
    const students = users.filter(u => u.email.includes('estudiante'));

    console.log('👨‍🏫 TEACHERS ENCONTRADOS:');
    teachers.forEach((teacher, index) => {
      console.log(`${index + 1}. ${teacher.name} (${teacher.email})`);
    });

    console.log('\n👥 ESTUDIANTES ENCONTRADOS:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email})`);
    });

    // 3. VERIFICAR ENROLLMENTS
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: true,
        assignment: {
          include: {
            subject: true,
            teacher: true
          }
        }
      }
    });

    console.log('\n🎓 MATRICULACIONES ENCONTRADAS:');
    enrollments.forEach((enrollment, index) => {
      console.log(`${index + 1}. ${enrollment.student.name} matriculado en "${enrollment.assignment.subject.name}"`);
      console.log(`   - Profesor: ${enrollment.assignment.teacher.name}`);
      console.log(`   - Status: ${enrollment.status}`);
      console.log(`   - Asistencia: ${enrollment.attendance || 'N/A'}%\n`);
    });

    // 4. VERIFICAR PROGRESS
    const progress = await prisma.progress.findMany({
      include: {
        user: true,
        subtopic: {
          include: {
            subject: true
          }
        }
      }
    });

    console.log('📊 PROGRESO ENCONTRADO:');
    progress.forEach((prog, index) => {
      console.log(`${index + 1}. ${prog.user.name} - ${prog.subtopic.name}`);
      console.log(`   - Materia: ${prog.subtopic.subject.name}`);
      console.log(`   - Progreso: ${prog.percentage}%`);
      console.log(`   - Completado: ${prog.completedAt ? 'Sí' : 'No'}\n`);
    });

    // 5. SIMULAR LLAMADA DEL FRONTEND
    console.log('🎯 SIMULANDO LLAMADA DEL DASHBOARD FRONTEND:\n');

    // Buscar el teacher de blockchain
    const blockchainTeacher = teachers[0];
    if (!blockchainTeacher) {
      console.log('❌ No se encontró teacher de blockchain');
      return;
    }

    console.log(`👨‍🏫 Teacher ID para dashboard: ${blockchainTeacher.id}`);
    console.log(`📧 Email para login: ${blockchainTeacher.email}`);
    
    // Obtener las class assignments del teacher
    const assignments = await prisma.classAssignment.findMany({
      where: {
        teacherId: blockchainTeacher.id
      },
      include: {
        subject: {
          include: {
            subtopics: true
          }
        },
        grade: true,
        enrollments: {
          include: {
            student: true
          }
        }
      }
    });

    console.log('\n🎓 ASSIGNMENTS DEL TEACHER:');
    assignments.forEach((assignment, index) => {
      console.log(`${index + 1}. ${assignment.subject.name}`);
      console.log(`   - Grado: ${assignment.grade.name}`);
      console.log(`   - Subtópicos: ${assignment.subject.subtopics.length}`);
      console.log(`   - Estudiantes matriculados: ${assignment.enrollments.length}`);
      assignment.enrollments.forEach(enrollment => {
        console.log(`     • ${enrollment.student.name}`);
      });
      console.log('');
    });

    console.log('✅ DATOS LISTOS PARA EL FRONTEND!');
    console.log('🎯 Puedes loguearte con:');
    console.log(`   📧 Email: ${blockchainTeacher.email}`);
    console.log(`   🔑 Password: cualquier password (el auth está simplificado)`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
testBlockchainCourseAPI();
