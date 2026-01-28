const customersService = require('../services/customers.service');

const createCustomer = async (req, res) => {
  try {
    const customer = await customersService.createCustomer(req.body);
    return res.status(201).json(customer);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ message: err.message || 'Internal server error' });
  }
};

const getCustomers = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await customersService.getCustomers({ page, limit });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const customer = await customersService.getCustomerById(id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json(customer);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await customersService.updateCustomer(id, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json(updated);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ message: err.message || 'Internal server error' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await customersService.deleteCustomer(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
