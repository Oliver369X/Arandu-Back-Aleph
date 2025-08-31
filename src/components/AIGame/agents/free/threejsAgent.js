export const threejsAgent = {
  name: 'Agente Three.js 3D',
  description: 'Crea experiencias educativas 3D interactivas usando Three.js',
  type: 'free',
  gameType: 'threejs',
  capabilities: ['Gráficos 3D', 'Interactividad espacial', 'Visualizaciones complejas'],
  estimatedTime: '10-20 minutos',

  async generateGame(gameContext) {
    try {
      console.log(`🎮 [ThreeJSAgent] Generando experiencia 3D para: ${gameContext.subtopic.name}`);

      const config = this.getGameConfig(gameContext.options.difficulty);
      const htmlContent = this.generateHTML(gameContext, config);
      const metadata = this.createGameMetadata(gameContext, config);

      return {
        success: true,
        gameType: 'threejs',
        title: metadata.title,
        description: metadata.description,
        instructions: metadata.instructions,
        htmlContent: htmlContent,
        estimatedTime: config.estimatedTime,
        tokensUsed: 0
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error en generación de experiencia 3D',
        code: 'GENERATION_ERROR',
        details: error.message
      };
    }
  },

  getGameConfig(difficulty) {
    const configs = {
      easy: { complexity: 'basic', objects: 5, estimatedTime: 10 },
      medium: { complexity: 'intermediate', objects: 10, estimatedTime: 15 },
      hard: { complexity: 'advanced', objects: 15, estimatedTime: 20 }
    };
    return configs[difficulty] || configs.medium;
  },

  generateHTML(gameContext, config) {
    const metadata = this.createGameMetadata(gameContext, config);
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${metadata.title}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            font-family: Arial, sans-serif;
            overflow: hidden;
        }
        
        .game-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
        }
        
        .game-header {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 10px;
            pointer-events: auto;
        }
        
        .game-title {
            color: #333;
            font-size: 1.8em;
            margin: 0 0 10px 0;
        }
        
        .game-description {
            color: #666;
            margin-bottom: 10px;
        }
        
        .instructions {
            background: #e3f2fd;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #2196f3;
            font-size: 0.9em;
        }
        
        .game-controls {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 15px;
            border-radius: 10px;
            pointer-events: auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .control-btn {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
        }
        
        .control-btn:hover {
            background: #0056b3;
        }
        
        .info-panel {
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border-radius: 5px;
        }
        
        #canvas-container {
            width: 100vw;
            height: 100vh;
        }
    </style>
</head>
<body>
    <div id="canvas-container"></div>
    
    <div class="game-overlay">
        <div class="game-header">
            <h1 class="game-title">${metadata.title}</h1>
            <p class="game-description">${metadata.description}</p>
            <div class="instructions">
                <strong>Instrucciones:</strong> ${metadata.instructions}
            </div>
        </div>
        
        <div class="game-controls">
            <div class="info-panel">
                <div>Objetos: <span id="objectCount">0</span></div>
                <div>Rotación: <span id="rotationInfo">Automática</span></div>
            </div>
            <div>
                <button class="control-btn" onclick="toggleRotation()">Pausar/Reanudar</button>
                <button class="control-btn" onclick="resetView()">Reiniciar Vista</button>
                <button class="control-btn" onclick="changeColors()">Cambiar Colores</button>
            </div>
        </div>
    </div>

    <script>
        // Variables globales de Three.js
        let scene, camera, renderer, controls;
        let objects = [];
        let isRotating = true;
        let animationId;

        // Configuración del tema
        const topicName = "${gameContext.subtopic.name}";
        const objectCount = ${config.objects};

        function init() {
            // Crear escena
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x222222);

            // Crear cámara
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 0, 10);

            // Crear renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            document.getElementById('canvas-container').appendChild(renderer.domElement);

            // Agregar luces
            addLights();

            // Crear objetos educativos
            createEducationalObjects();

            // Agregar controles de mouse
            addMouseControls();

            // Iniciar animación
            animate();

            // Actualizar contador
            document.getElementById('objectCount').textContent = objects.length;

            // Manejar redimensionamiento
            window.addEventListener('resize', onWindowResize);
        }

        function addLights() {
            // Luz ambiental
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            scene.add(ambientLight);

            // Luz direccional
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 10, 5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            // Luz puntual
            const pointLight = new THREE.PointLight(0xff6b6b, 0.5, 100);
            pointLight.position.set(-10, -10, -10);
            scene.add(pointLight);
        }

        function createEducationalObjects() {
            const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff];
            const geometries = [
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.SphereGeometry(0.7, 32, 32),
                new THREE.ConeGeometry(0.7, 1.5, 32),
                new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32),
                new THREE.OctahedronGeometry(0.8),
                new THREE.TetrahedronGeometry(0.8),
                new THREE.TorusGeometry(0.6, 0.2, 16, 100)
            ];

            for (let i = 0; i < objectCount; i++) {
                const geometry = geometries[i % geometries.length];
                const material = new THREE.MeshPhongMaterial({ 
                    color: colors[i % colors.length],
                    shininess: 100
                });
                
                const mesh = new THREE.Mesh(geometry, material);
                
                // Posición aleatoria
                mesh.position.set(
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 15
                );
                
                // Rotación aleatoria
                mesh.rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                );
                
                // Propiedades de animación
                mesh.userData = {
                    originalPosition: mesh.position.clone(),
                    rotationSpeed: {
                        x: (Math.random() - 0.5) * 0.02,
                        y: (Math.random() - 0.5) * 0.02,
                        z: (Math.random() - 0.5) * 0.02
                    },
                    floatSpeed: Math.random() * 0.01 + 0.005,
                    floatOffset: Math.random() * Math.PI * 2
                };
                
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                
                scene.add(mesh);
                objects.push(mesh);
            }

            // Agregar texto 3D con el nombre del tema
            addText3D(topicName);
        }

        function addText3D(text) {
            // Crear geometría de texto simple usando formas básicas
            const textGroup = new THREE.Group();
            
            // Simular texto con cubos (placeholder)
            for (let i = 0; i < text.length && i < 10; i++) {
                const geometry = new THREE.BoxGeometry(0.3, 0.5, 0.1);
                const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
                const cube = new THREE.Mesh(geometry, material);
                
                cube.position.set((i - text.length/2) * 0.4, 5, 0);
                textGroup.add(cube);
            }
            
            scene.add(textGroup);
            objects.push(textGroup);
        }

        function addMouseControls() {
            let mouseX = 0, mouseY = 0;
            
            document.addEventListener('mousemove', (event) => {
                mouseX = (event.clientX / window.innerWidth) * 2 - 1;
                mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
                
                // Mover cámara ligeramente con el mouse
                camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
                camera.position.y += (mouseY * 2 - camera.position.y) * 0.02;
                camera.lookAt(scene.position);
            });

            // Click para interactuar con objetos
            document.addEventListener('click', onObjectClick);
        }

        function onObjectClick(event) {
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(objects);
            
            if (intersects.length > 0) {
                const object = intersects[0].object;
                
                // Animar objeto clickeado
                const originalScale = object.scale.clone();
                object.scale.multiplyScalar(1.2);
                
                setTimeout(() => {
                    object.scale.copy(originalScale);
                }, 200);
                
                // Cambiar color temporalmente
                if (object.material) {
                    const originalColor = object.material.color.clone();
                    object.material.color.setHex(0xffffff);
                    
                    setTimeout(() => {
                        object.material.color.copy(originalColor);
                    }, 300);
                }
            }
        }

        function animate() {
            animationId = requestAnimationFrame(animate);

            if (isRotating) {
                // Animar objetos
                objects.forEach((obj, index) => {
                    if (obj.userData && obj.userData.rotationSpeed) {
                        obj.rotation.x += obj.userData.rotationSpeed.x;
                        obj.rotation.y += obj.userData.rotationSpeed.y;
                        obj.rotation.z += obj.userData.rotationSpeed.z;
                        
                        // Movimiento flotante
                        const time = Date.now() * obj.userData.floatSpeed;
                        obj.position.y = obj.userData.originalPosition.y + Math.sin(time + obj.userData.floatOffset) * 0.5;
                    }
                });

                // Rotar cámara lentamente alrededor del centro
                const time = Date.now() * 0.0005;
                camera.position.x = Math.cos(time) * 10;
                camera.position.z = Math.sin(time) * 10;
                camera.lookAt(scene.position);
            }

            renderer.render(scene, camera);
        }

        function toggleRotation() {
            isRotating = !isRotating;
            document.getElementById('rotationInfo').textContent = isRotating ? 'Automática' : 'Pausada';
        }

        function resetView() {
            camera.position.set(0, 0, 10);
            camera.lookAt(scene.position);
        }

        function changeColors() {
            objects.forEach(obj => {
                if (obj.material && obj.material.color) {
                    obj.material.color.setHex(Math.random() * 0xffffff);
                }
            });
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // Inicializar cuando se carga la página
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>`;
  },

  createGameMetadata(gameContext, config) {
    const { subtopic } = gameContext;
    return {
      title: `Exploración 3D: ${subtopic.name}`,
      description: `Explora conceptos de ${subtopic.name} en un entorno 3D interactivo con ${config.objects} objetos educativos.`,
      instructions: `Mueve el mouse para controlar la vista. Haz clic en los objetos para interactuar con ellos. Usa los botones para controlar la animación.`
    };
  }
};

export default threejsAgent;
