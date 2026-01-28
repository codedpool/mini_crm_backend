const tasksService = require('../services/tasks.service');

const createTask = async (req, res) => {
  try {
    const task = await tasksService.createTask(req.body);
    return res.status(201).json(task);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ message: err.message || 'Internal server error' });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await tasksService.getTasks(req.user);
    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await tasksService.updateTaskStatus(id, req.user, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ message: err.message || 'Internal server error' });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
};
