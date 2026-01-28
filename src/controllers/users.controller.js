const usersService = require('../services/users.service');

const getUsers = async (req, res) => {
  try {
    const users = await usersService.getUsers();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await usersService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    const updated = await usersService.updateUserRole(id, role);

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(updated);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ message: err.message || 'Internal server error' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
};
