import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const { id } = await request.json();

	if (!id) {
		return json({ success: false, error: 'User ID is required' }, { status: 400 });
	}

	await query('DELETE FROM admin_users WHERE id = ?', [id]);

	return json({ success: true });
};

export const PUT: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const { residence, name, id } = await request.json();

	if (!residence || !name) {
		return json({ success: false, error: 'Residence and name are required' }, { status: 400 });
	}

	await query('UPDATE people SET residence = ?, name = ? WHERE id = ?', [residence, name, id]);

	return json({ success: true });
};
