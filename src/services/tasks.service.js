const Joi = require('joi');
const prisma = require('../config/prisma');

const createTaskSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().allow('', null),
  assignedTo: Joi.number().integer().required(),
  customerId: Joi.number().integer().required(),
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'DONE').optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'DONE').required(),
});

const createTask = async (payload) => {
  const { error } = createTaskSchema.validate(payload);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const { title, description, assignedTo, customerId, status } = payload;

  const employee = await prisma.user.findUnique({ where: { id: assignedTo } });
  if (!employee || employee.role !== 'EMPLOYEE') {
    const err = new Error('Assigned user must exist and have role EMPLOYEE');
    err.statusCode = 404;
    throw err;
  }

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    const err = new Error('Customer not found');
    err.statusCode = 404;
    throw err;
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      assignedTo,
      customerId,
      status: status || 'PENDING',
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  return task;
};

const getTasks = async (currentUser) => {
  const isAdmin = currentUser.role === 'ADMIN';

  const where = isAdmin ? {} : { assignedTo: currentUser.userId };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { id: 'asc' },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  return tasks;
};

const updateTaskStatus = async (id, currentUser, payload) => {
  const { error } = updateStatusSchema.validate(payload);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  const isAdmin = currentUser.role === 'ADMIN';

  if (!isAdmin && task.assignedTo !== currentUser.userId) {
    const err = new Error('Forbidden: cannot update task of another user');
    err.statusCode = 403;
    throw err;
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { status: payload.status },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  return updated;
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
};
