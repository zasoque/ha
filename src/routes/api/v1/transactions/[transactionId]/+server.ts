import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, params }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { transactionId } = params;
	const me = await getMe(token);

	const transaction = await query(
		'SELECT * FROM transactions WHERE id = ? AND account_id = (SELECT account_id FROM accounts WHERE user_id = ?)',
		[transactionId, me.id]
	);

	if (!transaction) {
		return json({ success: false, message: 'Transaction not found' }, { status: 404 });
	}

	return json({ success: true, transaction });
};
