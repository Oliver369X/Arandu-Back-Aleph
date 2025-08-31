/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User's password
 *           example: "password123"
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Login success status
 *           example: true
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Login exitoso"
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         data:
 *           type: object
 *           description: User data
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: User's unique ID
 *               example: "123e4567-e89b-12d3-a456-426614174000"
 *             name:
 *               type: string
 *               description: User's full name
 *               example: "John Doe"
 *             email:
 *               type: string
 *               format: email
 *               description: User's email
 *               example: "john.doe@example.com"
 *             image:
 *               type: string
 *               nullable: true
 *               description: User's profile image URL
 *               example: "https://example.com/avatar.jpg"
 *             bio:
 *               type: string
 *               nullable: true
 *               description: User's biography
 *               example: "Mathematics teacher"
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *               description: User's assigned roles
 *               example: ["teacher", "admin"]
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Account creation date
 *               example: "2024-01-01T00:00:00.000Z"
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Last update date
 *               example: "2024-01-01T00:00:00.000Z"
 *     
 *     LoginError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Login success status
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Credenciales inválidas"
 *     
 *     ValidationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Datos inválidos"
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
 *                 example: "Invalid email format"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["email"]
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication endpoints for the educational platform
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and return a JWT token with user data
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "teacher@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               success: true
 *               message: "Login exitoso"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "John Doe"
 *                 email: "teacher@example.com"
 *                 image: "https://example.com/avatar.jpg"
 *                 bio: "Mathematics teacher"
 *                 roles: ["teacher"]
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               success: false
 *               error: "Datos inválidos"
 *               errores:
 *                 - code: "invalid_string"
 *                   message: "Invalid email format"
 *                   path: ["email"]
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginError'
 *             example:
 *               success: false
 *               error: "Credenciales inválidas"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginError'
 *             example:
 *               success: false
 *               error: "Error interno del servidor"
 */

