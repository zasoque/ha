import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') || '';

	const laws = await query(
		'SELECT lc.content, l.name, l.id, lc.created_at FROM law_contents lc JOIN ( SELECT law_id, MAX(created_at) AS max_created FROM law_contents GROUP BY law_id) latest ON lc.law_id = latest.law_id AND lc.created_at = latest.max_created JOIN laws l ON lc.law_id = l.id WHERE lc.content LIKE ?;',
		[`%${q}%`]
	);

	return json({ success: true, laws });
};
