const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportGameHTML() {
  console.log('📄 Exportando HTML de juego para debug...\n');

  try {
    // Buscar el juego de sopa de letras más reciente
    const wordSearchGame = await prisma.aIGame.findFirst({
      where: {
        gameType: 'wordsearch'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!wordSearchGame) {
      console.log('❌ No se encontró juego de sopa de letras');
      return;
    }

    console.log(`🎮 Juego encontrado: ${wordSearchGame.title}`);
    console.log(`📏 Tamaño HTML: ${Math.round(wordSearchGame.htmlContent.length / 1024)}KB`);

    // Exportar el HTML a un archivo para probarlo independientemente
    const outputPath = path.join(__dirname, '../temp/debug-wordsearch-game.html');
    
    // Crear directorio temp si no existe
    const tempDir = path.dirname(outputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Escribir el HTML
    fs.writeFileSync(outputPath, wordSearchGame.htmlContent);
    console.log(`✅ HTML exportado a: ${outputPath}`);

    console.log('\n🔍 ANÁLISIS DEL HTML:');
    
    // Verificar elementos clave
    const html = wordSearchGame.htmlContent;
    
    console.log(`📄 Doctype: ${html.includes('<!DOCTYPE') ? '✅' : '❌'}`);
    console.log(`🏷️ HTML tag: ${html.includes('<html') ? '✅' : '❌'}`);
    console.log(`📋 Head section: ${html.includes('<head>') ? '✅' : '❌'}`);
    console.log(`📝 Body section: ${html.includes('<body>') ? '✅' : '❌'}`);
    console.log(`⚡ JavaScript: ${html.includes('<script>') ? '✅' : '❌'}`);
    console.log(`🎯 Funciones: ${html.includes('function') ? '✅' : '❌'}`);
    
    // Verificar elementos específicos del wordsearch
    console.log(`🔤 Grid table: ${html.includes('table') || html.includes('grid') ? '✅' : '❌'}`);
    console.log(`📋 Word list: ${html.includes('wordList') || html.includes('word') ? '✅' : '❌'}`);
    
    // Buscar posibles errores
    const commonErrors = [
      'undefined',
      'null',
      'error',
      'Error',
      'console.error'
    ];
    
    console.log('\n🐛 POSIBLES ERRORES:');
    commonErrors.forEach(errorTerm => {
      const count = (html.match(new RegExp(errorTerm, 'gi')) || []).length;
      if (count > 0) {
        console.log(`⚠️ "${errorTerm}": encontrado ${count} veces`);
      }
    });

    // Mostrar el inicio del HTML
    console.log('\n📋 INICIO DEL HTML:');
    console.log('---');
    console.log(html.substring(0, 800) + '...');
    console.log('---');

    // Mostrar la sección de JavaScript
    const scriptStart = html.indexOf('<script>');
    if (scriptStart !== -1) {
      console.log('\n⚡ SECCIÓN JAVASCRIPT:');
      console.log('---');
      const scriptSection = html.substring(scriptStart, scriptStart + 1000);
      console.log(scriptSection + '...');
      console.log('---');
    }

    console.log('\n🎯 INSTRUCCIONES PARA DEBUG:');
    console.log('1. Abrir el archivo HTML exportado en un navegador');
    console.log('2. Abrir DevTools (F12) y ver la consola');
    console.log('3. Verificar si hay errores JavaScript');
    console.log('4. Si funciona en navegador, el problema está en el iframe');

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
exportGameHTML();
