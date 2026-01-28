const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Admin-only user management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  usersController.getUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by id (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  usersController.getUserById
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user role (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, EMPLOYEE]
 *     responses:
 *       200:
 *         description: User role updated
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  usersController.updateUserRole
);

module.exports = router;
