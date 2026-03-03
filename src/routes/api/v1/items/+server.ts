import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '50';

	const items = await query('SELECT * FROM items LIMIT ? OFFSET ?', [
		parseInt(limit),
		(parseInt(page) - 1) * parseInt(limit)
	]);

	return json({ success: true, items });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { name, description } = await request.json();

	if (!name || !description) {
		return json({ success: false, message: 'Name and description are required' }, { status: 400 });
	}

	await query('INSERT INTO items (name, description, maker) VALUES (?, ?, ?)', [
		name,
		description,
		me.id
	]);

	return json({ success: true, message: 'Item created' });
};
