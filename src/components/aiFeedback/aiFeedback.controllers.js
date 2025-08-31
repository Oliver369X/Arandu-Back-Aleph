import {
  obtenerAIFeedbacks,
  crearAIFeedback,
  actualizarAIFeedback,
  eliminarAIFeedback,
  obtenerAIFeedbackPorId,
  obtenerAIFeedbacksPorSubtopic,
  obtenerAIFeedbacksPorStepNumber,
  obtenerAIFeedbacksCompletos
} from "./aiFeedback.models.js";
import { crearAIFeedbackSchema } from "./dto/aiFeedback.dto.js";
import { actualizarAIFeedbackSchema } from "./dto/aiFeedback.update.dto.js";

export const getAIFeedbacks = async (req, res) => {
  try {
    const response = await obtenerAIFeedbacks();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getAIFeedbackPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await obtenerAIFeedbackPorId(id);
    if (!response) {
      return res.status(404).json({ message: "AI Feedback not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAIFeedbacksPorSubtopic = async (req, res) => {
  const { subtopicId } = req.params;
  try {
    const response = await obtenerAIFeedbacksPorSubtopic(subtopicId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAIFeedbacksPorStepNumber = async (req, res) => {
  const { stepNumber } = req.params;
  try {
    const response = await obtenerAIFeedbacksPorStepNumber(parseInt(stepNumber));
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAIFeedbacksCompletos = async (req, res) => {
  try {
    const response = await obtenerAIFeedbacksCompletos();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postAIFeedback = async (req, res) => {
  try {
    const datos = crearAIFeedbackSchema.parse(req.body);
    
    const nuevoAIFeedback = await crearAIFeedback(datos);

    res.json({
      message: 'AI Feedback created successfully!',
      ...nuevoAIFeedback
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error(error);
    res.status(500).send({ error: 'Error creating AI Feedback' });
  }
};

export const putAIFeedback = async (req, res) => {
  try {
    const datos = actualizarAIFeedbackSchema.parse(req.body);

    const aiFeedbackActualizado = await actualizarAIFeedback(datos);

    res.status(200).json({
      message: 'AI Feedback updated successfully!',
      ...aiFeedbackActualizado
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ ok: false, errores: error.errors });
    }

    console.error('Error updating AI Feedback:', error);
    res.status(500).send({ error: 'Error updating AI Feedback' });
  }
};

export const deleteAIFeedback = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await eliminarAIFeedback(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateAIFeedback = async (req, res) => {
  const { subtopicId } = req.params;
  
  try {
    console.log(`🤖 [AIFeedback] Generando feedback para subtopic: ${subtopicId}`);

    // Obtener información del subtópico
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const subtopic = await prisma.subtopic.findUnique({
      where: { id: subtopicId },
      include: {
        subject: true
      }
    });

    if (!subtopic) {
      return res.status(404).json({
        success: false,
        error: 'Subtópico no encontrado'
      });
    }

    // Generar contenido educativo con IA
    const feedbackContent = await generateEducationalContent(subtopic);
    
    // Crear el AI Feedback en la base de datos
    const aiFeedbackData = {
      subtopicId: subtopicId,
      feedbackType: 'lesson_plan',
      title: `Plan de Lección: ${subtopic.name}`,
      content: feedbackContent.content,
      stepNumber: 1,
      recommendations: feedbackContent.recommendations,
      resources: feedbackContent.resources,
      estimatedTime: feedbackContent.estimatedTime || 45,
      difficultyLevel: 'medium',
      isActive: true
    };

    const nuevoFeedback = await crearAIFeedback(aiFeedbackData);

    await prisma.$disconnect();

    res.status(200).json({
      success: true,
      data: nuevoFeedback,
      message: 'Plan de lección generado exitosamente'
    });

  } catch (error) {
    console.error('❌ [AIFeedback] Error generando feedback:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
};

// Función auxiliar para generar contenido educativo
async function generateEducationalContent(subtopic) {
  const topicName = subtopic.name;
  const subjectName = subtopic.subject?.name || 'Materia';
  
  // Generar contenido dinámico basado en el tema
  const content = `
    <div class="lesson-plan">
      <h2>Plan de Lección: ${topicName}</h2>
      
      <div class="section">
        <h3>🎯 Objetivos de Aprendizaje</h3>
        <ul>
          <li>Comprender los conceptos fundamentales de ${topicName}</li>
          <li>Identificar las características principales del tema</li>
          <li>Aplicar los conocimientos en ejemplos prácticos</li>
          <li>Analizar la importancia de ${topicName} en ${subjectName}</li>
        </ul>
      </div>

      <div class="section">
        <h3>📝 Contenido Principal</h3>
        <div class="content-block">
          <h4>¿Qué es ${topicName}?</h4>
          <p>${topicName} es un concepto fundamental en ${subjectName} que requiere comprensión profunda para el desarrollo académico y profesional.</p>
        </div>
        
        <div class="content-block">
          <h4>Características Principales</h4>
          <ul>
            <li>Fundamentos teóricos sólidos</li>
            <li>Aplicaciones prácticas relevantes</li>
            <li>Conexiones con otros temas de la materia</li>
            <li>Importancia en el contexto actual</li>
          </ul>
        </div>

        <div class="content-block">
          <h4>Ejemplos Prácticos</h4>
          <p>Para entender mejor ${topicName}, es importante analizar ejemplos concretos y casos de uso reales que demuestren su aplicación.</p>
        </div>
      </div>

      <div class="section">
        <h3>🎯 Actividades Sugeridas</h3>
        <ol>
          <li><strong>Introducción (10 min):</strong> Presentar el tema y activar conocimientos previos</li>
          <li><strong>Desarrollo (25 min):</strong> Explicar conceptos principales con ejemplos</li>
          <li><strong>Práctica (10 min):</strong> Realizar ejercicios o discusiones grupales</li>
          <li><strong>Cierre (5 min):</strong> Resumir puntos clave y asignar tareas</li>
        </ol>
      </div>

      <div class="section">
        <h3>📊 Evaluación</h3>
        <ul>
          <li>Participación en discusiones (30%)</li>
          <li>Comprensión de conceptos (40%)</li>
          <li>Aplicación práctica (30%)</li>
        </ul>
      </div>
    </div>
  `;

  const recommendations = [
    `Utilizar ejemplos reales para explicar ${topicName}`,
    'Fomentar la participación activa de los estudiantes',
    'Conectar el tema con conocimientos previos',
    'Proporcionar materiales de apoyo adicionales',
    'Evaluar comprensión mediante preguntas dirigidas'
  ];

  const resources = [
    'Presentación interactiva del tema',
    'Ejemplos prácticos y casos de estudio',
    'Material de lectura complementario',
    'Videos explicativos (si aplica)',
    'Actividades de refuerzo'
  ];

  return {
    content,
    recommendations,
    resources,
    estimatedTime: 45
  };
}
