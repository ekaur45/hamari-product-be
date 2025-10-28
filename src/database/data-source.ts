import 'dotenv/config';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment file based on NODE_ENV
const envFile = `environments/.env.${process.env.NODE_ENV || 'development'}`;
config({ path: envFile });
// console.log({
//   type: 'mysql',
//   host: process.env.DB_HOST,
//   port: 3306,
//   username: process.env.DB_USER,
//   password: process.env.DB_PASS || "",
//   database: process.env.DB_NAME,
//   synchronize: false,
//   entities: [__dirname + 'entities/**/*{.ts,.js}'],
//   migrations: [__dirname + '/migrations/*{.ts,.js}'],
// });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
