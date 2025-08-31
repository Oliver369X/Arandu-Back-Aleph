/**
 * @swagger
 * components:
 *   schemas:
 *     Progress:
 *       type: object
 *       required:
 *         - userId
 *         - subtopicId
 *         - progressType
 *         - percentage
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the progress entry
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The user (student or teacher) this progress belongs to
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         subtopicId:
 *           type: string
 *           format: uuid
 *           description: The subtopic this progress is for
 *           example: "789e1234-e89b-12d3-a456-426614174002"
 *         progressType:
 *           type: string
 *           maxLength: 20
 *           enum: [learning, teaching, mastery]
 *           description: Type of progress being tracked
 *           example: "learning"
 *         percentage:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           maximum: 100
 *           description: Progress percentage (0.00-100.00)
 *           example: 75.50
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the progress was completed (if 100%)
 *           example: "2024-01-01T00:00:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Progress creation timestamp
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Progress last update timestamp
 *           example: "2024-01-01T00:00:00.000Z"
 *         user:
 *           $ref: '#/components/schemas/User'
 *         subtopic:
 *           $ref: '#/components/schemas/Subtopic'
 *     
 *     ProgressCreate:
 *       type: object
 *       required:
 *         - userId
 *         - subtopicId
 *         - progressType
 *         - percentage
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The user this progress belongs to
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         subtopicId:
 *           type: string
 *           format: uuid
 *           description: The subtopic this progress is for
 *           example: "789e1234-e89b-12d3-a456-426614174002"
 *         progressType:
 *           type: string
 *           enum: [learning, teaching, mastery]
 *           description: Type of progress being tracked
 *           example: "learning"
 *         percentage:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           maximum: 100
 *           description: Progress percentage (0.00-100.00)
 *           example: 75.50
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the progress was completed (if 100%)
 *           example: "2024-01-01T00:00:00.000Z"
 *     
 *     ProgressUpdate:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The progress entry's UUID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The user this progress belongs to
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         subtopicId:
 *           type: string
 *           format: uuid
 *           description: The subtopic this progress is for
 *           example: "789e1234-e89b-12d3-a456-426614174002"
 *         progressType:
 *           type: string
 *           enum: [learning, teaching, mastery]
 *           description: Type of progress being tracked
 *           example: "mastery"
 *         percentage:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           maximum: 100
 *           description: Progress percentage (0.00-100.00)
 *           example: 100.00
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the progress was completed
 *           example: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Progress tracking endpoints for students and teachers
 */

/**
 * @swagger
 * /progress:
 *   get:
 *     summary: Get all progress entries
 *     description: Retrieve a list of all progress entries in the system
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of progress entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Progress'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   post:
 *     summary: Create new progress entry
 *     description: Create a new progress tracking entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProgressCreate'
 *           example:
 *             userId: "456e7890-e89b-12d3-a456-426614174001"
 *             subtopicId: "789e1234-e89b-12d3-a456-426614174002"
 *             progressType: "learning"
 *             percentage: 75.50
 *     responses:
 *       200:
 *         description: Progress entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Progreso creado con éxito!"
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
 *     summary: Update progress entry
 *     description: Update an existing progress entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProgressUpdate'
 *     responses:
 *       200:
 *         description: Progress entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Progreso actualizado con éxito!"
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
 * /progress/completado:
 *   get:
 *     summary: Get completed progress entries
 *     description: Retrieve all progress entries that are 100% completed
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Completed progress entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Progress'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /progress/usuario/{userId}:
 *   get:
 *     summary: Get progress by user
 *     description: Retrieve all progress entries for a specific user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User's UUID
 *         example: "456e7890-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: User progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Progress'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /progress/subtopic/{subtopicId}:
 *   get:
 *     summary: Get progress by subtopic
 *     description: Retrieve all progress entries for a specific subtopic
 *     tags: [Progress]
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
 *         example: "789e1234-e89b-12d3-a456-426614174002"
 *     responses:
 *       200:
 *         description: Subtopic progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Progress'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /progress/tipo/{progressType}:
 *   get:
 *     summary: Get progress by type
 *     description: Retrieve all progress entries of a specific type
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: progressType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [learning, teaching, mastery]
 *         description: Progress type
 *         example: "learning"
 *     responses:
 *       200:
 *         description: Progress by type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Progress'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /progress/{id}:
 *   get:
 *     summary: Get progress by ID
 *     description: Retrieve a specific progress entry by its UUID
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Progress entry's UUID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Progress entry found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Progress'
 *       404:
 *         description: Progress entry not found
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
 *     summary: Delete progress entry
 *     description: Delete a progress entry from the system
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Progress entry's UUID to delete
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Progress entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               message: "Progreso eliminado con éxito"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

