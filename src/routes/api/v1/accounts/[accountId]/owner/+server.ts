import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const { accountId } = params;

	const [owner] = await query(
		'SELECT p.* FROM people p JOIN accounts a ON p.id = a.user_id WHERE a.id = ?',
		[accountId]
	);

	if (!owner) {
		return json({ success: false, error: 'Account not found' }, { status: 404 });
	}

	return json({ success: true, owner });
};
