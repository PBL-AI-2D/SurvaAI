import pg from 'pg';
import db from '../models/index.js';

export const isProduction = process.env.NODE_ENV === 'production';
export const dbProvider = process.env.DB_TYPE || 'local';

const baseConfig = {
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
};

const configs = {
  local: {
    ...baseConfig,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  neon: {
    ...baseConfig,
    use_env_variable: 'NEON_DATABASE_URL',
    ssl: { rejectUnauthorized: false },
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  },
  supabase: {
    ...baseConfig,
    use_env_variable: 'SUPABASE_DATABASE_URL',
    ssl: { rejectUnauthorized: false },
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  },
};

const selectedConfig = configs[dbProvider];
if (!selectedConfig) {
  throw new Error(`Unknown DB_TYPE: ${dbProvider}`);
}

export default selectedConfig;

export const testDatabaseConnection = async () => {
  try {
    await db.sequelize.authenticate();
    console.log(`✅ Database connected successfully: [${process.env.DB_TYPE || 'local'}]`);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};
