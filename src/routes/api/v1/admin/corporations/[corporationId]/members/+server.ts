import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request, params }) => {
	const corporationId = params.corporationId;

	if (!corporationId) {
		return json({ success: false, message: 'Corporation ID is required' }, { status: 400 });
	}

	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	if (!(await isAdmin(me.id))) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	const { user_id } = await request.json();

	if (!user_id) {
		return json({ success: false, message: 'User ID is required' }, { status: 400 });
	}

	await query('INSERT INTO corporation_members (corporation_id, user_id) VALUES (?, ?)', [
		corporationId,
		user_id
	]);

	return json({ success: true, message: 'User added to corporation' });
};

export const DELETE: RequestHandler = async ({ cookies, request, params }) => {
	const corporationId = params.corporationId;

	if (!corporationId) {
		return json({ success: false, message: 'Corporation ID is required' }, { status: 400 });
	}

	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	if (!(await isAdmin(me.id))) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	const { user_id } = await request.json();

	if (!user_id) {
		return json({ success: false, message: 'User ID is required' }, { status: 400 });
	}

	await query('DELETE FROM corporation_members WHERE corporation_id = ? AND user_id = ?', [
		corporationId,
		user_id
	]);

	return json({ success: true, message: 'User removed from corporation' });
};
