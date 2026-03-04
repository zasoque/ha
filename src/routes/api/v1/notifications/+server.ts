import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'No token provided' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, error: 'Invalid token' }, { status: 401 });
	}

	const notifications = await query(
		'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
		[me.id]
	);

	return json({ success: true, notifications });
};
