import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '50';

	const corporationmembers = await query('SELECT * FROM corporation_members LIMIT ? OFFSET ?', [
		parseInt(limit),
		(parseInt(page) - 1) * parseInt(limit)
	]);

	return json({ success: true, corporationmembers });
};
