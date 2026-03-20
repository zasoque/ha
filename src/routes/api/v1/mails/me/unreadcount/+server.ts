import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'No token provided' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Invalid token' }, { status: 401 });
	}

	const [count] = await query('SELECT COUNT(*) FROM mails WHERE recipient = ? AND is_read = 0', [
		me.id
	]);

	return json({ success: true, unreadcount: parseInt(count['COUNT(*)']) });
};
