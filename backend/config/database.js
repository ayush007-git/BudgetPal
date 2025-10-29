import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// DATABASE_URL is expected for hosted Postgres (e.g., Supabase)
const databaseUrl = process.env.DATABASE_URL ||
  `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'password'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'budgetpal'}`;

// Determine SSL usage: enable for non-local databases by default or when DATABASE_SSL=true
const isLocal = /localhost|127\.0\.0\.1/i.test(databaseUrl);
const forceSsl = String(process.env.DATABASE_SSL || '').toLowerCase() === 'true';
const useSsl = !isLocal || forceSsl;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: useSsl ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

try {
  // Use Node's URL parser so we only print host & port (no password)
  const parsedDbUrl = new URL(databaseUrl);
  console.log('🔧 DB host:', parsedDbUrl.hostname);
  console.log('🔧 DB port:', parsedDbUrl.port || '(default 5432)');
  console.log('🔧 Sequelize dialect:', sequelize.getDialect());
} catch (err) {
  console.log('⚠️ Could not parse DATABASE_URL for host/port check:', err.message);
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error('PostgreSQL connection error:', error.message);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;
