import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const { roadId } = params;

	const road = await query('SELECT * FROM roads WHERE id = ?', [roadId]);

	if (road.length === 0) {
		return json({ success: false, message: 'Road not found' }, { status: 404 });
	}

	return json({ success: true, road: road[0] });
};

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { roadId } = params;
	const { name } = await request.json();

	if (!name) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const road = await query('SELECT * FROM roads WHERE id = ?', [roadId]);

	if (road.length === 0) {
		return json({ success: false, message: 'Road not found' }, { status: 404 });
	}

	if (road[0].owner_id !== me.id && !(await isAdmin(me.id))) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	await query('UPDATE roads SET name = ? WHERE id = ?', [name, roadId]);

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { roadId } = params;

	const road = await query('SELECT * FROM roads WHERE id = ?', [roadId]);

	if (road.length === 0) {
		return json({ success: false, message: 'Road not found' }, { status: 404 });
	}

	if (road[0].owner_id !== me.id && !(await isAdmin(me.id))) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	await query('DELETE FROM roads WHERE id = ?', [roadId]);

	return json({ success: true });
};
