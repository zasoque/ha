import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params }) => {
	const id = params.notificationId;

	await query('UPDATE notifications SET is_read = true WHERE id = ?', [id]);

	return json({ success: true });
};
