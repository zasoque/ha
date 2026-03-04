import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'No token found' });
	}

	const me = await getMe(token);
	const userId = me.id;

	const accounts = await query('SELECT * FROM accounts WHERE user_id = ?', [userId]);

	if (accounts.length === 0) {
		return json({ success: false, message: 'No accounts found for this user' });
	}

	return json({ success: true, accounts });
};

export const POST: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'No token found' });
	}

	const me = await getMe(token);
	const userId = me.id;

	await query('INSERT INTO accounts (user_id) VALUES (?)', [userId]);

	return json({ success: true, message: 'Account created successfully' });
};
