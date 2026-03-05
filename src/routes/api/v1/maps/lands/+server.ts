import { getMe } from '$lib/discord/users';
import { getAccount } from '$lib/server/account';
import { isAdmin } from '$lib/server/admin';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const lands = await query('SELECT * FROM lands');
	return json({ success: true, lands });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const owner_id = me.id;

	const { name, x, y, color, account_id, free } = await request.json();

	if (!name || !owner_id || x === undefined || y === undefined || !color) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const closestLand = await query(
		'SELECT id, ST_Distance(position, POINT(?, ?)) AS distance FROM lands ORDER BY distance ASC LIMIT 1',
		[x, y]
	);

	if (closestLand.length > 0 && closestLand[0].distance < 1.0) {
		return json(
			{ success: false, message: 'Land is too close to an existing land' },
			{ status: 400 }
		);
	}

	if (free) {
		if (!(await isAdmin(owner_id))) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}
	} else {
		const account = await getAccount(account_id);

		if (account.user_id !== owner_id) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}

		if (account.balance < 2.0) {
			return json({ success: false, message: 'Insufficient funds' }, { status: 400 });
		}

		await query('UPDATE accounts SET balance = balance - 2.0 WHERE id = ?', [account_id]);
		await query('INSERT INTO transactions (account_id, amount, type) VALUES (?, ?, ?)', [
			account_id,
			-2.0,
			'토지 개발'
		]);
	}

	const result = await query(
		'INSERT INTO lands (name, owner_id, position, color) VALUES (?, ?, POINT(?, ?), ?)',
		[name, owner_id, x, y, color]
	);

	if (result.affectedRows === 1) {
		return json({ success: true, message: 'Land created successfully' });
	} else {
		return json({ success: false, message: 'Failed to create land' }, { status: 500 });
	}
};
