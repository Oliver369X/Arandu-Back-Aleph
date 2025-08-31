#!/usr/bin/env node

/**
 * 🎮 Script de Poblamiento de Producción - Juegos Educativos
 * 
 * Este script crea:
 * - Teacher y Student usuarios
 * - Cursos para cada juego HTML
 * - Integra los juegos en la base de datos
 * - Configura todas las relaciones necesarias
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// 🎯 Configuración de los juegos y cursos
const GAMES_CONFIG = [
  {
    htmlFile: 'Ethereum Learning.html',
    courseName: 'Aventura Ethereum - Blockchain para Principiantes',
    courseDescription: 'Aprende sobre Ethereum y tecnología blockchain de manera interactiva. Explora contratos inteligentes, recolecta ETH y descubre cómo funciona la red descentralizada.',
    category: 'Tecnología',
    level: 'Principiante',
    duration: '45 minutos',
    gameTitle: 'Aventura Ethereum Interactiva',
    gameDescription: 'Un juego 3D inmersivo donde aprendes sobre Ethereum explorando un mundo virtual con tu avatar.',
    gameType: 'adventure',
    difficulty: 'medium'
  },
  {
    htmlFile: 'fotosintesis.html',
    courseName: 'Laboratorio de Fotosíntesis',
    courseDescription: 'Descubre cómo las plantas convierten la luz solar en energía. Experimenta con agua, CO₂ y luz solar en un laboratorio virtual 3D.',
    category: 'Ciencias Naturales',
    level: 'Básico',
    duration: '30 minutos',
    gameTitle: 'Laboratorio Virtual de Fotosíntesis',
    gameDescription: 'Ayuda a las plantas a crecer proporcionando los elementos necesarios para la fotosíntesis.',
    gameType: 'simulation',
    difficulty: 'easy'
  },
  {
    htmlFile: 'gameAI.html',
    courseName: 'Aventura de Inteligencia Artificial',
    courseDescription: 'Aprende sobre IA enseñando a un robot amistoso. Descubre cómo funciona el machine learning de manera divertida y educativa.',
    category: 'Inteligencia Artificial',
    level: 'Intermedio',
    duration: '60 minutos',
    gameTitle: 'Robot Amigo - Aprendizaje de IA',
    gameDescription: 'Enseña a un robot virtual sobre formas, frutas y emociones mientras aprendes sobre inteligencia artificial.',
    gameType: 'educational',
    difficulty: 'medium'
  },
  {
    htmlFile: 'gameBlokchin.html',
    courseName: 'Aventura Blockchain para Niños',
    courseDescription: 'Comprende la tecnología blockchain construyendo tu propia cadena de bloques. Aprende sobre seguridad digital y minería.',
    category: 'Tecnología',
    level: 'Intermedio',
    duration: '50 minutos',
    gameTitle: 'Constructor de Blockchain',
    gameDescription: 'Construye y gestiona tu propia cadena de bloques en un entorno 3D interactivo.',
    gameType: 'puzzle',
    difficulty: 'hard'
  }
];

// 🎭 Configuración de usuarios
const USERS_CONFIG = {
  teacher: {
    name: 'Prof. María Educadora',
    email: 'profesor@arandu.com',
    password: 'ProfesorSeguro123!',
    bio: 'Educadora especializada en tecnologías emergentes y aprendizaje interactivo. Apasionada por hacer que temas complejos sean accesibles para estudiantes de todas las edades.'
  },
  student: {
    name: 'Alex Estudiante',
    email: 'estudiante@arandu.com', 
    password: 'EstudianteSeguro123!',
    bio: 'Estudiante entusiasta interesado en ciencia, tecnología y aprendizaje digital.'
  }
};

/**
 * 🔧 Función principal del script
 */
async function main() {
  try {
    console.log('🚀 Iniciando poblamiento de producción...\n');

    // 1. Verificar y crear roles
    await setupRoles();
    
    // 2. Crear usuarios (teacher y student)
    const users = await createUsers();
    
    // 3. Leer archivos HTML de los juegos
    const gamesHTML = await readGameFiles();
    
    // 4. Crear cursos y juegos
    await createCoursesAndGames(users.teacher, gamesHTML);
    
    // 5. Inscribir estudiante en todos los cursos
    await enrollStudent(users.student);
    
    // 6. Crear contenido de ejemplo
    await createSampleContent();
    
    console.log('\n✅ ¡Poblamiento completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('👨‍🏫 1 Teacher creado');
    console.log('👨‍🎓 1 Student creado'); 
    console.log(`📚 ${GAMES_CONFIG.length} Cursos creados`);
    console.log(`🎮 ${GAMES_CONFIG.length} Juegos integrados`);
    console.log('🔗 Student inscrito en todos los cursos');
    
    console.log('\n🔐 Credenciales de acceso:');
    console.log('Teacher:', USERS_CONFIG.teacher.email, '/', USERS_CONFIG.teacher.password);
    console.log('Student:', USERS_CONFIG.student.email, '/', USERS_CONFIG.student.password);
    
  } catch (error) {
    console.error('❌ Error durante el poblamiento:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 🎭 Configurar roles en la base de datos
 */
async function setupRoles() {
  console.log('🎭 Configurando roles...');
  
  const roles = ['teacher', 'student', 'admin'];
  
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `Rol de ${roleName}`,
        permissions: roleName === 'admin' ? ['all'] : [roleName]
      }
    });
    console.log(`  ✅ Rol '${roleName}' configurado`);
  }
}

/**
 * 👥 Crear usuarios teacher y student
 */
async function createUsers() {
  console.log('\n👥 Creando usuarios...');
  
  const teacherRole = await prisma.role.findUnique({ where: { name: 'teacher' } });
  const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
  
  if (!teacherRole || !studentRole) {
    throw new Error('Roles no encontrados. Ejecuta el setup de roles primero.');
  }
  
  // Crear teacher
  const hashedTeacherPassword = await bcrypt.hash(USERS_CONFIG.teacher.password, 10);
  const teacher = await prisma.user.upsert({
    where: { email: USERS_CONFIG.teacher.email },
    update: {},
    create: {
      name: USERS_CONFIG.teacher.name,
      email: USERS_CONFIG.teacher.email,
      password: hashedTeacherPassword,
      bio: USERS_CONFIG.teacher.bio,
      profilePicture: '/placeholder-teacher.jpg',
      roles: {
        create: {
          roleId: teacherRole.id
        }
      }
    },
    include: { roles: true }
  });
  
  console.log(`  ✅ Teacher creado: ${teacher.name} (${teacher.email})`);
  
  // Crear student
  const hashedStudentPassword = await bcrypt.hash(USERS_CONFIG.student.password, 10);
  const student = await prisma.user.upsert({
    where: { email: USERS_CONFIG.student.email },
    update: {},
    create: {
      name: USERS_CONFIG.student.name,
      email: USERS_CONFIG.student.email,
      password: hashedStudentPassword,
      bio: USERS_CONFIG.student.bio,
      profilePicture: '/placeholder-student.jpg',
      roles: {
        create: {
          roleId: studentRole.id
        }
      }
    },
    include: { roles: true }
  });
  
  console.log(`  ✅ Student creado: ${student.name} (${student.email})`);
  
  return { teacher, student };
}

/**
 * 📁 Leer archivos HTML de los juegos
 */
async function readGameFiles() {
  console.log('\n📁 Leyendo archivos de juegos...');
  
  const gamesPath = path.join(__dirname, '../src/components/AIGame/examples/juegos');
  const gamesHTML = {};
  
  for (const game of GAMES_CONFIG) {
    const filePath = path.join(gamesPath, game.htmlFile);
    
    if (fs.existsSync(filePath)) {
      const htmlContent = fs.readFileSync(filePath, 'utf-8');
      
      // Procesar el HTML para asegurar que funcione en iframe
      const processedHTML = processHTMLForIframe(htmlContent, game);
      
      gamesHTML[game.htmlFile] = processedHTML;
      console.log(`  ✅ Juego leído: ${game.htmlFile} (${Math.round(htmlContent.length / 1024)}KB)`);
    } else {
      console.warn(`  ⚠️  Archivo no encontrado: ${game.htmlFile}`);
      gamesHTML[game.htmlFile] = createFallbackHTML(game);
    }
  }
  
  return gamesHTML;
}

/**
 * 🔧 Procesar HTML para que funcione correctamente en iframe
 */
function processHTMLForIframe(htmlContent, gameConfig) {
  // Agregar estilos para pantalla completa
  const fullscreenStyles = `
    <style>
      html, body {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        background: #1a1a1a !important;
      }
      #gameContainer, #app {
        width: 100vw !important;
        height: 100vh !important;
        position: relative !important;
      }
      /* Estilos específicos para quizzes */
      .quiz-container {
        background: white !important;
        color: #333 !important;
        padding: 40px !important;
        border-radius: 20px !important;
        box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
      }
      .answer-option {
        background: white !important;
        color: #333 !important;
      }
      .question-text {
        color: #333 !important;
      }
    </style>
  `;
  
  // Script de comunicación con el parent window
  const communicationScript = `
    <script>
      // API de comunicación con la plataforma
      window.gameAPI = {
        sendMessage: function(type, data) {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              source: 'arandu-game',
              type: type,
              data: data,
              gameId: '${gameConfig.htmlFile}'
            }, '*');
          }
        },
        reportScore: function(score) {
          this.sendMessage('score', { score: score });
        },
        reportCompletion: function(data) {
          this.sendMessage('completed', data);
        },
        reportProgress: function(progress) {
          this.sendMessage('progress', { progress: progress });
        }
      };
      
      // Auto-reportar cuando el juego carga
      window.addEventListener('load', function() {
        if (window.gameAPI) {
          window.gameAPI.sendMessage('loaded', {
            title: '${gameConfig.gameTitle}',
            ready: true
          });
        }
      });
      
      // Forzar tamaño completo
      function forceFullSize() {
        const elements = [
          document.documentElement,
          document.body,
          document.querySelector('#gameContainer'),
          document.querySelector('#app'),
          document.querySelector('canvas')
        ];
        
        elements.forEach(el => {
          if (el) {
            el.style.width = '100vw';
            el.style.height = '100vh';
            el.style.margin = '0';
            el.style.padding = '0';
            el.style.overflow = 'hidden';
          }
        });
      }
      
      // Aplicar al cargar y al redimensionar
      window.addEventListener('load', forceFullSize);
      window.addEventListener('resize', forceFullSize);
      
      // Aplicar inmediatamente
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceFullSize);
      } else {
        forceFullSize();
      }
    </script>
  `;
  
  // Insertar los estilos y scripts en el HTML
  let processedHTML = htmlContent;
  
  // Insertar estilos antes de </head>
  if (processedHTML.includes('</head>')) {
    processedHTML = processedHTML.replace('</head>', fullscreenStyles + '</head>');
  } else {
    processedHTML = fullscreenStyles + processedHTML;
  }
  
  // Insertar script antes de </body>
  if (processedHTML.includes('</body>')) {
    processedHTML = processedHTML.replace('</body>', communicationScript + '</body>');
  } else {
    processedHTML = processedHTML + communicationScript;
  }
  
  return processedHTML;
}

/**
 * 🎮 Crear HTML de respaldo si no se encuentra el archivo
 */
function createFallbackHTML(gameConfig) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${gameConfig.gameTitle}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Comic Sans MS', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: white;
            text-align: center;
        }
        .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; line-height: 1.6; }
        .emoji { font-size: 4em; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">🎮</div>
        <h1>${gameConfig.gameTitle}</h1>
        <p>${gameConfig.gameDescription}</p>
        <p><strong>¡Próximamente disponible!</strong></p>
    </div>
    
    <script>
      window.gameAPI = {
        sendMessage: function(type, data) {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              source: 'arandu-game',
              type: type,
              data: data,
              gameId: '${gameConfig.htmlFile}'
            }, '*');
          }
        }
      };
      
      window.addEventListener('load', function() {
        if (window.gameAPI) {
          window.gameAPI.sendMessage('loaded', {
            title: '${gameConfig.gameTitle}',
            ready: true
          });
        }
      });
    </script>
</body>
</html>`;
}

/**
 * 📚 Crear cursos y juegos
 */
async function createCoursesAndGames(teacher, gamesHTML) {
  console.log('\n📚 Creando cursos y juegos...');
  
  for (const gameConfig of GAMES_CONFIG) {
    // Crear Subject (curso)
    const subject = await prisma.subject.create({
      data: {
        name: gameConfig.courseName,
        description: gameConfig.courseDescription,
        category: gameConfig.category,
        difficulty: gameConfig.level,
        estimatedDuration: gameConfig.duration,
        isActive: true,
        createdBy: teacher.id,
        imageUrl: `/course-${gameConfig.htmlFile.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.jpg`,
      }
    });
    
    console.log(`  ✅ Curso creado: ${subject.name}`);
    
    // Crear Subtopic principal
    const subtopic = await prisma.subtopic.create({
      data: {
        title: `Juego Interactivo: ${gameConfig.gameTitle}`,
        content: `
## 🎮 ${gameConfig.gameTitle}

${gameConfig.gameDescription}

### Objetivos de Aprendizaje:
- Explorar conceptos de ${gameConfig.category.toLowerCase()}
- Desarrollar habilidades de resolución de problemas
- Aprender de manera interactiva y divertida

### Instrucciones:
1. Haz clic en "Jugar" para comenzar
2. Sigue las instrucciones en pantalla
3. Experimenta y diviértete aprendiendo
4. Completa los desafíos para obtener puntos

¡Prepárate para una aventura educativa increíble! 🚀
        `.trim(),
        subjectId: subject.id,
        orderIndex: 1,
        estimatedDuration: gameConfig.duration
      }
    });
    
    // Crear AIGame
    const aiGame = await prisma.aIGame.create({
      data: {
        title: gameConfig.gameTitle,
        description: gameConfig.gameDescription,
        htmlContent: gamesHTML[gameConfig.htmlFile] || createFallbackHTML(gameConfig),
        gameType: gameConfig.gameType,
        difficulty: gameConfig.difficulty,
        isActive: true,
        subtopicId: subtopic.id,
        createdBy: teacher.id,
        tags: [gameConfig.category, gameConfig.level, gameConfig.gameType, 'interactivo', 'educativo'],
        metadata: {
          originalFile: gameConfig.htmlFile,
          category: gameConfig.category,
          level: gameConfig.level,
          duration: gameConfig.duration,
          version: '1.0.0',
          created: new Date().toISOString()
        }
      }
    });
    
    console.log(`    🎮 Juego integrado: ${aiGame.title}`);
  }
}

/**
 * 🎓 Inscribir estudiante en todos los cursos
 */
async function enrollStudent(student) {
  console.log('\n🎓 Inscribiendo estudiante en cursos...');
  
  const subjects = await prisma.subject.findMany();
  
  for (const subject of subjects) {
    await prisma.enrollment.create({
      data: {
        userId: student.id,
        subjectId: subject.id,
        enrollmentDate: new Date(),
        status: 'active'
      }
    });
    
    console.log(`  ✅ Inscrito en: ${subject.name}`);
  }
}

/**
 * 📋 Crear contenido de ejemplo adicional
 */
async function createSampleContent() {
  console.log('\n📋 Creando contenido adicional...');
  
  // Crear un grado de ejemplo
  const grade = await prisma.grade.upsert({
    where: { name: 'Educación Digital' },
    update: {},
    create: {
      name: 'Educación Digital',
      description: 'Grado enfocado en aprendizaje digital y tecnologías emergentes'
    }
  });
  
  console.log(`  ✅ Grado creado: ${grade.name}`);
  
  // Crear progreso inicial para el estudiante
  const subjects = await prisma.subject.findMany();
  const student = await prisma.user.findUnique({ 
    where: { email: USERS_CONFIG.student.email } 
  });
  
  for (const subject of subjects) {
    const subtopics = await prisma.subtopic.findMany({ 
      where: { subjectId: subject.id } 
    });
    
    for (const subtopic of subtopics) {
      await prisma.progress.create({
        data: {
          userId: student.id,
          subtopicId: subtopic.id,
          isCompleted: false,
          completionPercentage: 0,
          timeSpent: 0
        }
      });
    }
  }
  
  console.log(`  ✅ Progreso inicial creado para ${subjects.length} cursos`);
}

// 🚀 Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

export default main;
