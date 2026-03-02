import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const limit = url.searchParams.get('limit') || '20';
	const page = url.searchParams.get('page') || '1';

	const products = await query('SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?', [
		parseInt(limit),
		(parseInt(page) - 1) * parseInt(limit)
	]);

	return json({ success: true, products });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { name, description, price } = await request.json();

	if (!name || !description || !price) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const token = cookies.get('token');
	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	await query('INSERT INTO products (name, price, description, owner_id) VALUES (?, ?, ?, ?)', [
		name,
		price,
		description,
		me.id
	]);

	return json({ success: true, message: 'Product created successfully' });
};
