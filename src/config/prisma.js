const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient(); // no options in v6

module.exports = prisma;
