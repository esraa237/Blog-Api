const express = require("express");
const router = express.Router();
const path = require("path");
const postController = require(path.join(
  __dirname,
  "..",
  "controllers/postController.js"
));
const validate = require("../middleware/validation.js");
const auth = require("../middleware/auth.js");

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - text
 *         - author
 *       properties:
 *         text:
 *           type: string
 *         author:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *       example:
 *         text: "Great post!"
 *         author: "64f1c0a2e1a2b3c4d5e6f7b9"
 *         date: "2025-09-19T08:00:00Z"
 *
 *     Post:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - content
 *         - tags
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         author:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         title: "My First Post"
 *         content: "This is the content of my first post"
 *         author: "Name"
 *         tags: ["nodejs", "mongodb"]
 *         comments:
 *           - text: "Great post!"
 *             author: "Name"
 *             date: "2025-09-19T08:00:00Z"
 *         createdAt: "2025-09-19T08:00:00Z"
 *         updatedAt: "2025-09-19T08:00:00Z"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/posts/search:
 *   get:
 *     summary: Search posts by title or content
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 totalPosts:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *     security:
 *       - bearerAuth: []
 */

router.get("/search",  postController.searchPosts);
/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with pagination and optional filtering
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of posts per page (default 10)
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma separated)
 *     responses:
 *       200:
 *         description: List of posts with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 totalPosts:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *     security:
 *       - bearerAuth: []
 */

router.get("/", postController.getAllPosts);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               title: "My Post"
 *               content: "This is the content"
 *               tags: ["nodejs", "mongodb"]
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *     security:
 *       - bearerAuth: []
 */
router.post("/", validate.createPostSchema, postController.createpost);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", postController.getPostById);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post by ID (owner or admin)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               title: "Updated Post"
 *               content: "Updated content"
 *               tags: ["nodejs"]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       403:
 *         description: Not authorized
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", auth.verifyOwnershipOrAdmin, postController.updatePostById);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post by ID (owner or admin)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       403:
 *         description: Not authorized
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth.verifyOwnershipOrAdmin, postController.deletePostById);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *             example:
 *               text: "Great post!"
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/comments", postController.addCommentToPost);

module.exports = router;
