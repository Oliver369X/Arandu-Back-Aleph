/**
 * @swagger
 * components:
 *   schemas:
 *     Grade:
 *       type: object
 *       required:
 *         - name
 *         - year
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the grade
 *           example: "789e0123-e89b-12d3-a456-426614174004"
 *         name:
 *           type: string
 *           maxLength: 50
 *           description: The grade's name
 *           example: "6th Grade A"
 *         year:
 *           type: integer
 *           description: Academic year
 *           example: 2025
 *     
 *     GradeCreate:
 *       type: object
 *       required:
 *         - name
 *         - year
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: The grade's name
 *           example: "7th Grade B"
 *         year:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *           description: Academic year
 *           example: 2025
 *     
 *     GradeUpdate:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The grade's UUID
 *           example: "789e0123-e89b-12d3-a456-426614174004"
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: The grade's name
 *           example: "6th Grade A Updated"
 *         year:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *           description: Academic year
 *           example: 2025
 *     
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Grade not found"
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
 *                 example: "Invalid grade name"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["name"]
 */

/**
 * @swagger
 * tags:
 *   name: Grades
 *   description: Grade management endpoints for the educational platform
 */

/**
 * @swagger
 * /grades:
 *   get:
 *     summary: Get all grades
 *     description: Retrieve a list of all grades in the educational platform
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of grades retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Grade'
 *             example:
 *               - id: "789e0123-e89b-12d3-a456-426614174004"
 *                 name: "6th Grade A"
 *                 year: 2025
 *               - id: "789e0123-e89b-12d3-a456-426614174005"
 *                 name: "7th Grade B"
 *                 year: 2025
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   post:
 *     summary: Create a new grade
 *     description: Create a new grade in the educational platform
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeCreate'
 *           example:
 *             name: "8th Grade C"
 *             year: 2025
 *     responses:
 *       200:
 *         description: Grade created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Grade creado con éxito!"
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "789e0123-e89b-12d3-a456-426614174006"
 *                 name:
 *                   type: string
 *                   example: "8th Grade C"
 *                 year:
 *                   type: integer
 *                   example: 2025
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
 *     summary: Update grade information
 *     description: Update an existing grade's information
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeUpdate'
 *           example:
 *             id: "789e0123-e89b-12d3-a456-426614174004"
 *             name: "6th Grade A Updated"
 *             year: 2025
 *     responses:
 *       200:
 *         description: Grade updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Grade actualizado con éxito!"
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "789e0123-e89b-12d3-a456-426614174004"
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
 * /grades/year/{year}:
 *   get:
 *     summary: Get grades by academic year
 *     description: Retrieve all grades for a specific academic year
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *         description: Academic year
 *         example: 2025
 *     responses:
 *       200:
 *         description: Grades for the year retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Grade'
 *             example:
 *               - id: "789e0123-e89b-12d3-a456-426614174004"
 *                 name: "6th Grade A"
 *                 year: 2025
 *               - id: "789e0123-e89b-12d3-a456-426614174005"
 *                 name: "7th Grade B"
 *                 year: 2025
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /grades/{id}:
 *   get:
 *     summary: Get grade by ID
 *     description: Retrieve a grade by its unique UUID
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Grade's unique UUID
 *         example: "789e0123-e89b-12d3-a456-426614174004"
 *     responses:
 *       200:
 *         description: Grade found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grade'
 *       404:
 *         description: Grade not found
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
 *     summary: Delete grade
 *     description: Delete a grade from the system
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Grade's unique UUID to delete
 *         example: "789e0123-e89b-12d3-a456-426614174004"
 *     responses:
 *       200:
 *         description: Grade deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               message: "Grade eliminado con éxito"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
