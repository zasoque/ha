import { query } from './db';

export async function getUserName(userId: string): Promise<string> {
	const username = await query('SELECT * FROM people WHERE id = ?', [userId]);
	if (username.length === 0) {
		return 'Unknown';
	}

	return username[0].name;
}
