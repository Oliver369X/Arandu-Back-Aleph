/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - permissions
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the role
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         name:
 *           type: string
 *           maxLength: 50
 *           description: The role's name (unique)
 *           example: "teacher"
 *         description:
 *           type: string
 *           description: The role's description
 *           example: "Teacher with classroom management permissions"
 *         permissions:
 *           type: string
 *           description: JSON string containing role permissions
 *           example: '{"read": true, "write": true, "delete": false, "admin": false}'
 *     
 *     RoleCreate:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - permissions
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: The role's name (must be unique)
 *           example: "student"
 *         description:
 *           type: string
 *           minLength: 5
 *           description: The role's description (min 5 characters)
 *           example: "Student with basic access permissions"
 *         permissions:
 *           type: string
 *           minLength: 1
 *           description: JSON string containing role permissions
 *           example: '{"read": true, "write": false, "delete": false, "admin": false}'
 *     
 *     RoleUpdate:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The role's UUID
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: The role's name (must be unique)
 *           example: "senior_teacher"
 *         description:
 *           type: string
 *           minLength: 5
 *           description: The role's description (min 5 characters)
 *           example: "Senior teacher with advanced permissions"
 *         permissions:
 *           type: string
 *           minLength: 1
 *           description: JSON string containing role permissions
 *           example: '{"read": true, "write": true, "delete": true, "admin": false}'
 *     
 *     UserWithRole:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The user's UUID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         name:
 *           type: string
 *           description: The user's name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           description: The user's email
 *           example: "john.doe@example.com"
 *         roleId:
 *           type: string
 *           format: uuid
 *           description: The assigned role UUID
 *           example: "456e7890-e89b-12d3-a456-426614174001"
 *         roleName:
 *           type: string
 *           description: The assigned role name
 *           example: "teacher"
 *     
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Role not found"
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
 *                 example: "Invalid role name"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["name"]
 */

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management endpoints for the educational platform
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     description: Retrieve a list of all roles in the educational platform
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *             example:
 *               - id: "456e7890-e89b-12d3-a456-426614174001"
 *                 name: "teacher"
 *                 description: "Teacher with classroom management permissions"
 *                 permissions: '{"read": true, "write": true, "delete": false, "admin": false}'
 *               - id: "456e7890-e89b-12d3-a456-426614174002"
 *                 name: "student"
 *                 description: "Student with basic access permissions"
 *                 permissions: '{"read": true, "write": false, "delete": false, "admin": false}'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   
 *   post:
 *     summary: Create a new role
 *     description: Create a new role in the educational platform
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleCreate'
 *           example:
 *             name: "admin"
 *             description: "Administrator with full system access"
 *             permissions: '{"read": true, "write": true, "delete": true, "admin": true}'
 *     responses:
 *       200:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol creado con éxito!"
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "456e7890-e89b-12d3-a456-426614174003"
 *                 name:
 *                   type: string
 *                   example: "admin"
 *                 description:
 *                   type: string
 *                   example: "Administrator with full system access"
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
 *     summary: Update role information
 *     description: Update an existing role's information
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleUpdate'
 *           example:
 *             id: "456e7890-e89b-12d3-a456-426614174001"
 *             name: "senior_teacher"
 *             description: "Senior teacher with advanced permissions"
 *             permissions: '{"read": true, "write": true, "delete": true, "admin": false}'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol actualizado con éxito!"
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "456e7890-e89b-12d3-a456-426614174001"
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
 * /roles/activos:
 *   get:
 *     summary: Get active roles
 *     description: Retrieve a list of all active roles in the system
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *             example:
 *               - id: "456e7890-e89b-12d3-a456-426614174001"
 *                 name: "teacher"
 *                 description: "Teacher with classroom management permissions"
 *                 permissions: '{"read": true, "write": true, "delete": false, "admin": false}'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /roles/permisos:
 *   get:
 *     summary: Get roles by permissions
 *     description: Retrieve roles that have specific permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: permissions
 *         schema:
 *           type: string
 *         description: Comma-separated list of permissions to filter by
 *         example: "read,write"
 *     responses:
 *       200:
 *         description: Roles with specified permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *             example:
 *               - id: "456e7890-e89b-12d3-a456-426614174001"
 *                 name: "teacher"
 *                 description: "Teacher with classroom management permissions"
 *                 permissions: '{"read": true, "write": true, "delete": false, "admin": false}'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /roles/nombre/{name}:
 *   get:
 *     summary: Get role by name
 *     description: Retrieve a role by its name
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 50
 *         description: Role's name
 *         example: "teacher"
 *     responses:
 *       200:
 *         description: Role found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
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
 * /roles/usuarios/{roleId}:
 *   get:
 *     summary: Get users with specific role
 *     description: Retrieve all users that have a specific role assigned
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role's UUID to find users for
 *         example: "456e7890-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Users with role retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserWithRole'
 *             example:
 *               - id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *                 roleId: "456e7890-e89b-12d3-a456-426614174001"
 *                 roleName: "teacher"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     description: Retrieve a role by its unique UUID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role's unique UUID
 *         example: "456e7890-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Role found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
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
 *     summary: Delete role
 *     description: Delete a role from the system
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role's unique UUID to delete
 *         example: "456e7890-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               message: "Rol eliminado con éxito"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

