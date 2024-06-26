import dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV.trim()}` })

export const HOST = process.env.DB_HOST;
export const USER = process.env.DB_USER;
export const PASSWORD = process.env.DB_PASSWORD;
export const DB = process.env.DB_DATABASE;
export const dialect = "mysql";
export const pool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
};



