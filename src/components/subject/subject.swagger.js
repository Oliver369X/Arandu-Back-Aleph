/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the subject
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: The subject's name
 *           example: "Mathematics"
 *         description:
 *           type: string
 *           nullable: true
 *           description: The subject's description
 *           example: "Advanced mathematics covering algebra, geometry, and calculus"
 *         subtopics:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subtopic'
 *           description: List of subtopics under this subject
 *         assignments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClassAssignment'
 *           description: List of class assignments for this subject
 *     
 *     SubjectCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: The subject's name
 *           example: "Physics"
 *         description:
 *           type: string
 *           description: The subject's description
 *           example: "Introduction to physics principles and applications"
 *     
 *     SubjectUpdate:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The subject's UUID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: The subject's name
 *           example: "Advanced Physics"
 *         description:
 *           type: string
 *           description: The subject's description
 *           example: "Advanced physics covering quantum mechanics and relativity"
 *     
 *     Subtopic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         name:
 *           type: string
 *           example: "Linear Equations"
 *         description:
 *           type: string
 *           example: "Introduction to solving linear equations"
 *         subjectId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Subject not found"
 *         error:
 *           type: string
 *           description: Detailed error information
 *           example: "Database connection failed"
 *     
 *     ValidationError:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: false
 *         errores:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "invalid_string"
 *               message:
 *                 type: string
 *                 example: "Subject name is required"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["name"]
 */

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Subject management endpoints for the educational platform
 */

/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: Get all subjects
 *     description: Retrieve a list of all subjects in the educational platform
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subjects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 *             example:
 *               - id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Mathematics"
 *                 description: "Advanced mathematics covering algebra and geometry"
 *               - id: "456e7890-e89b-12d3-a456-426614174001"
 *                 name: "Physics"
 *                 description: "Introduction to physics principles"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   post:
 *     summary: Create a new subject
 *     description: Create a new subject in the educational platform
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubjectCreate'
 *           example:
 *             name: "Chemistry"
 *             description: "Introduction to chemical principles and reactions"
 *     responses:
 *       200:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Materia creada con éxito!"
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "789e1234-e89b-12d3-a456-426614174002"
 *                 name:
 *                   type: string
 *                   example: "Chemistry"
 *                 description:
 *                   type: string
 *                   example: "Introduction to chemical principles and reactions"
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
 *     summary: Update subject information
 *     description: Update an existing subject's information
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubjectUpdate'
 *           example:
 *             id: "123e4567-e89b-12d3-a456-426614174000"
 *             name: "Advanced Mathematics"
 *             description: "Advanced mathematics including calculus and statistics"
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Materia actualizada con éxito!"
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
 */

/**
 * @swagger
 * /subjects/con-subtopics:
 *   get:
 *     summary: Get subjects with subtopics
 *     description: Retrieve all subjects including their subtopics
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subjects with subtopics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Subject'
 *                   - type: object
 *                     properties:
 *                       subtopics:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Subtopic'
 *             example:
 *               - id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Mathematics"
 *                 description: "Advanced mathematics"
 *                 subtopics:
 *                   - id: "456e7890-e89b-12d3-a456-426614174001"
 *                     name: "Linear Equations"
 *                     description: "Solving linear equations"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /subjects/nombre/{name}:
 *   get:
 *     summary: Get subject by name
 *     description: Retrieve a subject by its name
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Subject's name
 *         example: "Mathematics"
 *     responses:
 *       200:
 *         description: Subject found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       404:
 *         description: Subject not found
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
 */

/**
 * @swagger
 * /subjects/{id}:
 *   get:
 *     summary: Get subject by ID
 *     description: Retrieve a subject by its unique UUID
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subject's unique UUID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Subject found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       404:
 *         description: Subject not found
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
 *     summary: Delete subject
 *     description: Delete a subject from the system
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subject's unique UUID to delete
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               message: "Materia eliminada con éxito"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

