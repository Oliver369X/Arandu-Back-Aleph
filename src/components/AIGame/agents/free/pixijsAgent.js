export const pixijsAgent = {
  name: 'Agente Pixi.js 2D',
  description: 'Crea juegos 2D interactivos y animaciones educativas usando Pixi.js',
  type: 'free',
  gameType: 'pixijs',
  capabilities: ['Gráficos 2D avanzados', 'Animaciones fluidas', 'Interactividad táctil'],
  estimatedTime: '8-15 minutos',

  async generateGame(gameContext) {
    try {
      console.log(`🎨 [PixiJSAgent] Generando experiencia 2D para: ${gameContext.subtopic.name}`);

      const config = this.getGameConfig(gameContext.options.difficulty);
      const htmlContent = this.generateHTML(gameContext, config);
      const metadata = this.createGameMetadata(gameContext, config);

      return {
        success: true,
        gameType: 'pixijs',
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
        error: 'Error en generación de experiencia 2D',
        code: 'GENERATION_ERROR',
        details: error.message
      };
    }
  },

  getGameConfig(difficulty) {
    const configs = {
      easy: { particles: 50, speed: 1, estimatedTime: 8 },
      medium: { particles: 100, speed: 2, estimatedTime: 12 },
      hard: { particles: 200, speed: 3, estimatedTime: 15 }
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/6.5.1/browser/pixi.min.js"></script>
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
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 10px;
            pointer-events: auto;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
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
        
        .game-stats {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            pointer-events: auto;
            min-width: 150px;
        }
        
        .stat-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .game-controls {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px;
            border-radius: 10px;
            pointer-events: auto;
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        
        .control-btn {
            padding: 12px 24px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s ease;
        }
        
        .control-btn:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }
        
        .control-btn:active {
            transform: translateY(0);
        }
        
        #gameCanvas {
            display: block;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="game-overlay">
        <div class="game-header">
            <h1 class="game-title">${metadata.title}</h1>
            <p class="game-description">${metadata.description}</p>
            <div class="instructions">
                <strong>Instrucciones:</strong> ${metadata.instructions}
            </div>
        </div>
        
        <div class="game-stats">
            <div class="stat-item">
                <span>Partículas:</span>
                <span id="particleCount">0</span>
            </div>
            <div class="stat-item">
                <span>Puntuación:</span>
                <span id="score">0</span>
            </div>
            <div class="stat-item">
                <span>Tiempo:</span>
                <span id="timer">00:00</span>
            </div>
        </div>
        
        <div class="game-controls">
            <button class="control-btn" onclick="addParticles()">Agregar Partículas</button>
            <button class="control-btn" onclick="toggleAnimation()">Pausar/Reanudar</button>
            <button class="control-btn" onclick="changeColors()">Cambiar Colores</button>
            <button class="control-btn" onclick="resetGame()">Reiniciar</button>
        </div>
    </div>

    <script>
        // Variables globales de Pixi.js
        let app, stage, graphics;
        let particles = [];
        let isAnimating = true;
        let score = 0;
        let startTime = Date.now();
        let gameTimer;

        // Configuración del juego
        const topicName = "${gameContext.subtopic.name}";
        const maxParticles = ${config.particles};
        const baseSpeed = ${config.speed};

        function init() {
            // Crear aplicación Pixi
            app = new PIXI.Application({
                width: window.innerWidth,
                height: window.innerHeight,
                backgroundColor: 0x1a1a2e,
                antialias: true
            });

            document.body.appendChild(app.view);
            app.view.id = 'gameCanvas';

            stage = app.stage;

            // Crear contenedor de gráficos
            graphics = new PIXI.Graphics();
            stage.addChild(graphics);

            // Crear partículas iniciales
            createInitialParticles();

            // Agregar interactividad
            addInteractivity();

            // Iniciar bucle de animación
            app.ticker.add(animate);

            // Iniciar timer
            startTimer();

            // Manejar redimensionamiento
            window.addEventListener('resize', onResize);

            console.log('Juego Pixi.js inicializado');
        }

        function createInitialParticles() {
            const initialCount = Math.min(20, maxParticles);
            
            for (let i = 0; i < initialCount; i++) {
                createParticle();
            }
            
            updateParticleCount();
        }

        function createParticle() {
            if (particles.length >= maxParticles) return;

            const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff];
            
            const particle = {
                x: Math.random() * app.screen.width,
                y: Math.random() * app.screen.height,
                vx: (Math.random() - 0.5) * baseSpeed * 2,
                vy: (Math.random() - 0.5) * baseSpeed * 2,
                radius: Math.random() * 20 + 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.8 + 0.2,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                scale: Math.random() * 0.5 + 0.5,
                pulseSpeed: Math.random() * 0.05 + 0.02,
                pulsePhase: Math.random() * Math.PI * 2,
                interactive: true,
                clicked: false
            };

            particles.push(particle);
        }

        function addInteractivity() {
            app.view.addEventListener('click', (event) => {
                const rect = app.view.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                // Verificar si se hizo clic en alguna partícula
                particles.forEach(particle => {
                    const dx = x - particle.x;
                    const dy = y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < particle.radius) {
                        // Partícula clickeada
                        particle.clicked = true;
                        particle.vx *= 2;
                        particle.vy *= 2;
                        particle.color = 0xffffff;
                        
                        score += 10;
                        updateScore();

                        // Crear efecto de explosión
                        createExplosion(particle.x, particle.y);

                        setTimeout(() => {
                            particle.clicked = false;
                            particle.color = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57][Math.floor(Math.random() * 5)];
                        }, 500);
                    }
                });

                // Crear nueva partícula en la posición del clic
                if (particles.length < maxParticles) {
                    const newParticle = {
                        x: x,
                        y: y,
                        vx: (Math.random() - 0.5) * baseSpeed * 4,
                        vy: (Math.random() - 0.5) * baseSpeed * 4,
                        radius: Math.random() * 15 + 8,
                        color: 0xffffff,
                        alpha: 1,
                        rotation: 0,
                        rotationSpeed: (Math.random() - 0.5) * 0.2,
                        scale: 1,
                        pulseSpeed: 0.1,
                        pulsePhase: 0,
                        interactive: true,
                        clicked: false
                    };
                    particles.push(newParticle);
                    updateParticleCount();
                }
            });

            // Movimiento del mouse
            app.view.addEventListener('mousemove', (event) => {
                const rect = app.view.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                // Atraer partículas hacia el mouse
                particles.forEach(particle => {
                    const dx = mouseX - particle.x;
                    const dy = mouseY - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        const force = (100 - distance) / 100 * 0.5;
                        particle.vx += (dx / distance) * force * 0.1;
                        particle.vy += (dy / distance) * force * 0.1;
                    }
                });
            });
        }

        function createExplosion(x, y) {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                const speed = 5;
                
                const explosionParticle = {
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: 3,
                    color: 0xffffff,
                    alpha: 1,
                    life: 30,
                    maxLife: 30,
                    rotation: 0,
                    rotationSpeed: 0.2,
                    scale: 1,
                    pulseSpeed: 0,
                    pulsePhase: 0,
                    interactive: false,
                    explosion: true
                };
                
                particles.push(explosionParticle);
            }
        }

        function animate() {
            if (!isAnimating) return;

            graphics.clear();

            // Actualizar y dibujar partículas
            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];

                // Actualizar posición
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Rebotar en los bordes
                if (particle.x < 0 || particle.x > app.screen.width) {
                    particle.vx *= -0.8;
                    particle.x = Math.max(0, Math.min(app.screen.width, particle.x));
                }
                if (particle.y < 0 || particle.y > app.screen.height) {
                    particle.vy *= -0.8;
                    particle.y = Math.max(0, Math.min(app.screen.height, particle.y));
                }

                // Actualizar rotación
                particle.rotation += particle.rotationSpeed;

                // Efecto de pulso
                const time = Date.now() * particle.pulseSpeed;
                const pulse = Math.sin(time + particle.pulsePhase) * 0.2 + 1;
                particle.scale = pulse;

                // Manejar partículas de explosión
                if (particle.explosion) {
                    particle.life--;
                    particle.alpha = particle.life / particle.maxLife;
                    particle.radius *= 0.95;
                    
                    if (particle.life <= 0) {
                        particles.splice(i, 1);
                        continue;
                    }
                }

                // Aplicar fricción
                particle.vx *= 0.99;
                particle.vy *= 0.99;

                // Dibujar partícula
                graphics.beginFill(particle.color, particle.alpha);
                graphics.drawCircle(particle.x, particle.y, particle.radius * particle.scale);
                graphics.endFill();

                // Dibujar borde si está clickeada
                if (particle.clicked) {
                    graphics.lineStyle(2, 0xffffff, 1);
                    graphics.drawCircle(particle.x, particle.y, particle.radius * particle.scale + 5);
                    graphics.lineStyle(0);
                }
            }

            // Dibujar texto del tema
            drawTopicText();
        }

        function drawTopicText() {
            // Crear texto dinámico con partículas
            const text = topicName.toUpperCase();
            const centerX = app.screen.width / 2;
            const centerY = app.screen.height / 2;
            
            graphics.beginFill(0xffffff, 0.1);
            graphics.drawRect(centerX - 200, centerY - 30, 400, 60);
            graphics.endFill();
        }

        function addParticles() {
            for (let i = 0; i < 5; i++) {
                createParticle();
            }
            updateParticleCount();
        }

        function toggleAnimation() {
            isAnimating = !isAnimating;
            if (isAnimating) {
                app.ticker.start();
            } else {
                app.ticker.stop();
            }
        }

        function changeColors() {
            particles.forEach(particle => {
                if (!particle.explosion) {
                    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff];
                    particle.color = colors[Math.floor(Math.random() * colors.length)];
                }
            });
        }

        function resetGame() {
            particles.length = 0;
            score = 0;
            startTime = Date.now();
            
            createInitialParticles();
            updateParticleCount();
            updateScore();
        }

        function updateParticleCount() {
            document.getElementById('particleCount').textContent = particles.filter(p => !p.explosion).length;
        }

        function updateScore() {
            document.getElementById('score').textContent = score;
        }

        function startTimer() {
            gameTimer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('timer').textContent = 
                    \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
            }, 1000);
        }

        function onResize() {
            app.renderer.resize(window.innerWidth, window.innerHeight);
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
      title: `Partículas Interactivas: ${subtopic.name}`,
      description: `Explora ${subtopic.name} a través de un sistema de partículas 2D interactivo con hasta ${config.particles} elementos.`,
      instructions: `Haz clic en las partículas para interactuar con ellas. Mueve el mouse para atraer partículas cercanas. Usa los controles para modificar la experiencia.`
    };
  }
};

export default pixijsAgent;
