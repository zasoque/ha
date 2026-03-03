import { getMe } from '$lib/discord/users';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const { amount, account } = await request.json();

	if (!amount || !account) {
		return json({ success: false, error: 'Amount and account are required' }, { status: 400 });
	}

	if (isNaN(Number(amount)) || Number(amount) <= 0) {
		return json({ success: false, error: 'Amount must be a positive number' }, { status: 400 });
	}

	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	if (!(await isAdmin(me.id))) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	await query(
		"INSERT INTO transactions (account_id, amount, type, description) VALUES(?, ?, 'deposit', '발행')",
		[account, amount]
	);
	await query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, account]);

	return json({ success: true });
};
