import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env by default
dotenv.config();

const isProd = process.env.STAGE === 'prod';

// For DigitalOcean/Azure managed Postgres, SSL is required in prod.
// We mirror the Nest config: enable SSL and don't require CA validation by default.
const sslExtra = isProd ? { ssl: { rejectUnauthorized: false } } : undefined;

// Configurar zona horaria de Nicaragua
process.env.TZ = 'America/Managua';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: isProd,
  extra: {
    ...sslExtra,
    timezone: 'America/Managua',
  },
  // Use globs for entities/migrations when running CLI in TS
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
  // logging: true,
});

export default dataSource;
