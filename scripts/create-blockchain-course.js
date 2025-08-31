const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBlockchainCourse() {
  console.log('🚀 Creando curso completo de Blockchain...');

  try {
    // 1. CREAR EL SUBJECT (CURSO PRINCIPAL)
    const blockchainSubject = await prisma.subject.create({
      data: {
        name: 'Fundamentos de Blockchain y Criptomonedas',
        description: 'Curso completo sobre tecnología blockchain, desde conceptos básicos hasta aplicaciones avanzadas',
        
        // PARA CONTEXTO EDUCATIVO FORMAL
        subjectType: 'formal_subject',
        curriculum: `
        PROGRAMA ACADÉMICO - BLOCKCHAIN FUNDAMENTALS
        ==========================================
        
        UNIDAD 1: Introducción y Conceptos Base
        - Historia y evolución de las criptomonedas
        - Principios de criptografía
        - Descentralización vs centralización
        
        UNIDAD 2: Tecnología Blockchain
        - Estructura de bloques
        - Algoritmos de consenso
        - Minería y validación
        
        UNIDAD 3: Criptomonedas y Tokens
        - Bitcoin y Ethereum
        - Smart Contracts
        - DeFi (Finanzas Descentralizadas)
        
        UNIDAD 4: Aplicaciones Prácticas
        - NFTs y metaverso
        - Casos de uso empresariales
        - Regulación y aspectos legales
        `,
        objectives: `
        OBJETIVOS DE APRENDIZAJE:
        - Comprender los fundamentos técnicos de blockchain
        - Analizar el impacto económico de las criptomonedas
        - Evaluar casos de uso reales en diferentes industrias
        - Desarrollar criterios para invertir responsablemente
        - Identificar oportunidades y riesgos en el ecosistema crypto
        `,
        
        // PARA CONTEXTO DE PLATAFORMA ONLINE (OPCIONAL)
        category: 'blockchain',
        price: 299.99,
        duration: '8 semanas',
        difficulty: 'intermedio'
      }
    });

    console.log('✅ Subject creado:', blockchainSubject.name);

    // 2. CREAR TODOS LOS SUBTÓPICOS
    const subtopics = [
      {
        name: 'Introducción a Blockchain',
        description: 'Conceptos fundamentales y historia de la tecnología blockchain'
      },
      {
        name: 'Criptografía y Hashing',
        description: 'Fundamentos criptográficos: SHA-256, firmas digitales, claves públicas/privadas'
      },
      {
        name: 'Bitcoin: La Primera Criptomoneda',
        description: 'Historia, funcionamiento y arquitectura de Bitcoin'
      },
      {
        name: 'Ethereum y Smart Contracts',
        description: 'Plataforma Ethereum, desarrollo de contratos inteligentes con Solidity'
      },
      {
        name: 'Algoritmos de Consenso',
        description: 'Proof of Work, Proof of Stake, y otros mecanismos de consenso'
      },
      {
        name: 'DeFi: Finanzas Descentralizadas',
        description: 'Uniswap, Compound, lending protocols y yield farming'
      },
      {
        name: 'NFTs y Tokens no Fungibles',
        description: 'Creación, marketplace y casos de uso de NFTs'
      },
      {
        name: 'Minería y Validación',
        description: 'Proceso de minería, pools, hardware y consumo energético'
      },
      {
        name: 'Wallets y Seguridad',
        description: 'Tipos de wallets, buenas prácticas de seguridad, custodial vs non-custodial'
      },
      {
        name: 'Regulación y Aspectos Legales',
        description: 'Marco regulatorio global, compliance y aspectos fiscales'
      },
      {
        name: 'Casos de Uso Empresariales',
        description: 'Supply chain, identidad digital, logística y trazabilidad'
      },
      {
        name: 'Avalanche Ecosystem',
        description: 'Subredes, C-Chain, X-Chain, P-Chain y desarrollo en Avalanche'
      }
    ];

    const createdSubtopics = [];
    for (const subtopic of subtopics) {
      const created = await prisma.subtopic.create({
        data: {
          ...subtopic,
          subjectId: blockchainSubject.id
        }
      });
      createdSubtopics.push(created);
      console.log(`✅ Subtopic creado: ${created.name}`);
    }

    // 3. CREAR ALGUNOS USUARIOS DE EJEMPLO (Teacher y Students)
    const teacher = await prisma.user.create({
      data: {
        name: 'Prof. Carlos Blockchain',
        email: 'carlos.blockchain@universidad.edu',
        password: 'hashed_password_here',
        bio: 'Ingeniero en Sistemas especializado en tecnologías blockchain con 5+ años de experiencia en criptomonedas y DeFi.'
      }
    });

    const students = [];
    const studentNames = [
      { name: 'Ana García', email: 'ana.garcia@estudiante.edu' },
      { name: 'Luis Rodríguez', email: 'luis.rodriguez@estudiante.edu' },
      { name: 'María Fernández', email: 'maria.fernandez@estudiante.edu' },
      { name: 'Diego Martinez', email: 'diego.martinez@estudiante.edu' },
      { name: 'Sofia López', email: 'sofia.lopez@estudiante.edu' }
    ];

    for (const studentData of studentNames) {
      const student = await prisma.user.create({
        data: {
          ...studentData,
          password: 'hashed_password_here',
          bio: 'Estudiante de tecnología blockchain'
        }
      });
      students.push(student);
      console.log(`✅ Estudiante creado: ${student.name}`);
    }

    // 4. CREAR GRADO Y CLASS ASSIGNMENT
    const grade = await prisma.grade.create({
      data: {
        name: 'Blockchain Fundamentals 2025',
        year: 2025
      }
    });

    const classAssignment = await prisma.classAssignment.create({
      data: {
        gradeId: grade.id,
        subjectId: blockchainSubject.id,
        teacherId: teacher.id
      }
    });

    // 5. MATRICULAR ESTUDIANTES
    for (const student of students) {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          assignmentId: classAssignment.id,
          status: 'active',
          finalGrade: null, // Se asignará durante el curso
          attendance: Math.floor(Math.random() * 20) + 80 // 80-100%
        }
      });
      console.log(`✅ ${student.name} matriculado en el curso`);
    }

    // 6. CREAR PROGRESO INICIAL PARA ALGUNOS ESTUDIANTES
    for (const student of students.slice(0, 3)) {
      // Cada estudiante tiene progreso en 2-3 subtópicos aleatorios
      const randomSubtopics = createdSubtopics
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 2);

      for (const subtopic of randomSubtopics) {
        await prisma.progress.create({
          data: {
            userId: student.id,
            subtopicId: subtopic.id,
            progressType: 'learning',
            percentage: Math.floor(Math.random() * 80) + 20, // 20-100%
            completedAt: Math.random() > 0.5 ? new Date() : null
          }
        });
      }
      console.log(`✅ Progreso creado para ${student.name}`);
    }

    console.log('\n🎉 CURSO DE BLOCKCHAIN CREADO EXITOSAMENTE!');
    console.log('=====================================');
    console.log(`📚 Curso: ${blockchainSubject.name}`);
    console.log(`👨‍🏫 Profesor: ${teacher.name}`);
    console.log(`🎓 Estudiantes matriculados: ${students.length}`);
    console.log(`📖 Subtópicos: ${createdSubtopics.length}`);
    console.log(`🏫 Grado: ${grade.name}`);
    
    console.log('\n📋 SUBTÓPICOS CREADOS:');
    createdSubtopics.forEach((subtopic, index) => {
      console.log(`${index + 1}. ${subtopic.name}`);
    });

    console.log('\n👥 ESTUDIANTES MATRICULADOS:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email})`);
    });

    return {
      subject: blockchainSubject,
      teacher,
      students,
      subtopics: createdSubtopics,
      grade,
      classAssignment
    };

  } catch (error) {
    console.error('❌ Error creando el curso:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createBlockchainCourse()
    .then(() => {
      console.log('\n🚀 ¡Listo! Ahora puedes:');
      console.log('1. Ir al dashboard del teacher');
      console.log('2. Ver el curso de Blockchain creado');
      console.log('3. Ver estudiantes matriculados');
      console.log('4. Generar AI Games para los subtópicos');
      console.log('5. Generar AI Feedback para planes de lección');
    })
    .catch(console.error);
}

module.exports = { createBlockchainCourse };
