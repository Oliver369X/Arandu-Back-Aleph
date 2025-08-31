/**
 * @swagger
 * components:
 *   schemas:
 *     AIFeedback:
 *       type: object
 *       required:
 *         - subtopicId
 *         - timeMinutes
 *         - stepNumber
 *         - stepName
 *         - content
 *         - timeAllocation
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the AI feedback
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         subtopicId:
 *           type: string
 *           format: uuid
 *           description: The subtopic this feedback belongs to
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         timeMinutes:
 *           type: integer
 *           description: Total lesson time in minutes
 *           example: 45
 *         stepNumber:
 *           type: integer
 *           description: Order of this step in the lesson
 *           example: 1
 *         stepName:
 *           type: string
 *           maxLength: 100
 *           description: Name of this lesson step
 *           example: "Introduction to Linear Equations"
 *         content:
 *           type: string
 *           description: Detailed content for this step
 *           example: "Begin by explaining what a linear equation is and provide simple examples"
 *         studentActivity:
 *           type: string
 *           nullable: true
 *           maxLength: 455
 *           description: Activity for students during this step
 *           example: "Students solve 3 basic linear equations on their worksheets"
 *         timeAllocation:
 *           type: string
 *           maxLength: 455
 *           description: Time allocation for this step
 *           example: "10 minutes"
 *         materialsNeeded:
 *           type: string
 *           nullable: true
 *           maxLength: 400
 *           description: Materials needed for this step
 *           example: "Whiteboard, markers, worksheets"
 *         successIndicator:
 *           type: string
 *           nullable: true
 *           maxLength: 400
 *           description: How to measure success of this step
 *           example: "Students can identify linear equations correctly"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2024-01-01T00:00:00.000Z"
 *         subtopic:
 *           $ref: '#/components/schemas/Subtopic'
 *     
 *     AIFeedbackCreate:
 *       type: object
 *       required:
 *         - subtopicId
 *         - timeMinutes
 *         - stepNumber
 *         - stepName
 *         - content
 *         - timeAllocation
 *       properties:
 *         subtopicId:
 *           type: string
 *           format: uuid
 *           description: The subtopic this feedback belongs to
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         timeMinutes:
 *           type: integer
 *           minimum: 1
 *           maximum: 300
 *           description: Total lesson time in minutes
 *           example: 45
 *         stepNumber:
 *           type: integer
 *           minimum: 1
 *           description: Order of this step in the lesson
 *           example: 1
 *         stepName:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Name of this lesson step
 *           example: "Introduction to Linear Equations"
 *         content:
 *           type: string
 *           minLength: 1
 *           description: Detailed content for this step
 *           example: "Begin by explaining what a linear equation is and provide simple examples"
 *         studentActivity:
 *           type: string
 *           maxLength: 455
 *           description: Activity for students during this step
 *           example: "Students solve 3 basic linear equations on their worksheets"
 *         timeAllocation:
 *           type: string
 *           minLength: 1
 *           maxLength: 455
 *           description: Time allocation for this step
 *           example: "10 minutes"
 *         materialsNeeded:
 *           type: string
 *           maxLength: 400
 *           description: Materials needed for this step
 *           example: "Whiteboard, markers, worksheets"
 *         successIndicator:
 *           type: string
 *           maxLength: 400
 *           description: How to measure success of this step
 *           example: "Students can identify linear equations correctly"
 *     
 *     AIFeedbackUpdate:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The AI feedback's UUID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         subtopicId:
 *           type: string
 *           format: uuid
 *           description: The subtopic this feedback belongs to
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         timeMinutes:
 *           type: integer
 *           minimum: 1
 *           maximum: 300
 *           description: Total lesson time in minutes
 *           example: 50
 *         stepNumber:
 *           type: integer
 *           minimum: 1
 *           description: Order of this step in the lesson
 *           example: 2
 *         stepName:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Name of this lesson step
 *           example: "Advanced Linear Equations"
 *         content:
 *           type: string
 *           minLength: 1
 *           description: Detailed content for this step
 *           example: "Introduce more complex linear equations with multiple variables"
 *         studentActivity:
 *           type: string
 *           maxLength: 455
 *           description: Activity for students during this step
 *           example: "Students work in pairs to solve complex equations"
 *         timeAllocation:
 *           type: string
 *           minLength: 1
 *           maxLength: 455
 *           description: Time allocation for this step
 *           example: "15 minutes"
 *         materialsNeeded:
 *           type: string
 *           maxLength: 400
 *           description: Materials needed for this step
 *           example: "Calculators, advanced worksheets"
 *         successIndicator:
 *           type: string
 *           maxLength: 400
 *           description: How to measure success of this step
 *           example: "Students solve 80% of problems correctly"
 */

/**
 * @swagger
 * tags:
 *   name: AI Feedback
 *   description: AI-generated teaching feedback and lesson planning endpoints
 */

/**
 * @swagger
 * /ai-feedback:
 *   get:
 *     summary: Get all AI feedback
 *     description: Retrieve a list of all AI-generated teaching feedback
 *     tags: [AI Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of AI feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AIFeedback'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   post:
 *     summary: Create new AI feedback
 *     description: Create a new AI feedback entry for lesson planning
 *     tags: [AI Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIFeedbackCreate'
 *           example:
 *             subtopicId: "456e7890-e89b-12d3-a456-426614174001"
 *             timeMinutes: 45
 *             stepNumber: 1
 *             stepName: "Introduction to Algebra"
 *             content: "Start with basic algebraic concepts and notation"
 *             studentActivity: "Students practice identifying variables"
 *             timeAllocation: "10 minutes"
 *             materialsNeeded: "Whiteboard, worksheets"
 *             successIndicator: "Students can identify variables in equations"
 *     responses:
 *       200:
 *         description: AI feedback created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "AI Feedback creado con éxito!"
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   put:
 *     summary: Update AI feedback
 *     description: Update an existing AI feedback entry
 *     tags: [AI Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIFeedbackUpdate'
 *     responses:
 *       200:
 *         description: AI feedback updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "AI Feedback actualizado con éxito!"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /ai-feedback/completos:
 *   get:
 *     summary: Get complete AI feedback
 *     description: Retrieve AI feedback with complete lesson information
 *     tags: [AI Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Complete AI feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/AIFeedback'
 *                   - type: object
 *                     properties:
 *                       subtopic:
 *                         $ref: '#/components/schemas/Subtopic'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /ai-feedback/subtopic/{subtopicId}:
 *   get:
 *     summary: Get AI feedback by subtopic
 *     description: Retrieve all AI feedback for a specific subtopic
 *     tags: [AI Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subtopic's UUID
 *         example: "456e7890-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: AI feedback for subtopic retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AIFeedback'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /ai-feedback/step/{stepNumber}:
 *   get:
 *     summary: Get AI feedback by step number
 *     description: Retrieve AI feedback for a specific step number
 *     tags: [AI Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepNumber
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Step number
 *         example: 1
 *     responses:
 *       200:
 *         description: AI feedback for step retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AIFeedback'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /ai-feedback/{id}:
 *   get:
 *     summary: Get AI feedback by ID
 *     description: Retrieve a specific AI feedback by its UUID
 *     tags: [AI Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: AI feedback's UUID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: AI feedback found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIFeedback'
 *       404:
 *         description: AI feedback not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   delete:
 *     summary: Delete AI feedback
 *     description: Delete an AI feedback entry from the system
 *     tags: [AI Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: AI feedback's UUID to delete
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: AI feedback deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               message: "AI Feedback eliminado con éxito"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

