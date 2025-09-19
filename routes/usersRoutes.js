const express = require("express");
const router = express.Router();
const path = require("path");
const userController = require(path.join(
  __dirname,
  "..",
  "controllers/userController.js"
));
const validate = require("../middleware/validation.js");
const auth = require("../middleware/auth.js");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-incremented user ID
 *         name:
 *           type: string
 *           description: The user's full name
 *         email:
 *           type: string
 *           description: The user's email address
 *         password:
 *           type: string
 *           description: The user's hashed password
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User role
 *       example:
 *         id: 1
 *         name: John Doe
 *         email: john@example.com
 *         password: 123456
 *         role: user
 */

/**
 * @swagger
 * 
 * /api/users:
 *   get:
 *     summary: Get all users (paginated)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *     security:
 *       bearerAuth: []
 *       components:
 *         securitySchemes:
 *           bearerAuth:
 *             type: http
 *             scheme: bearer
 *             bearerFormat: JWT
 */


router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user (admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *     security:
 *       bearerAuth: []
 *       components:
 *         securitySchemes:
 *           bearerAuth:
 *             type: http
 *             scheme: bearer
 *             bearerFormat: JWT
 *
 */
router.post(
  "/",
  auth.authorizeRoles("admin"),
  validate.validateSignUp,
  userController.createUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *     security:
 *       bearerAuth: []
 *       components:
 *         securitySchemes:
 *           bearerAuth:
 *             type: http
 *             scheme: bearer
 *             bearerFormat: JWT
 */
router.get("/:id", userController.getUserById);


/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the user
 *               email:
 *                 type: string
 *                 description: The new email of the user
 *               password:
 *                 type: string
 *                 description: The new password of the user
 *             example:
 *               name: Updated Name
 *               email: updated@example.com
 *               password: newpassword123
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *     security:
 *       bearerAuth: []
 *       components:
 *         securitySchemes:
 *           bearerAuth:
 *             type: http
 *             scheme: bearer
 *             bearerFormat: JWT
 */
router.put("/:id", userController.updateUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "User with id 1 deleted"
 *       404:
 *         description: User not found
 *     security:
 *       bearerAuth: []
 *       components:
 *         securitySchemes:
 *           bearerAuth:
 *             type: http
 *             scheme: bearer
 *             bearerFormat: JWT
 */
router.delete("/:id", userController.deleteUserById);

module.exports = router;
