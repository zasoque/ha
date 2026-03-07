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

export const POST: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'No token found' });
	}

	const me = await getMe(token);

	const { user_id } = await request.json();

	const person = await query('SELECT * FROM people WHERE id = ?', [user_id]);

	if (person.length === 0) {
		return json({ success: false, message: 'User not found in people table' });
	}

	if (person[0].type === 'corporation') {
		const members = await query('SELECT * FROM corporation_members WHERE corporation_id = ?', [
			user_id
		]);
		const memberIds = members.map((member: any) => member.user_id);
		if (!memberIds.includes(me.id)) {
			return json({ success: false, message: 'User is not a member of this corporation' });
		}
	} else {
		if (user_id !== me.id) {
			return json({ success: false, message: 'User ID does not match token' });
		}
	}

	await query('INSERT INTO accounts (user_id) VALUES (?)', [user_id]);

	return json({ success: true, message: 'Account created successfully' });
};
