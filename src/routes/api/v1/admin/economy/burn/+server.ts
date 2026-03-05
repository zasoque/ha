import { getMe } from '$lib/discord/users';
import { getAccount } from '$lib/server/account';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
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

	const { amount, account } = await request.json();

	if (!amount || !account) {
		return json({ success: false, error: 'Missing parameters' }, { status: 400 });
	}

	const accountObject = await getAccount(account);

	if (!accountObject) {
		return json({ success: false, error: 'Account not found' }, { status: 404 });
	}

	if (accountObject.balance < parseFloat(amount)) {
		return json({ success: false, error: 'Insufficient funds' }, { status: 400 });
	}

	await query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, accountObject.id]);
	await query(
		"INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, 'withdrawal', '화폐 소각')",
		[accountObject.id, amount]
	);

	return json({ success: true });
};
