import dotenv from 'dotenv';
import { createPool } from 'mariadb';

dotenv.config();

const pool = createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'my_database'
});

export const db = pool;
