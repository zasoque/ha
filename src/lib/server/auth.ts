import { query } from './db';

export async function ensureAccountExists(userId: string) {
	const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
	if (result.length === 0) {
		await query('INSERT INTO users (id) VALUES ($1)', [userId]);
	}
}
