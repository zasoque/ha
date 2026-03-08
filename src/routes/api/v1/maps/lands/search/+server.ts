import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');

	if (!q) {
		return json({ success: true, lands: [] });
	}

	const offset = (page - 1) * limit;

	const lands = await query('SELECT * FROM lands WHERE id = ? OR name LIKE ? LIMIT ? OFFSET ?', [
		q,
		`%${q}%`,
		limit,
		offset
	]);

	return json({ success: true, lands });
};
