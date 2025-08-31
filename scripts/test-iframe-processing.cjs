const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testIframeProcessing() {
  console.log('🔍 Probando el procesamiento de HTML del GameIframe...\n');

  try {
    // Buscar el juego de sopa de letras
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

    console.log(`🎮 Juego: ${wordSearchGame.title}`);
    
    // Procesar el HTML EXACTAMENTE como lo hace GameIframe
    const originalHtml = wordSearchGame.htmlContent;
    
    console.log('\n🔧 PROCESANDO HTML COMO GameIframe...');
    
    const processedHtml = originalHtml
      // Asegurar viewport meta tag
      .replace(
        '<head>',
        '<head><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">'
      )
      // Agregar estilos para prevenir scroll
      .replace(
        '<body',
        '<body style="margin:0;padding:0;overflow:hidden;"'
      )
      // Agregar script para comunicación con parent
      .replace(
        '</body>',
        `
      <script>
        // Función para enviar mensajes al parent
        function sendMessageToParent(type, payload) {
          try {
            window.parent.postMessage({ type, payload }, '*');
          } catch (error) {
            console.error('Error enviando mensaje al parent:', error);
          }
        }
        
        // Notificar que el juego está listo
        window.addEventListener('load', function() {
          sendMessageToParent('GAME_READY', { timestamp: Date.now() });
        });
        
        // Escuchar mensajes del parent
        window.addEventListener('message', function(event) {
          if (event.data.type === 'PARENT_READY') {
            console.log('Parent está listo para recibir mensajes');
          }
        });
        
        // Prevenir context menu
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
        });
        
        // Prevenir selección de texto
        document.addEventListener('selectstart', function(e) {
          e.preventDefault();
        });
      </script>
      </body>`
    );

    console.log(`📏 HTML Original: ${Math.round(originalHtml.length / 1024)}KB`);
    console.log(`📏 HTML Procesado: ${Math.round(processedHtml.length / 1024)}KB`);
    
    // Verificar qué cambios se hicieron
    console.log('\n🔍 VERIFICANDO CAMBIOS:');
    
    const hasViewport = processedHtml.includes('width=device-width, initial-scale=1.0, user-scalable=no');
    console.log(`📱 Viewport agregado: ${hasViewport ? '✅' : '❌'}`);
    
    const hasBodyStyles = processedHtml.includes('style="margin:0;padding:0;overflow:hidden;"');
    console.log(`🎨 Estilos de body: ${hasBodyStyles ? '✅' : '❌'}`);
    
    const hasParentComm = processedHtml.includes('sendMessageToParent');
    console.log(`📡 Comunicación parent: ${hasParentComm ? '✅' : '❌'}`);
    
    const hasTwoScripts = (processedHtml.match(/<script>/g) || []).length;
    console.log(`⚡ Scripts totales: ${hasTwoScripts}`);
    
    // Verificar si hay conflictos potenciales
    console.log('\n⚠️  VERIFICANDO CONFLICTOS POTENCIALES:');
    
    // Doble viewport
    const viewportCount = (processedHtml.match(/viewport/g) || []).length;
    if (viewportCount > 1) {
      console.log(`🔄 CONFLICTO: Múltiples viewport tags (${viewportCount})`);
    }
    
    // Doble body style
    const bodyStyleCount = (processedHtml.match(/style="[^"]*margin:0/g) || []).length;
    if (bodyStyleCount > 1) {
      console.log(`🔄 CONFLICTO: Múltiples estilos de body (${bodyStyleCount})`);
    }
    
    // Verificar si el HTML original ya tenía elementos que GameIframe intenta agregar
    if (originalHtml.includes('viewport')) {
      console.log('⚠️ CONFLICTO POTENCIAL: HTML original ya tiene viewport');
    }
    
    if (originalHtml.includes('overflow:hidden') || originalHtml.includes('margin:0')) {
      console.log('⚠️ CONFLICTO POTENCIAL: HTML original ya tiene estilos de body');
    }

    // Exportar el HTML procesado
    const processedPath = path.join(__dirname, '../temp/debug-processed-game.html');
    fs.writeFileSync(processedPath, processedHtml);
    console.log(`\n✅ HTML procesado exportado a: ${processedPath}`);
    
    // Crear un HTML de test del iframe
    const iframeTestHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test GameIframe</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial; }
    .iframe-container {
      width: 800px;
      height: 600px;
      border: 2px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <h2>🧪 Test del GameIframe</h2>
  <p>Este iframe simula exactamente lo que hace el componente GameIframe:</p>
  <div class="iframe-container">
    <iframe 
      srcdoc="${processedHtml.replace(/"/g, '&quot;').replace(/\n/g, '')}"
      sandbox="allow-scripts allow-same-origin allow-forms"
      title="Test Juego">
    </iframe>
  </div>
  
  <script>
    // Escuchar mensajes del iframe (como hace GameIframe)
    window.addEventListener('message', function(event) {
      console.log('🎮 [Parent] Mensaje recibido del iframe:', event.data);
      
      // Si el juego está listo, enviar confirmación
      if (event.data.type === 'GAME_READY') {
        setTimeout(() => {
          const iframe = document.querySelector('iframe');
          iframe.contentWindow.postMessage({
            type: 'PARENT_READY',
            payload: { timestamp: Date.now() }
          }, '*');
        }, 100);
      }
    });
  </script>
</body>
</html>`;

    const iframeTestPath = path.join(__dirname, '../temp/test-iframe-game.html');
    fs.writeFileSync(iframeTestPath, iframeTestHtml);
    console.log(`✅ Test de iframe creado: ${iframeTestPath}`);
    
    console.log('\n🎯 SIGUIENTES PASOS:');
    console.log('1. ¿Funciona el juego en el HTML original? (ya abierto)');
    console.log('2. Abrir el test de iframe para ver si funciona ahí');
    console.log('3. Comparar ambos resultados');
    console.log('\n💡 Si funciona en original pero no en iframe = Problema en iframe');
    console.log('💡 Si no funciona en ninguno = Problema en JavaScript del juego');

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
testIframeProcessing();
