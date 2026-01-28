const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create task (ADMIN only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, assignedTo, customerId]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, DONE]
 *               assignedTo:
 *                 type: integer
 *               customerId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created
 *       404:
 *         description: Assigned user or customer not found
 */
router.post(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  tasksController.createTask
);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get tasks (ADMIN: all, EMPLOYEE: own)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get(
  '/',
  authMiddleware,
  requireRole(['ADMIN', 'EMPLOYEE']),
  tasksController.getTasks
);

/**
 * @swagger
 * /tasks/{id}/status:
 *   patch:
 *     summary: Update task status
 *     tags: [Tasks]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, DONE]
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Forbidden for non-owner employee
 *       404:
 *         description: Task not found
 */
router.patch(
  '/:id/status',
  authMiddleware,
  requireRole(['ADMIN', 'EMPLOYEE']),
  tasksController.updateTaskStatus
);

module.exports = router;
