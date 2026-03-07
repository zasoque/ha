import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, cookies, request }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const corporationId = params.corporationId;

	if (!corporationId) {
		return json({ success: false, message: 'Corporation ID is required' }, { status: 400 });
	}

	const members = await query('SELECT * FROM corporation_members WHERE corporation_id = ?', [
		corporationId
	]);

	if (!members.some((m: any) => m.user_id === me.id) && !(await isAdmin(me.id))) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { user_id } = await request.json();

	if (!user_id) {
		return json({ success: false, message: 'Missing user_id' }, { status: 400 });
	}

	const person = await query('SELECT * FROM people WHERE id = ?', [user_id]);
	if (person.length === 0) {
		return json({ success: false, message: 'User not found' }, { status: 404 });
	}

	await query('INSERT INTO corporation_members (corporation_id, user_id) VALUES (?, ?)', [
		corporationId,
		user_id
	]);

	return json({ success: true });
};
