import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  host: process.env['DB_HOST'],
  port: parseInt(process.env['DB_PORT'] ?? '5432'),
  user: process.env['DB_USER'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_NAME'],
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
});

export default pool;
