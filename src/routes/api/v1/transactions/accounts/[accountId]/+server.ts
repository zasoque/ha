import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, params, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const accountId = params.accountId;
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '50';

	const transactions = await query(
		'SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
		[accountId, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
	);

	return json({ success: true, transactions });
};
