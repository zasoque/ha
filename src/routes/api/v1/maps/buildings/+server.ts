import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const buildings = await query('SELECT * FROM buildings');
	return json({ success: true, buildings });
};
