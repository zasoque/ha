import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/*
 * CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255),
    balance DECIMAL(20, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
*/

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
