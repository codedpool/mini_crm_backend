const Joi = require('joi');
const prisma = require('../config/prisma');

const createCustomerSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().required(),
  company: Joi.string().trim().allow(null, ''),
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email(),
  phone: Joi.string().trim(),
  company: Joi.string().trim().allow(null, ''),
}).min(1);

const createCustomer = async (data) => {
  const { error } = createCustomerSchema.validate(data);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  try {
    const customer = await prisma.customer.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return customer;
  } catch (e) {
    if (e.code === 'P2002') {
      const err = new Error('Email or phone already exists');
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
};

const getCustomers = async ({ page = 1, limit = 10 }) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [totalRecords, data] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.findMany({
      skip,
      take: limitNum,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalRecords / limitNum) || 1;

  return {
    page: pageNum,
    limit: limitNum,
    totalRecords,
    totalPages,
    data,
  };
};

const getCustomerById = async (id) => {
  return prisma.customer.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const updateCustomer = async (id, payload) => {
  const { error } = updateCustomerSchema.validate(payload);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  try {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  } catch (e) {
    if (e.code === 'P2002') {
      const err = new Error('Email or phone already exists');
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
};

const deleteCustomer = async (id) => {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  await prisma.customer.delete({ where: { id } });
  return true;
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
