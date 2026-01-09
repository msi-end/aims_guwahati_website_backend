
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully (Prisma)');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
  console.log('Database disconnected');
};

module.exports = {
  prisma,
  testConnection,
  disconnectDB
};