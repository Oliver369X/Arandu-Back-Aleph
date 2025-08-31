# 🎮 Sistema de Juegos Educativos con IA

## Descripción General

El módulo **AIGame** es un sistema innovador que genera automáticamente juegos educativos personalizados usando agentes de inteligencia artificial especializados. Cada agente está diseñado para crear un tipo específico de juego adaptado al contenido educativo.

## 🤖 Agentes Disponibles

### Agentes Especializados (6)

1. **🔤 WordSearch Agent** (`wordsearch`)
   - Genera sopas de letras temáticas
   - Extrae palabras clave del tema
   - Adaptable por dificultad (grilla 10x10 a 15x15)

2. **❓ Quiz Agent** (`quiz`)
   - Crea quizzes de opción múltiple
   - Preguntas contextuales con explicaciones
   - Soporte para temas específicos (blockchain, avalanche)

3. **🧠 Memory Agent** (`memory`)
   - Juegos de memoria con pares conceptuales
   - Relaciona conceptos con definiciones
   - Interfaz de cartas interactiva

4. **🧩 Puzzle Agent** (`puzzle`)
   - Rompecabezas numéricos deslizantes
   - Diferentes tamaños según dificultad
   - Mecánica clásica de 15-puzzle

5. **📝 Crossword Agent** (`crossword`)
   - Crucigramas educativos
   - Pistas relacionadas al tema
   - Colocación inteligente de palabras

6. **🔗 Matching Agent** (`matching`)
   - Emparejar conceptos con definiciones
   - Drag & drop interactivo
   - Retroalimentación inmediata

### Agentes Libres (3)

7. **🎯 Three.js Agent** (`threejs`)
   - Experiencias 3D interactivas
   - Visualizaciones complejas
   - Controles de mouse y teclado

8. **🎨 Pixi.js Agent** (`pixijs`)
   - Juegos 2D con partículas
   - Animaciones fluidas
   - Interactividad táctil

9. **🧠 Adaptive Agent** (`adaptive`)
   - **Agente inteligente que selecciona automáticamente**
   - Analiza el contenido educativo
   - Elige el mejor tipo de juego
   - Fallback automático si falla

## 🏗️ Arquitectura

```
AIGame/
├── agents/
│   ├── specialized/          # Agentes para tipos específicos
│   │   ├── wordSearchAgent.js
│   │   ├── quizAgent.js
│   │   ├── memoryAgent.js
│   │   ├── puzzleAgent.js
│   │   ├── crosswordAgent.js
│   │   └── matchingAgent.js
│   ├── free/                 # Agentes libres y adaptativo
│   │   ├── threejsAgent.js
│   │   ├── pixijsAgent.js
│   │   └── adaptiveAgent.js
│   └── gameAgentManager.js   # Coordinador principal
├── examples/                 # Plantillas HTML base
│   ├── wordsearch-template.html
│   ├── quiz-template.html
│   └── [otros templates]
├── dto/                      # Validación de datos
│   └── aiGame.dto.js
├── aiGame.models.js          # Modelos de base de datos
├── aiGame.controllers.js     # Controladores de API
├── aiGame.routes.js          # Rutas de endpoints
├── aiGame.swagger.js         # Documentación API
└── README.md                 # Esta documentación
```

## 📊 Base de Datos

### Modelo AIGame

```sql
CREATE TABLE ai_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subtopic_id UUID NOT NULL REFERENCES subtopics(id),
  game_type VARCHAR(50) NOT NULL,
  agent_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  html_content TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
  estimated_time INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 API Endpoints

### Gestión de Juegos

- `GET /api-v1/ai-games` - Listar todos los juegos
- `GET /api-v1/ai-games/{id}` - Obtener juego por ID
- `POST /api-v1/ai-games` - Crear juego manualmente
- `PUT /api-v1/ai-games` - Actualizar juego
- `DELETE /api-v1/ai-games/{id}` - Eliminar juego

### Filtros y Búsqueda

- `GET /api-v1/ai-games/subtopic/{subtopicId}` - Juegos por subtema
- `GET /api-v1/ai-games/tipo/{gameType}` - Juegos por tipo
- `GET /api-v1/ai-games/populares?limit=10` - Juegos más jugados

### Gameplay

- `GET /api-v1/ai-games/{id}/play` - Obtener juego para jugar

### Estadísticas

- `GET /api-v1/ai-games/estadisticas` - Estadísticas generales

### 🤖 Generación con IA

- `POST /api-v1/ai-games/generate/{subtopicId}` - **Generar juego automáticamente**

#### Ejemplo de Generación

```javascript
// Generar juego automáticamente (agente adaptativo)
POST /api-v1/ai-games/generate/550e8400-e29b-41d4-a716-446655440000
{
  "difficulty": "medium",
  "customPrompt": "Crear un juego sobre blockchain para principiantes",
  "language": "es"
}

// Generar tipo específico
POST /api-v1/ai-games/generate/550e8400-e29b-41d4-a716-446655440000
{
  "gameType": "quiz",
  "difficulty": "hard",
  "focus": "Smart contracts"
}
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Test completo del sistema AIGame
npm run test:aigame

# Tests individuales
node scripts/test-aigame.js
```

### Tipos de Tests

1. **Generación de Agentes**: Prueba cada uno de los 9 agentes
2. **Validación de Juegos**: Verifica HTML, metadatos, estructura
3. **API Endpoints**: Prueba conectividad y respuestas
4. **Rendimiento**: Mide tiempos de generación

## 🎯 Uso del Sistema

### 1. Generación Automática (Recomendado)

```javascript
// El agente adaptativo analiza el tema y selecciona el mejor juego
const response = await fetch('/api-v1/ai-games/generate/subtopic-id', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    difficulty: 'medium',
    language: 'es'
  })
});
```

### 2. Generación Específica

```javascript
// Forzar un tipo específico de juego
const response = await fetch('/api-v1/ai-games/generate/subtopic-id', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gameType: 'wordsearch',
    difficulty: 'easy'
  })
});
```

### 3. Integración en Frontend

```javascript
// Obtener juegos de un subtema
const games = await fetch('/api-v1/ai-games/subtopic/subtopic-id');

// Jugar un juego específico
const gameData = await fetch('/api-v1/ai-games/game-id/play');

// Renderizar HTML del juego
document.getElementById('game-container').innerHTML = gameData.htmlContent;
```

## 🎨 Personalización

### Agregar Nuevo Agente

1. Crear archivo en `agents/specialized/` o `agents/free/`
2. Implementar interfaz estándar:

```javascript
export const newAgent = {
  name: 'Mi Nuevo Agente',
  description: 'Descripción del agente',
  type: 'specialized', // o 'free'
  gameType: 'mi-tipo',
  capabilities: ['cap1', 'cap2'],
  estimatedTime: '5-10 minutos',

  async generateGame(gameContext) {
    // Lógica de generación
    return {
      success: true,
      gameType: 'mi-tipo',
      title: 'Título del juego',
      description: 'Descripción',
      instructions: 'Instrucciones',
      htmlContent: '<html>...</html>',
      estimatedTime: 10,
      tokensUsed: 0
    };
  }
};
```

3. Registrar en `gameAgentManager.js`
4. Agregar a tests y documentación

### Modificar Plantillas

Las plantillas HTML están en `examples/`. Usan placeholders como:
- `{{GAME_TITLE}}`
- `{{GAME_DESCRIPTION}}`
- `{{WORDS_ARRAY}}`
- `{{QUIZ_DATA}}`

## 🔧 Configuración

### Variables de Entorno

```env
# Base de datos (ya configurado en el proyecto)
DATABASE_URL="postgresql://..."

# Opcional: APIs externas para IA
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="..."
```

### Configuración de Agentes

Cada agente puede configurarse individualmente:

```javascript
// En el agente
getGameConfig(difficulty) {
  const configs = {
    easy: { /* config fácil */ },
    medium: { /* config medio */ },
    hard: { /* config difícil */ }
  };
  return configs[difficulty] || configs.medium;
}
```

## 📈 Métricas y Analytics

El sistema registra automáticamente:

- **Conteo de jugadas** (`play_count`)
- **Tiempo de generación**
- **Tipo de agente utilizado**
- **Tasa de éxito de generación**
- **Juegos más populares**

## 🚨 Manejo de Errores

### Códigos de Error Comunes

- `SUBTOPIC_NOT_FOUND`: Subtema no existe
- `AGENT_NOT_FOUND`: Tipo de agente no válido
- `GENERATION_ERROR`: Error en generación
- `VALIDATION_FAILED`: Juego no cumple requisitos
- `TEMPLATE_NOT_FOUND`: Plantilla HTML no encontrada

### Fallback Automático

El agente adaptativo incluye fallback automático:
1. Intenta con agente seleccionado
2. Si falla, usa agente alternativo
3. Si todo falla, usa quiz básico

## 🎓 Casos de Uso Educativos

### Por Materia

- **Blockchain/Crypto**: Quiz técnicos, visualizaciones 3D
- **Matemáticas**: Puzzles lógicos, juegos de memoria
- **Historia**: Crucigramas, matching de fechas
- **Ciencias**: Simulaciones 3D, experimentos interactivos
- **Idiomas**: Sopas de letras, matching de vocabulario

### Por Edad

- **Niños (6-12)**: Memory, puzzles simples, sopas de letras
- **Adolescentes (13-17)**: Quiz, crucigramas, juegos 2D
- **Adultos (18+)**: Simulaciones 3D, juegos complejos

## 🔮 Roadmap Futuro

### Próximas Funcionalidades

1. **Integración con IA Externa** (GPT-4, Claude)
2. **Generación de Imágenes** para juegos visuales
3. **Multijugador** en tiempo real
4. **Analytics Avanzados** de aprendizaje
5. **Adaptación Automática** basada en rendimiento
6. **Exportación** a formatos estándar (SCORM, xAPI)

### Mejoras Planificadas

- **Más tipos de juego**: Simulaciones, RPG educativos
- **IA más inteligente**: Análisis semántico del contenido
- **Personalización**: Estilos visuales por institución
- **Accesibilidad**: Soporte para discapacidades
- **Móvil**: Optimización para dispositivos táctiles

---

## 📞 Soporte

Para dudas o problemas:

1. Revisar logs en consola del navegador
2. Verificar que el backend esté corriendo
3. Probar endpoints con Swagger UI: `http://localhost:3001/api-docs`
4. Ejecutar tests: `npm run test:aigame`

**¡El sistema está listo para generar juegos educativos innovadores! 🎮📚**
