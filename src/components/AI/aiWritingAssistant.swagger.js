/**
 * @swagger
 * components:
 *   schemas:
 *     AIGeneratedFeedback:
 *       type: object
 *       properties:
 *         subtopic:
 *           $ref: '#/components/schemas/Subtopic'
 *         steps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AIFeedback'
 *           description: Generated lesson steps for the subtopic
 *         totalTime:
 *           type: integer
 *           description: Total estimated time for the lesson in minutes
 *           example: 45
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Difficulty level of the generated content
 *           example: "intermediate"
 *         objectives:
 *           type: array
 *           items:
 *             type: string
 *           description: Learning objectives for this lesson
 *           example: ["Understand linear equations", "Solve basic linear problems"]
 *     
 *     AIGenerationRequest:
 *       type: object
 *       properties:
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Desired difficulty level
 *           example: "intermediate"
 *         duration:
 *           type: integer
 *           minimum: 15
 *           maximum: 180
 *           description: Desired lesson duration in minutes
 *           example: 45
 *         focus:
 *           type: string
 *           description: Specific focus or emphasis for the lesson
 *           example: "practical applications"
 *         studentLevel:
 *           type: string
 *           description: Target student level
 *           example: "high school"
 *     
 *     AIGenerationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the generation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: Success or error message
 *           example: "AI feedback generated successfully"
 *         data:
 *           $ref: '#/components/schemas/AIGeneratedFeedback'
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: When the content was generated
 *           example: "2024-01-01T00:00:00.000Z"
 *         tokensUsed:
 *           type: integer
 *           description: Number of AI tokens used for generation
 *           example: 1250
 *     
 *     AIGenerationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Subtopic not found or AI service unavailable"
 *         code:
 *           type: string
 *           description: Error code for debugging
 *           example: "SUBTOPIC_NOT_FOUND"
 *         details:
 *           type: object
 *           description: Additional error details
 *           properties:
 *             subtopicId:
 *               type: string
 *               example: "456e7890-e89b-12d3-a456-426614174001"
 *             timestamp:
 *               type: string
 *               format: date-time
 *               example: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: AI Writing Assistant
 *   description: AI-powered content generation for educational materials
 */

/**
 * @swagger
 * /ai-writing-assistant/generate-feedback/{subtopicId}:
 *   post:
 *     summary: Generate AI feedback for subtopic
 *     description: Generate comprehensive AI-powered teaching feedback and lesson plan for a specific subtopic
 *     tags: [AI Writing Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The subtopic UUID to generate feedback for
 *         example: "456e7890-e89b-12d3-a456-426614174001"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIGenerationRequest'
 *           example:
 *             difficulty: "intermediate"
 *             duration: 45
 *             focus: "practical applications and real-world examples"
 *             studentLevel: "high school"
 *     responses:
 *       200:
 *         description: AI feedback generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIGenerationResponse'
 *             example:
 *               success: true
 *               message: "AI feedback generated successfully"
 *               data:
 *                 subtopic:
 *                   id: "456e7890-e89b-12d3-a456-426614174001"
 *                   name: "Linear Equations"
 *                   description: "Introduction to solving linear equations"
 *                 steps:
 *                   - id: "789e1234-e89b-12d3-a456-426614174002"
 *                     stepNumber: 1
 *                     stepName: "Introduction to Linear Equations"
 *                     content: "Begin by explaining what linear equations are..."
 *                     timeAllocation: "10 minutes"
 *                     studentActivity: "Students identify linear vs non-linear equations"
 *                     materialsNeeded: "Whiteboard, worksheets"
 *                     successIndicator: "Students can distinguish linear equations"
 *                   - id: "abc5678-e89b-12d3-a456-426614174003"
 *                     stepNumber: 2
 *                     stepName: "Solving Basic Linear Equations"
 *                     content: "Demonstrate step-by-step solving process..."
 *                     timeAllocation: "15 minutes"
 *                     studentActivity: "Practice solving 5 basic equations"
 *                     materialsNeeded: "Practice worksheets, calculators"
 *                     successIndicator: "Students solve 80% correctly"
 *                 totalTime: 45
 *                 difficulty: "intermediate"
 *                 objectives:
 *                   - "Understand what linear equations are"
 *                   - "Solve basic linear equations"
 *                   - "Apply linear equations to real-world problems"
 *               generatedAt: "2024-01-01T00:00:00.000Z"
 *               tokensUsed: 1250
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIGenerationError'
 *             example:
 *               success: false
 *               error: "Invalid subtopic ID or generation parameters"
 *               code: "INVALID_PARAMETERS"
 *               details:
 *                 subtopicId: "invalid-uuid"
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: Subtopic not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIGenerationError'
 *             example:
 *               success: false
 *               error: "Subtopic not found"
 *               code: "SUBTOPIC_NOT_FOUND"
 *               details:
 *                 subtopicId: "456e7890-e89b-12d3-a456-426614174001"
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       429:
 *         description: AI service rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIGenerationError'
 *             example:
 *               success: false
 *               error: "AI service rate limit exceeded. Please try again later."
 *               code: "RATE_LIMIT_EXCEEDED"
 *               details:
 *                 retryAfter: 60
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       500:
 *         description: Internal server error or AI service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIGenerationError'
 *             example:
 *               success: false
 *               error: "AI service temporarily unavailable"
 *               code: "AI_SERVICE_ERROR"
 *               details:
 *                 service: "OpenAI GPT-4"
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       503:
 *         description: AI service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIGenerationError'
 *             example:
 *               success: false
 *               error: "AI service is currently under maintenance"
 *               code: "SERVICE_UNAVAILABLE"
 *               details:
 *                 estimatedRecovery: "2024-01-01T02:00:00.000Z"
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 */

