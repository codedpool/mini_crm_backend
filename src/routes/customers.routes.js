const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.post(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  customersController.createCustomer
);

router.get(
  '/',
  authMiddleware,
  requireRole(['ADMIN', 'EMPLOYEE']),
  customersController.getCustomers
);

router.get(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN', 'EMPLOYEE']),
  customersController.getCustomerById
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  customersController.updateCustomer
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  customersController.deleteCustomer
);

module.exports = router;
