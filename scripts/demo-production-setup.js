#!/usr/bin/env node

/**
 * 🎬 Demo del Setup de Producción
 * 
 * Script de demostración que muestra cómo usar todos los comandos
 * de poblamiento de producción
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runCommand(command, description) {
  try {
    colorLog('cyan', `\n🔄 ${description}`);
    colorLog('blue', `   Ejecutando: ${command}`);
    
    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(command);
    const duration = Date.now() - startTime;
    
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      colorLog('yellow', `⚠️  Warnings: ${stderr}`);
    }
    
    colorLog('green', `✅ Completado en ${duration}ms\n`);
    await sleep(1000); // Pausa para mejor legibilidad
    
  } catch (error) {
    colorLog('red', `❌ Error ejecutando: ${command}`);
    colorLog('red', `   ${error.message}`);
    throw error;
  }
}

async function demoSetup() {
  try {
    colorLog('magenta', `
╔════════════════════════════════════════════════╗
║                                                ║
║      🎬 DEMO - SETUP DE PRODUCCIÓN 🎮          ║
║                                                ║
║   Este demo mostrará todos los comandos        ║
║   disponibles para el setup de producción      ║
║                                                ║
╚════════════════════════════════════════════════╝
    `);

    await sleep(2000);

    colorLog('bright', '📋 COMANDOS DISPONIBLES:');
    console.log('  🌱 npm run populate:production  - Poblar base de datos');
    console.log('  🔍 npm run verify:production    - Verificar datos');
    console.log('  🧹 npm run reset:production     - Limpiar base de datos (interactivo)');
    console.log('  ⚡ npm run setup:production     - Poblar + verificar');
    console.log('  🆕 npm run fresh:production     - Reset + setup completo');

    await sleep(2000);

    // Preguntar al usuario qué quiere hacer
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (question) => {
      return new Promise((resolve) => {
        rl.question(question, resolve);
      });
    };

    colorLog('yellow', '\n🤔 ¿Qué te gustaría hacer?');
    console.log('  1️⃣  Demo completo (populate + verify)');
    console.log('  2️⃣  Solo verificar datos existentes');
    console.log('  3️⃣  Mostrar estructura de archivos');
    console.log('  4️⃣  Salir');

    const choice = await askQuestion('\nElige una opción (1-4): ');
    rl.close();

    switch(choice.trim()) {
      case '1':
        await demoCompleto();
        break;
      case '2':
        await demoVerify();
        break;
      case '3':
        await showFileStructure();
        break;
      case '4':
        colorLog('green', '👋 ¡Hasta luego!');
        break;
      default:
        colorLog('red', '❌ Opción no válida');
    }

  } catch (error) {
    colorLog('red', `💥 Error en el demo: ${error.message}`);
  }
}

async function demoCompleto() {
  colorLog('bright', '\n🚀 INICIANDO DEMO COMPLETO...\n');

  try {
    // 1. Verificar prerrequisitos
    colorLog('blue', '1️⃣  Verificando prerrequisitos...');
    await checkPrerequisites();

    // 2. Poblar base de datos
    await runCommand(
      'npm run populate:production',
      'Poblando base de datos con cursos y juegos'
    );

    // 3. Verificar datos
    await runCommand(
      'npm run verify:production',
      'Verificando que todos los datos se crearon correctamente'
    );

    colorLog('green', `
🎉 ¡DEMO COMPLETADO EXITOSAMENTE! 🎉

✅ Base de datos poblada con:
   👨‍🏫 1 Profesor
   👨‍🎓 1 Estudiante  
   📚 4 Cursos educativos
   🎮 4 Juegos integrados

🔐 Credenciales creadas:
   Profesor: profesor@arandu.com / ProfesorSeguro123!
   Estudiante: estudiante@arandu.com / EstudianteSeguro123!

🌐 Tu plataforma está lista para usar!
    `);

  } catch (error) {
    colorLog('red', `❌ Error durante el demo: ${error.message}`);
  }
}

async function demoVerify() {
  colorLog('bright', '\n🔍 VERIFICANDO DATOS EXISTENTES...\n');
  
  await runCommand(
    'npm run verify:production',
    'Verificando estado actual de la base de datos'
  );
}

async function checkPrerequisites() {
  const checks = [
    {
      command: 'node --version',
      name: 'Node.js',
      required: true
    },
    {
      command: 'npx prisma --version',
      name: 'Prisma CLI',
      required: true
    },
    {
      command: 'ls src/components/AIGame/examples/juegos/',
      name: 'Archivos de juegos',
      required: false
    }
  ];

  for (const check of checks) {
    try {
      const { stdout } = await execAsync(check.command);
      colorLog('green', `  ✅ ${check.name}: OK`);
      if (check.name === 'Node.js') {
        console.log(`     Version: ${stdout.trim()}`);
      }
    } catch (error) {
      const symbol = check.required ? '❌' : '⚠️';
      colorLog(check.required ? 'red' : 'yellow', `  ${symbol} ${check.name}: ${error.message.split('\n')[0]}`);
      
      if (check.required) {
        throw new Error(`Prerrequisito faltante: ${check.name}`);
      }
    }
  }
}

async function showFileStructure() {
  colorLog('bright', '\n📁 ESTRUCTURA DE ARCHIVOS DEL PROYECTO:\n');

  const structure = `
📦 SchoolAI/
├── 🎮 src/components/AIGame/examples/juegos/
│   ├── 🔗 Ethereum Learning.html      (78KB - Aventura Blockchain)
│   ├── 🌱 fotosintesis.html          (25KB - Lab. Fotosíntesis) 
│   ├── 🤖 gameAI.html                (56KB - IA Interactiva)
│   └── ⛓️  gameBlokchin.html         (43KB - Constructor Blockchain)
├── 📜 scripts/
│   ├── 🌱 populate-production-games.js   (Poblar datos)
│   ├── 🔍 verify-production-data.js      (Verificar datos)
│   ├── 🧹 reset-production-data.js       (Limpiar datos)
│   └── 🎬 demo-production-setup.js       (Este demo)
├── 📋 package.json                       (Scripts NPM)
├── 🗂️  prisma/schema.prisma             (Esquema de BD)
└── 📖 PRODUCTION_SETUP.md               (Documentación)

🎯 COMANDOS DISPONIBLES:
┌─────────────────────────────────────────────────────────┐
│ npm run setup:production     - Setup completo           │
│ npm run populate:production  - Solo poblar              │  
│ npm run verify:production    - Solo verificar           │
│ npm run reset:production     - Limpiar (interactivo)    │
│ npm run fresh:production     - Reset + setup            │
└─────────────────────────────────────────────────────────┘
  `;

  console.log(structure);

  colorLog('cyan', '\n💡 PRÓXIMOS PASOS:');
  console.log('  1. Configurar variables de entorno (DATABASE_URL)');
  console.log('  2. Ejecutar: npm run setup:production');
  console.log('  3. Acceder a la plataforma con las credenciales generadas');
  console.log('  4. ¡Disfrutar de los juegos educativos! 🎮');
}

// Ejecutar el demo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  demoSetup().catch(error => {
    colorLog('red', `💥 Error fatal: ${error.message}`);
    process.exit(1);
  });
}

export default demoSetup;
