import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const itemId = params.itemId;

	const item = await query('SELECT * FROM items WHERE id = ?', [itemId]);

	if (item.length === 0) {
		return json({ success: false, message: 'Item not found' }, { status: 404 });
	}

	return json({ success: true, item: item[0] });
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

	const item = await query('SELECT * FROM items WHERE id = ?', [params.itemId]);

	if (item.length === 0) {
		return json({ success: false, message: 'Item not found' }, { status: 404 });
	}

	if (item[0].maker !== me.id) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	const { name, description } = await request.json();

	if (!name || !description) {
		return json({ success: false, message: 'Name and description are required' }, { status: 400 });
	}

	await query('UPDATE items SET name = ?, description = ? WHERE id = ?', [
		name,
		description,
		params.itemId
	]);

	return json({ success: true, message: 'Item updated' });
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

	const item = await query('SELECT * FROM items WHERE id = ?', [params.itemId]);

	if (item.length === 0) {
		return json({ success: false, message: 'Item not found' }, { status: 404 });
	}

	if (item[0].maker !== me.id) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	await query('DELETE FROM items WHERE id = ?', [params.itemId]);

	return json({ success: true, message: 'Item deleted' });
};
