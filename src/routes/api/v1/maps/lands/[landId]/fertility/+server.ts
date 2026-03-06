import { getMe } from '$lib/discord/users';
import { getAccount } from '$lib/server/account';
import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, cookies, url }) => {
	const token = cookies.get('token');

	if (!token) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const me = await getMe(token);

	if (!me) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const { landId } = params;

	const land = await query('SELECT * FROM lands WHERE id = ?', [landId]);

	if (land.length === 0) {
		return json({ success: false, message: 'Land not found' }, { status: 404 });
	}

	const level = Number(url.searchParams.get('level'));
	const account_id = Number(url.searchParams.get('account_id'));

	if (isNaN(level) || isNaN(account_id)) {
		return json({ success: false, message: 'Missing required fields' }, { status: 400 });
	}

	const account = await getAccount(account_id);

	if (!account) {
		return json({ success: false, message: 'Account not found' }, { status: 404 });
	}

	if (account.user_id !== me.id) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const cost = 0.75 * Math.pow(2, level - 1);

	if (account.balance < cost) {
		return json({ success: false, message: 'Insufficient funds' }, { status: 400 });
	}

	await query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [cost, account_id]);
	await query(
		'INSERT INTO transactions (account_id, amount, type, description) VALUES (?, ?, ?, ?)',
		[account_id, -cost, 'withdrawal', `토지 #${landId} 비옥도 조사 ${level}단계 비용`]
	);

	const fertility = land[0].fertility;

	const max = Math.ceil(fertility * Math.pow(2, level)) / Math.pow(2, level);
	const min = Math.floor(fertility * Math.pow(2, level)) / Math.pow(2, level);

	return json({ success: true, min, max });
};
