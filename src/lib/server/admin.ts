import { query } from './db';

export async function isAdmin(id: string): Promise<boolean> {
	const result = await query('SELECT * FROM admin_users WHERE id = ?', [id]);
	return result.length > 0;
}
