import { obtenerSubtopicPorId } from '../subtopic/subtopic.models.js';
import { crearAIFeedback } from '../aiFeedback/aiFeedback.models.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateAIFeedbackGeneration } from './dto/aiFeedbackGeneration.dto.js';
import { generateAIFeedbackPrompt } from './prompts/aiFeedbackGeneration.prompt.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
console.log(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
// Helper function to clean and parse JSON
const cleanJsonString = (text) => {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  return cleaned;
};

const parseToJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
};

export const generateAIFeedbackForSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params;

    // Validate subtopicId using DTO
    const validation = validateAIFeedbackGeneration({ subtopicId });
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subtopic ID format',
        details: validation.error.errors
      });
    }

    // Get subtopic information
    const subtopic = await obtenerSubtopicPorId(subtopicId);
    if (!subtopic) {
      return res.status(404).json({
        success: false,
        error: 'Subtopic not found'
      });
    }

    // Configure the AI model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192
      }, 
      responseMimeType: "application/json" // Force JSON output
    });

    // Create the system prompt using the external prompt file
    const systemPrompt = generateAIFeedbackPrompt(
      subtopic.name,
      subtopic.description,
      subtopic.subject.name
    );

    // Generate content using AI with retry logic
    let aiData;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`AI generation attempt ${attempts + 1}/${maxAttempts}`);
        
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Parse the AI response
        aiData = parseToJson(cleanJsonString(text));
        
        // Validate the response structure
        if (!aiData.steps || !Array.isArray(aiData.steps)) {
          throw new Error('Invalid response structure - missing steps array');
        }
        
        // Ensure we have exactly 5 steps
        if (aiData.steps.length !== 5) {
          console.log(`Received ${aiData.steps.length} steps, expected 5. Retrying...`);
          attempts++;
          continue;
        }
        
        // Validate each step has required fields and correct step numbers
        const validSteps = aiData.steps.every((step, index) => 
          step.stepNumber === (index + 1) && // Ensure step numbers are 1,2,3,4,5
          step.stepName && 
          step.content && 
          step.timeMinutes && 
          step.studentActivity && 
          step.timeAllocation && 
          step.materialsNeeded && 
          step.successIndicator
        );
        
        if (!validSteps) {
          console.log('Some steps missing required fields. Retrying...');
          attempts++;
          continue;
        }
        
        // Validate total time is reasonable (60-90 minutes)
        const totalTime = aiData.steps.reduce((sum, step) => sum + (step.timeMinutes || 0), 0);
        if (totalTime < 60 || totalTime > 90) {
          console.log(`Total time ${totalTime} minutes is outside acceptable range (60-90). Retrying...`);
          attempts++;
          continue;
        }
        
        // If we reach here, the response is valid
        console.log(`Successfully generated ${aiData.steps.length} steps with total time: ${totalTime} minutes`);
        break;
        
      } catch (parseErr) {
        console.error(`Attempt ${attempts + 1} failed:`, parseErr);
        attempts++;
        
        if (attempts >= maxAttempts) {
          console.error('All attempts failed. Raw output from last attempt:', text);
          return res.status(500).json({
            success: false,
            error: 'Failed to generate valid AI response after multiple attempts',
            details: parseErr.message
          });
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // If we still don't have valid data after all attempts, create a fallback structure
    if (!aiData || !aiData.steps || aiData.steps.length !== 5) {
      console.log('Creating fallback lesson plan structure...');
      
      aiData = {
        steps: [
          {
            stepNumber: 1,
            stepName: "Introduction and Engagement",
            content: `Begin the lesson by introducing ${subtopic.name}. Engage students with a thought-provoking question or real-world example related to this topic. Set clear learning objectives and explain what students will accomplish by the end of the lesson.`,
            timeMinutes: 15,
            studentActivity: "Students participate in a brief discussion about what they already know about this topic and share their initial thoughts.",
            timeAllocation: "5 min introduction, 8 min discussion, 2 min objective setting",
            materialsNeeded: "Whiteboard, markers, projector or display",
            successIndicator: "Students can articulate the main learning objectives and show initial engagement with the topic."
          },
          {
            stepNumber: 2,
            stepName: "Core Concept Development",
            content: `Present the main concepts of ${subtopic.name} through direct instruction, demonstrations, or guided discovery. Break down complex ideas into manageable parts and provide clear explanations with examples.`,
            timeMinutes: 25,
            studentActivity: "Students take notes, ask questions, and participate in guided practice with the teacher.",
            timeAllocation: "10 min direct instruction, 10 min guided practice, 5 min Q&A",
            materialsNeeded: "Presentation materials, handouts, examples or demonstrations",
            successIndicator: "Students can explain the key concepts in their own words and complete basic practice problems."
          },
          {
            stepNumber: 3,
            stepName: "Practice and Application",
            content: `Provide opportunities for students to apply their understanding of ${subtopic.name} through hands-on activities, problem-solving exercises, or collaborative work.`,
            timeMinutes: 25,
            studentActivity: "Students work individually or in small groups on practice problems, activities, or projects related to the topic.",
            timeAllocation: "5 min instructions, 15 min practice, 5 min group sharing",
            materialsNeeded: "Worksheets, practice problems, group materials, calculators if needed",
            successIndicator: "Students can successfully complete practice problems and demonstrate understanding through their work."
          },
          {
            stepNumber: 4,
            stepName: "Assessment and Feedback",
            content: `Assess student understanding of ${subtopic.name} through various formative assessment methods. Provide constructive feedback and address any misconceptions.`,
            timeMinutes: 15,
            studentActivity: "Students complete a brief assessment, participate in peer review, or engage in self-assessment activities.",
            timeAllocation: "8 min assessment, 5 min feedback, 2 min clarification",
            materialsNeeded: "Assessment materials, rubrics, feedback forms",
            successIndicator: "Students receive clear feedback on their progress and can identify areas for improvement."
          },
          {
            stepNumber: 5,
            stepName: "Closure and Reflection",
            content: `Summarize the key learning points from ${subtopic.name} and help students reflect on their learning journey. Connect the lesson to broader concepts and prepare for future learning.`,
            timeMinutes: 10,
            studentActivity: "Students participate in a brief reflection activity, share key takeaways, and discuss how this connects to other topics.",
            timeAllocation: "5 min summary, 3 min reflection, 2 min connection to future learning",
            materialsNeeded: "Reflection prompts, summary materials",
            successIndicator: "Students can summarize the main points and articulate how this learning connects to broader concepts."
          }
        ]
      };
      
      console.log('Fallback lesson plan created successfully');
    }

    // Final validation and normalization of the steps
    const normalizedSteps = aiData.steps.map((step, index) => ({
      ...step,
      stepNumber: index + 1, // Ensure step numbers are correct
      timeMinutes: parseInt(step.timeMinutes) || 15, // Ensure time is a number
      content: step.content.trim(),
      stepName: step.stepName.trim(),
      studentActivity: step.studentActivity.trim(),
      timeAllocation: step.timeAllocation.trim(),
      materialsNeeded: step.materialsNeeded.trim(),
      successIndicator: step.successIndicator.trim()
    }));
    
    // Create AI feedback records in database
    const createdFeedbacks = [];
    for (const step of normalizedSteps) {
      const feedbackData = {
        subtopicId: subtopicId,
        timeMinutes: step.timeMinutes,
        stepNumber: step.stepNumber,
        stepName: step.stepName,
        content: step.content,
        studentActivity: step.studentActivity,
        timeAllocation: step.timeAllocation,
        materialsNeeded: step.materialsNeeded,
        successIndicator: step.successIndicator
      };

      const createdFeedback = await crearAIFeedback(feedbackData);
      createdFeedbacks.push(createdFeedback);
    }

    return res.status(201).json({
      success: true,
      message: 'AI feedback generated successfully',
      data: {
        subtopic: {
          id: subtopic.id,
          name: subtopic.name,
          description: subtopic.description,
          subject: subtopic.subject
        },
        steps: createdFeedbacks
      }
    });

  } catch (error) {
    console.error('Error generating AI feedback:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate AI feedback',
      details: error.message
    });
  }
};
