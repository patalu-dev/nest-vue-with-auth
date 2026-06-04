import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Permission } from './permissions/entities/permission.entity';

dotenv.config();

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbDatabase = process.env.DB_DATABASE;

if (!dbHost || !dbPort || !dbUsername || !dbPassword || !dbDatabase) {
  throw new Error('Database environment variables (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE) are required');
}

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: dbHost,
  port: parseInt(dbPort, 10),
  username: dbUsername,
  password: dbPassword,
  database: dbDatabase,
  entities: [User, Role, Permission],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
