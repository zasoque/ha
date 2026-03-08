import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');

	if (!q) {
		return json({ success: true, accounts: [] });
	}

	const offset = (page - 1) * limit;

	const buildings = await query(
		'SELECT * FROM buildings WHERE id = ? OR name LIKE ? LIMIT ? OFFSET ?',
		[q, `%${q}%`, limit, offset]
	);

	return json({ success: true, buildings });
};
