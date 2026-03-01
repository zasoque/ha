import { getMe } from '$lib/discord/users';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'No token found' }, { status: 401 });
	}

	const { fromAccountId, toAccountId, amount, description } = await request.json();

	if (!fromAccountId || !toAccountId || !amount) {
		return json({ success: false, message: 'Missing required parameters' }, { status: 400 });
	}

	if (amount <= 0) {
		return json({ success: false, message: 'Amount must be greater than zero' }, { status: 400 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Invalid token' }, { status: 401 });
	}

	const [fromAccount] = await query('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [
		fromAccountId,
		me.id
	]);

	if (!fromAccount) {
		return json(
			{ success: false, message: 'From account not found or does not belong to the user' },
			{ status: 404 }
		);
	}

	if (fromAccount.balance < amount) {
		return json(
			{ success: false, message: 'Insufficient funds in the from account' },
			{ status: 400 }
		);
	}

	const toAccount = await query('SELECT * FROM accounts WHERE id = ?', [toAccountId]);

	if (toAccount.length === 0) {
		return json({ success: false, message: 'To account not found' }, { status: 404 });
	}

	await query(
		`INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)`,
		[fromAccountId, -amount, 'transfer', description || '']
	);
	await query(
		`INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)`,
		[toAccountId, amount, 'transfer', description || '']
	);
	await query(`UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?`, [
		amount,
		fromAccountId,
		me.id
	]);
	await query(`UPDATE accounts SET balance = balance + ? WHERE id = ?`, [amount, toAccountId]);

	return json({ success: true, message: 'Transaction created successfully' });
};
