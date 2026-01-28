const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management
 */

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create customer (ADMIN only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate email or phone
 */
router.post(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  customersController.createCustomer
);

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get customers with pagination and optional search (ADMIN + EMPLOYEE)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or company (case-insensitive)
 *     responses:
 *       200:
 *         description: Paginated customer list
 */
router.get(
  '/',
  authMiddleware,
  requireRole(['ADMIN', 'EMPLOYEE']),
  customersController.getCustomers
);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer by id (ADMIN + EMPLOYEE)
 *     tags: [Customers]
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
 *         description: Customer found
 *       404:
 *         description: Customer not found
 */
router.get(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN', 'EMPLOYEE']),
  customersController.getCustomerById
);

/**
 * @swagger
 * /customers/{id}:
 *   patch:
 *     summary: Update customer (ADMIN only)
 *     tags: [Customers]
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated
 *       404:
 *         description: Customer not found
 */
router.patch(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  customersController.updateCustomer
);

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Delete customer (ADMIN only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Customer deleted
 *       404:
 *         description: Customer not found
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  customersController.deleteCustomer
);

module.exports = router;
