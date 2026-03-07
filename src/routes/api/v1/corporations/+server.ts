import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const corporations = await query(
		"SELECT * FROM people p JOIN corporation_members m ON m.corporation_id = p.id WHERE p.type = 'corporation' AND m.user_id = ?",
		[me.id]
	);

	return json({ success: true, corporations });
};
