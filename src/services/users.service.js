const Joi = require('joi');
const prisma = require('../config/prisma');

const roleSchema = Joi.string().valid('ADMIN', 'EMPLOYEE').required();

const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { id: 'asc' },
  });
};

const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

const updateUserRole = async (id, role) => {
  const { error } = roleSchema.validate(role);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return null;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return updated;
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
};
